import express from "express";
import fs from 'fs';
import csv from "csv-parser";
import jStat from "jstat";
import { allowedCustomVariables, allowedCustomComparators } from "../../../data/custom-variables";

/**
 * Type definition for a single data record.
 */
type Result = {
    TAB: string,
    INDICATOR: string,
    ATTRIBUTE_TYPE: string,
    SUMMARIZE_BY: string,
    subject_id: string,
    site_id: string,
    site_country: string,
    discharge_quarter: string,
    discharge_year: string,
    variable: string,
    Value: string,
    YQ: string
};

/**
 * Groups an array of objects by a specified key.
 * @param arr - The array of objects to group.
 * @param key - A function that extracts the key to group by.
 * @returns A record where the keys are the grouped values and the values are arrays of objects.
 */
const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
    arr.reduce((groups, item) => {
        (groups[key(item)] ||= []).push(item);
        return groups;
    }, {} as Record<K, T[]>);

/**
* Calculates the median of an array of numbers.
* @param values - Array of numbers to calculate the median for.
* @returns The median value.
*/
const median = (values: number[]): number => {
    values.sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    if (values.length % 2 === 1) {
        return values[middle];
    };
    return (values[middle - 1] + values[middle]) / 2;
};

/**
 * Calculates the mean of an array of numbers.
 * @param values - Array of numbers to calculate the mean for.
 * @returns The mean value.
 */
const mean = (values: number[]): number => {
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum === 0 ? 0 : sum / values.length;
};

/**
 * Calculates the sum of an array of numbers.
 * @param numbers - Array of numbers to calculate the sum for.
 * @returns The total sum.
 */
const sum = (numbers: number[]): number => {
    return numbers.reduce((acc, curr) => acc + curr, 0);
};

/**
 * Parses quarter strings (e.g., "Q1", "Q2") into numbers.
 * @param quarterStr - The quarter string to parse.
 * @returns The numerical representation of the quarter or NaN if invalid.
 */
function parseQuarter(quarterStr: string): number {
    switch (quarterStr) {
        case "Q1": return 1;
        case "Q2": return 2;
        case "Q3": return 3;
        case "Q4": return 4;
        default: return NaN;
    };
};

const dataFilePath = `${process.cwd()}/data/dataREanonymized_long.csv`;

const results: Result[] = [];
let isLoadingData = false;
const waintingCallbacks: Function[] = [];

/**
 * Reads data from a CSV file and returns it as an array of Result objects.
 * Implements caching to avoid reloading data if already available.
 * @returns A promise that resolves to an array of Result objects.
 */
const getDataFromFile: () => Promise<Result[]> = () => {
    return new Promise<Result[]>((resolve, reject) => {
        if (results.length > 0 && !isLoadingData) {
            resolve(results)
        }
        else if (isLoadingData) {
            waintingCallbacks.push(() => {
                resolve(results)
            })
        }
        else {
            isLoadingData = true;
            fs.createReadStream(dataFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    if (row.SUMMARIZE_BY === "%") row.SUMMARIZE_BY = "percentage";
                    results.push(row);
                })
                .once('end', () => {
                    isLoadingData = false;
                    resolve(results);
                    waintingCallbacks.forEach(c => c());
                })
                .once("error", (err) => reject(err));
        };
    });
};

/**
 * Supported operations and their compatible variable types.
 */
const supportedDataOperations: Record<string, string[]> = {
    median: ["quantitative"],
    percentage: ["categorical", "categorical_binary"],
    mean: ["quantitative"],
    count: ["categorical_binary", "quantitative"]
};

const dataApi = express.Router();

/**
 * Handles POST requests for data aggregation.
 * Performs validation, filtering, and aggregation of the requested data.
 */
dataApi.post("/:categoryName/:variableName", async (req, res) => {
    const { categoryName, variableName } = req.params;
    const { filters } = req.body;
    const allData = await getDataFromFile();

    if (categoryName?.toLowerCase().replace(/[-\s]/g, "_") === "custom_variables") {

        const variableSet = new Set(allowedCustomVariables.map(v => v.toLowerCase()));
        const variableKey = (filters?.variable ?? variableName).toLowerCase();

        if (!variableSet.has(variableKey)) {
            return res.status(400).json({ error: "Variable non autorisée" });
        }

        let variableData = allData.filter(
            d => d.variable.toLowerCase() === variableKey && d.Value !== ""
        );

        const rawComparator = filters?.comparator;
        const rawValue = filters?.comparisonValue;

        let comparator = undefined;
        let comparisonValue = undefined;

        if (typeof rawComparator === "string" && allowedCustomComparators.includes(rawComparator)) {
            comparator = rawComparator;
        }

        if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
            const n = Number(rawValue);
            if (!isNaN(n)) comparisonValue = n;
        }

        if (comparator && comparisonValue !== undefined) {

            variableData = variableData.filter(d => {
                const value = Number(d.Value);
                if (isNaN(value)) return false;

                switch (comparator) {
                    case "<": return value < comparisonValue;
                    case ">": return value > comparisonValue;
                    case "=": return value === comparisonValue;
                    default: return true;
                }
            });
        }

        if (filters?.country) {
            variableData = variableData.filter(d => d.site_country === filters.country);
        }
        if (filters?.site) {
            variableData = variableData.filter(d => d.site_id === filters.site);
        }
        
        if (variableData.length === 0) {
            return res.status(200).json({
                labels: [],
                datasets: [{ label: variableKey, data: [] }]
            });
        }

        console.log("Comparator reçu:", comparator, "Value:", comparisonValue);

        const grouped = groupBy(variableData, d => d.YQ);
        const labels = Object.keys(grouped).sort();

        const data = labels.map(label => {
            const values = grouped[label]
                .map(r => Number(r.Value))
                .filter(v => !isNaN(v));

            if (!values.length) return null;

            const avg = values.reduce((a, b) => a + b, 0) / values.length;

            return Math.min(100, Math.max(0, avg));
        });



        return res.json({
            labels,
            datasets: [{ label: variableKey, data }]
        });
    }
    
    if (categoryName?.toLowerCase() === "angel_awards") 
    {
        try {
            const allData = await getDataFromFile();
            let variableKey = variableName.toLowerCase();
            let raw: Result[];
            let threshold: number | string;

            if (variableKey.startsWith("door_to_needle")) {
                raw = allData.filter(d => d.variable.toLowerCase() === "door_to_needle" && d.Value !== "");
                if (variableKey.endsWith("_60")) threshold = 60;
                else if (variableKey.endsWith("_45")) threshold = 45;
                else return res.status(400).json({ error: "Unknown threshold for door_to_needle" });
            } else if (variableKey.startsWith("door_to_groin")) {
                raw = allData.filter(d => d.variable.toLowerCase() === "door_to_groin" && d.Value !== "");
                if (variableKey.endsWith("_120")) threshold = 120;
                else if (variableKey.endsWith("_90")) threshold = 90;
                else return res.status(400).json({ error: "Unknown threshold for door_to_groin" });
            } else if (variableKey.startsWith("stroke_undergoing_dysphagia_screening")) {
                let filteredData = allData.filter(d => d.variable.toLowerCase() === "dysphagia_screening_type");

                if (filters?.country) {
                    filteredData = filteredData.filter(d => d.site_country === filters.country);
                }
                if (filters?.site) {
                    filteredData = filteredData.filter(d => d.site_id === filters.site);
                }

                const grouped = groupBy(filteredData, d => d.YQ);
                const labels = Object.keys(grouped).sort();

                const data = labels.map(label => {
                    const allForLabel = grouped[label]; 
                    if (!allForLabel || allForLabel.length === 0) return null;

                    const screenedForLabel = allForLabel.filter(d => d.Value && d.Value.trim() !== "");
                    const countScreened = screenedForLabel.length;
                    const totalPatients = allForLabel.length;

                    return (countScreened / totalPatients) * 100;
                });

                return res.json({
                    labels,
                    datasets: [
                        {
                            label: "Percentage of stroke patients undergoing dysphagia screening",
                            data
                        }
                    ]
                });
            } else if (variableKey.startsWith("imaging_ct")) {
                let filteredData = allData.filter(d => d.variable.toLowerCase() === "imaging_type");

                if (filters?.country) {
                    filteredData = filteredData.filter(d => d.site_country === filters.country);
                }
                if (filters?.site) {
                    filteredData = filteredData.filter(d => d.site_id === filters.site);
                }

                const grouped = groupBy(filteredData, d => d.YQ);
                const labels = Object.keys(grouped).sort();

                const data = labels.map(label => {
                    const values = grouped[label].map(i => i.Value.toLowerCase());
                    if (values.length === 0) return null;

                    const countCT = values.filter(v => v.includes("ct")).length;
                    return (countCT / values.length) * 100;
                });

                return res.json({
                    labels,
                    datasets: [
                        {
                            label: "Percentage of CT imaging",
                            data
                        }
                    ]
                });
            } else {
                return res.status(400).json({ error: "Unknown angel_awards variable" });
            }
        
            let filtered = raw;

            if (filters?.country) {
                filtered = filtered.filter(d => d.site_country === filters.country);
            }

            if (filters?.site) {
                filtered = filtered.filter(d => d.site_id === filters.site);
            }               

            const grouped = groupBy(filtered, d => d.YQ);

            const computeThresholdData = (grouped: Record<string, Result[]>, threshold: number | string) => {
                const labels = Object.keys(grouped).sort();

                const data = labels.map(label => {
                    const values = grouped[label].map(i => i.Value).filter(v => v !== "");

                    if (values.length === 0) return null;

                    if (typeof threshold === "number") {
                        const count = values.map(Number).filter(v => !isNaN(v) && v <= threshold).length;
                        return (count / values.length) * 100;
                    } else {
                        const count = values.filter(v => v.includes(threshold as string)).length;
                        return (count / values.length) * 100;
                    }
                });

                return { labels, data };
            };

            const result = computeThresholdData(grouped, threshold);

            return res.json({
                labels: result.labels,
                datasets: [
                    {
                        label: typeof threshold === "number" ? `Percentage ≤ ${threshold} min` : `Percentage of ${threshold}`,
                        data: result.data
                    }
                ]
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Door-to-Needle calculation failed" });
        }
    }    

    /**
     * Filters and processes data based on the request parameters, then sends the response.
     */
    const getAndSendData = async <T extends string>(categoryName: string, variableName: string, aggregationType: T, variableType: string, filters?: SectionModule.Filters) => {
        if (!Object.keys(supportedDataOperations).includes(aggregationType.toLowerCase())) return res.status(400).json({ error: "Invalid aggregationType parameter!" });
        if (!(supportedDataOperations[aggregationType] ?? []).includes(variableType.toLowerCase())) return res.status(400).json({ error: "Invalid variableType parameter!" });
        
        const allData = await getDataFromFile();
        let filteredData;
        const variableKey = variableName.toLowerCase();
        const isCustom = allowedCustomVariables.map(v => v.toLowerCase()).includes(variableKey);
        if (isCustom) {
            filteredData = allData.filter(row => row.variable.toLowerCase() === variableName.toLowerCase() && row.Value !== "");
        } else {
            filteredData = allData.filter(row =>
                row.TAB.toLowerCase() === categoryName.toLowerCase() &&
                row.variable.toLowerCase() === variableName.toLowerCase() &&
                row.Value !== ""
            );
        }
        
        let filteredByCountry = filteredData;
        let filteredBySite = filteredData;

        if (filters) {
            if (filters.country) {
                filteredByCountry = filteredData.filter(d => d.site_country === filters.country)
            };

            if (filters.country && filters.site) {
                filteredBySite = filteredData.filter(d => d.site_id === filters.site);
            };

            if (filters.firstYearQuarter && filters.secondYearQuarter) {
                filteredData = filteredData.filter(d => {

                    let quarter = parseQuarter(d.discharge_quarter);
                    let year = parseInt(d.discharge_year);

                    if (isNaN(quarter) || isNaN(year)) return false;

                    if (filters.firstYearQuarter!.year === filters.secondYearQuarter!.year)
                        return (
                            year === filters.firstYearQuarter!.year &&
                            quarter >= filters.firstYearQuarter!.quarter &&
                            quarter <= filters.secondYearQuarter!.quarter
                        )
                    else
                        return (
                            (year === filters.firstYearQuarter!.year && quarter >= filters.firstYearQuarter!.quarter) ||
                            (year === filters.secondYearQuarter!.year && quarter <= filters.secondYearQuarter!.quarter) ||
                            (year > filters.firstYearQuarter!.year && year < filters.secondYearQuarter!.year)
                        );
                });
            }
            else {
                let yearQuarter = (filters.firstYearQuarter ?? filters.secondYearQuarter)
                if (yearQuarter) {
                    filteredData = filteredData.filter(d => {
                        let quarter = parseQuarter(d.discharge_quarter);
                        let year = parseInt(d.discharge_year);

                        if (isNaN(quarter) || isNaN(year)) return false;

                        return year === yearQuarter.year && quarter === yearQuarter.quarter;
                    });
                };
            };
        };

        let labels: string[] = [];
        let datasets: { label?: string, data: number[] }[] = [];
        
        function tTest(sample1: number[], sample2: number[]): number {
            if (sample1.length < 2 || sample2.length < 2) return 1;
            const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
            const variance = (arr: number[], m: number) => arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / (arr.length - 1);

            const mean1 = mean(sample1);
            const mean2 = mean(sample2);
            const var1 = variance(sample1, mean1);
            const var2 = variance(sample2, mean2);
            const n1 = sample1.length;
            const n2 = sample2.length;

            const t = (mean1 - mean2) / Math.sqrt(var1 / n1 + var2 / n2);
            const df = Math.pow(var1 / n1 + var2 / n2, 2) /
                ((Math.pow(var1 / n1, 2) / (n1 - 1)) + (Math.pow(var2 / n2, 2) / (n2 - 1)));

            const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
            return pValue;
        }

        const groupedByYearQuarter = groupBy(filteredData, (o) => o.YQ);
        const buildDatasetForFilter = (
            data: Result[],
            labelPrefix: string,
            aggregationType: string,
            labels: string[],
            keys?: string[]
        ): { label: string, data: number [] }[] => {
            const grouped = groupBy(data, d => d.YQ);
            const datasets: { label: string, data: number [] }[] = [];

            if (aggregationType === "percentage" && keys) {
                keys.forEach(key => {
                    const dataValues: number [] = labels.map(l => {
                        const values = grouped[l] ?? [];
                        const total = values.length;
                        const count = values.filter(d => d.Value === key).length;
                        if (total === 0) return NaN;
                        return (count / total) * 100;
                    });
                    datasets.push({ label: `${labelPrefix} - ${key}`, data: dataValues });
                });
            } else {
                const dataValues: number [] = labels.map(l => {
                    const values = (grouped[l] ?? [])
                    .map(d => parseFloat(d.Value))
                    .filter(v => !isNaN(v));

                    if (values.length === 0) return NaN;
                    switch (aggregationType) {
                        case "median": return median(values);
                        case "mean": return mean(values);
                        case "count": return sum(values);
                        default: return NaN;
                    }
                });
                datasets.push({ label: labelPrefix, data: dataValues });
            }

            return datasets;
        };

        // Perform the specified aggregation
        labels = Object.keys(groupedByYearQuarter).sort();

        switch (aggregationType.toLowerCase()) {
            case "median":
            case "mean":
            case "count":
                if (filters?.country) datasets.push(...buildDatasetForFilter(filteredByCountry, `Country: ${filters.country}`, aggregationType, labels ));
                if (filters?.site) datasets.push(...buildDatasetForFilter(filteredBySite, `Hospital: ${filters.site}`, aggregationType, labels ));
                break;
            case "percentage":
                const percentageKeys = variableType.toLowerCase() === "categorical"
                    ? Array.from(new Set(filteredData.map(d => d.Value))).sort()
                    : ["1"];

                if (filters?.country) datasets.push(...buildDatasetForFilter(filteredByCountry, `Country: ${filters.country}`, aggregationType, labels, percentageKeys ));
                if (filters?.site) datasets.push(...buildDatasetForFilter(filteredBySite, `Hospital: ${filters.site}`, aggregationType, labels, percentageKeys ));
                break;
        }

        if (labels.length >= 2) {
            const sortedLabels = [...labels].sort((a, b) => {
                const [yearA, quarterA] = a.split("-Q").map(Number);
                const [yearB, quarterB] = b.split("-Q").map(Number);

                if (isNaN(yearA) || isNaN(quarterA)) return 1;
                if (isNaN(yearB) || isNaN(quarterB)) return -1;

                return yearA === yearB ? quarterA - quarterB : yearA - yearB;
            });

            const prevLabel = sortedLabels[sortedLabels.length - 2];
            const lastLabel = sortedLabels[sortedLabels.length - 1];

            datasets = datasets.map(ds => {
                let relevantData: Result[] = [];

                if (ds.label?.startsWith("Country:")) {
                    relevantData = filteredByCountry;
                } else if (ds.label?.startsWith("Hospital:")) {
                    relevantData = filteredBySite;
                } else {
                    relevantData = filteredData;
                }

                const grouped = groupBy(
                    relevantData.filter(d => d.variable.toLowerCase() === variableName.toLowerCase()),
                    (o) => o.YQ
                );

                const prevValues = (grouped[prevLabel] ?? []).map(d => parseFloat(d.Value)).filter(v => !isNaN(v));
                const lastValues = (grouped[lastLabel] ?? []).map(d => parseFloat(d.Value)).filter(v => !isNaN(v));

                let significant: "positive" | "negative" | "neutral" = "neutral";
                let pValue: number | null = null;
                let evolution: number | null = null;
                let diffMedian: number | null = null;
                let pctEvolution: string | null = null;

                const cleanPrev = prevValues.filter(v => !isNaN(v));
                const cleanLast = lastValues.filter(v => !isNaN(v));

                if (cleanPrev.length > 1 && cleanLast.length > 1) {

                    const medianPrev = median(prevValues);
                    const medianLast = median(lastValues);
                    
                    diffMedian = medianLast - medianPrev;
                    pctEvolution = medianPrev !== 0 ? `${((diffMedian / medianPrev) * 100).toFixed(2)}%` : null;

                    pValue= tTest(prevValues, lastValues);
                    evolution = mean(lastValues) - mean(prevValues);

                    if (pValue <= 0.05) {
                        significant = evolution > 0 ? "positive" : "negative";
                    } 
                }
                 
                return { ...ds, significant, pValue, evolution, diffMedian, pctEvolution };
            });
        }
        // Send the response
        res.json({ labels, datasets } as API.DataResponse);
    };

    if (!req.body.aggregationType) return res.status(400).json({ error: "Aggregation type parameter is required!" });
    if (typeof req.body.aggregationType !== "string") return res.status(500).json({ error: "An error as occured with the request!" });
    if (!req.body.variableType) return res.status(400).json({ error: "Variable type parameter is required!" });
    if (typeof req.body.variableType !== "string") return res.status(500).json({ error: "An error as occured with the request!" });

    getAndSendData(req.params.categoryName, req.params.variableName, req.body.aggregationType, req.body.variableType, req.body.filters);
});

/**
 * Default route for invalid API requests.
 */
dataApi.use("/", (req, res) => {
    res.status(400).json({ error: "Invalid request parameters!" });
})

export default dataApi;