declare global {
    namespace YearQuarterInput {
        /**
         * Represents a year and quarter combination.
         * 
         * @property {number} year - The year (e.g., 2023).
         * @property {number} quarter - The quarter of the year (1 to 4).
         */
        export interface YearQuarter { year: number, quarter: number }
    }

    namespace SelectInput {
        /**
         * Represents an option in a select input.
         * 
         * @property {string} value - The value associated with the option (used internally, e.g., for form submissions).
         * @property {string} label - The label displayed to the user in the select dropdown.
         */
        export interface Option {
            value: string;
            label: string;
        }
    }
}

// Exporting an empty object to ensure this file is treated as a module by TypeScript.
// This is necessary to extend the global namespace.
export { };