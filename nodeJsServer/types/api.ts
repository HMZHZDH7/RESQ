declare global {
    namespace API {
        /**
         * Represents the structure of a data response returned by the API.
         * 
         * @property {string[]} labels - An array of labels, typically used for categorizing or identifying data points (e.g., x-axis labels).
         * @property {{ label?: string, data: number[] }[]} datasets - An array of datasets, each containing a set of numerical data and an optional label for identification.
         */
        export interface DataResponse {
            labels: string[],
            datasets: { label?: string, data: number[] }[]
        }
    }
}

// Exporting an empty object to ensure this file is treated as a module by TypeScript.
// This is necessary to extend the global namespace.
export { };