import express from "express";
import fs from 'fs';
import csv from "csv-parser";

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

        // Apply additional filters if provided
        if (filters) {
            if (filters.country) {
                filteredData = filteredData.filter(d => d.site_country === filters.country)
            };

            if (filters.country && filters.site) {
                filteredData = filteredData.filter(d => d.site_id === filters.site);
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
        const groupedByYearQuarter = groupBy(filteredData, (o) => o.YQ);

        // Perform the specified aggregation
        switch (aggregationType.toLowerCase()) {
            case "median":
                const medianData = Object.keys(groupedByYearQuarter).reduce((acc, key) => {
                    const values = groupedByYearQuarter[key].map(({ Value }) => parseFloat(Value));
                    acc[key] = median(values);
                    return acc;
                }, {} as Record<string, number>);

                labels = Object.keys(medianData).sort();
                datasets.push({ data: labels.map(l => medianData[l]) });
                break;
            case "mean":
                const meanData = Object.keys(groupedByYearQuarter).reduce((acc, key) => {
                    const values = groupedByYearQuarter[key].map(({ Value }) => parseFloat(Value));
                    acc[key] = mean(values);
                    return acc;
                }, {} as Record<string, number>);

                labels = Object.keys(meanData).sort();
                datasets.push({ data: labels.map(l => meanData[l]) });
                break;
            case "percentage":
                const percentageData = Object.keys(groupedByYearQuarter).reduce((acc, key) => {
                    const values = groupBy(groupedByYearQuarter[key], (v) => v.Value);
                    acc[key] = Object.keys(values).reduce((acc, key) => {
                        acc[key] = values[key].length;
                        return acc;
                    }, {} as Record<string, number>);
                    return acc;
                }, {} as Record<string, Record<string, number>>);

                labels = Object.keys(percentageData).sort();

                let keys: string[] = [];
                switch (variableType.toLowerCase()) {
                    case "categorical":
                        keys = Array.from(new Set(labels.map(l => percentageData[l]).flatMap(Object.keys))).sort();
                        break;
                    case "categorical_binary":
                        keys = ["1"];
                        break;
                };
                keys.forEach(key => {
                    datasets.push({
                        label: key,
                        data: labels.map(l => percentageData[l]).map(i => {
                            const total = Object.values(i).reduce((sum, value) => sum + (value || 0), 0);
                            const value = i[key] ?? 0;
                            return total > 0 ? (value / total) * 100 : 0;
                        })
                    });
                });
                break;
            case "count":
                const countData = Object.keys(groupedByYearQuarter).reduce((acc, key) => {
                    const values = groupedByYearQuarter[key].map(({ Value }) => parseFloat(Value));
                    acc[key] = sum(values);
                    return acc;
                }, {} as Record<string, number>);

                labels = Object.keys(countData).sort();
                datasets.push({ data: labels.map(l => countData[l]) });
                break;
        };

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