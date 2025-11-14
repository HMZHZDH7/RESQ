declare global {
    namespace SectionModule {
        /**
         * Represents the data for a section.
         * 
         * @property {string} label - The label or title of the section.
         * @property {string} categoryName - The name of the category the section belongs to.
         * @property {string} id - A unique identifier for the section.
         * @property {string} icon - The icon associated with the section (e.g., for UI representation).
         * @property {Chart[]} charts - An array of charts associated with the section.
         */
        export interface Data {
            label: string,
            categoryName: string,
            id: string,
            icon: string,
            charts: Chart[]
        }

        /**
         * Represents the types of aggregation that can be applied to data.
         * 
         * - `'percentage'`: Aggregates data as a percentage.
         * - `'count'`: Counts the occurrences of data.
         * - `'mean'`: Calculates the mean (average) of data.
         * - `'median'`: Calculates the median value of data.
         */
        export type AggregationType = 'percentage' | 'count' | 'mean' | 'median';

        /**
         * Represents the types of variables used in a chart.
         * 
         * - `'quantitative'`: Represents numerical data.
         * - `'categorical'`: Represents data grouped into categories.
         * - `'categorical_binary'`: Represents data with binary categories (e.g., yes/no).
         */
        export type VariableType = 'quantitative' | 'categorical' | 'categorical_binary';

        /**
         * Represents the types of charts supported.
         * 
         * - `'stacked_bargraph'`: A stacked bar chart.
         * - `'trend'`: A trend chart (e.g., line chart showing trends over time).
         * - `''`: An empty type for undefined or unsupported chart types.
         */
        export type ChartType = 'number' | 'stacked_bargraph' | 'trend' | '';

        /**
         * Represents a chart in the section.
         * 
         * @property {string} label - The label or title of the chart.
         * @property {ChartType} type - The type of the chart (e.g., 'number', 'trend').
         * @property {string} variableName - The name of the variable represented by the chart.
         * @property {VariableType} variableType - The type of the variable (e.g., quantitative, categorical).
         * @property {AggregationType} aggregationType - The type of aggregation applied to the data.
         */
        export interface Chart {
            label: string,
            type: ChartType,
            variableName: string,
            variableType: VariableType,
            aggregationType: AggregationType
        }

        /**
         * Represents the filters applied to a section.
         * 
         * @property {YearQuarterInput.YearQuarter} [firstYearQuarter] - The first year and quarter filter.
         * @property {YearQuarterInput.YearQuarter} [secondYearQuarter] - The second year and quarter filter.
         * @property {string} [country] - The country filter.
         * @property {string} [site] - The site filter.
         * @property {string} [variables] - The variables filter.
         * @property {string} [comparators] - The comparators filter.
         * @property {string} [comparisonValue] - The comparisonValue filter.
         */
        export interface Filters {
            firstYearQuarter?: YearQuarterInput.YearQuarter,
            secondYearQuarter?: YearQuarterInput.YearQuarter,
            country?: string,
            site?: string,
            variable?: string,
            comparators?: string,
            comparisonValue?: string
        }
    }
}

// Exporting an empty object to ensure this file is treated as a module by TypeScript.
// This is necessary to extend the global namespace.
export { };