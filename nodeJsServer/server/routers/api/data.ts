import express from "express";
import fs from 'fs';
import csv from "csv-parser";
import jStat from "jstat";

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
dataApi.post("/:categoryName/:variableName", (req, res) => {
    /**
     * Filters and processes data based on the request parameters, then sends the response.
     */
    const getAndSendData = async <T extends string>(categoryName: string, variableName: string, aggregationType: T, variableType: string, filters?: SectionModule.Filters) => {
        if (!Object.keys(supportedDataOperations).includes(aggregationType.toLowerCase())) return res.status(400).json({ error: "Invalid aggregationType parameter!" });
        if (!(supportedDataOperations[aggregationType] ?? []).includes(variableType.toLowerCase())) return res.status(400).json({ error: "Invalid variableType parameter!" });

        let filteredData = (await getDataFromFile()).filter(row => row.TAB.toLowerCase() === categoryName.toLowerCase() && row.variable.toLowerCase() === variableName.toLowerCase() && row.SUMMARIZE_BY === aggregationType.toLowerCase() && row.ATTRIBUTE_TYPE.toLowerCase() === variableType.toLowerCase() && row.Value !== "");
        console.log(filteredData)
        let filteredByCountry = filteredData;
        let filteredBySite = filteredData;
        // Apply additional filters if provided
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
        ): { label: string, data: number[] }[] => {
            const grouped = groupBy(data, d => d.YQ);
            const datasets: { label: string, data: number[] }[] = [];

            if (aggregationType === "percentage" && keys) {
                keys.forEach(key => {
                    const dataValues = labels.map(l => {
                        const values = grouped[l] ?? [];
                        const total = values.length;
                        const count = values.filter(d => d.Value === key).length;
                        return total > 0 ? (count / total) * 100 : 0;
                    });
                    datasets.push({ label: `${labelPrefix} - ${key}`, data: dataValues });
                });
            } else {
                const dataValues = labels.map(l => {
                    const values = (grouped[l] ?? []).map(d => parseFloat(d.Value));
                    if (!values.length) return 0;
                    switch (aggregationType) {
                        case "median": return median(values);
                        case "mean": return mean(values);
                        case "count": return sum(values);
                        default: return 0;
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

                if (prevValues.length > 1 && lastValues.length > 1) {
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