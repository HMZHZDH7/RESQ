declare global {
    namespace AlertModule {
        /**
         * Represents an alert object used for displaying messages.
         * 
         * @property {string} message - The message content of the alert.
         * @property {"info" | "success" | "warning" | "danger"} type - The type of the alert, which determines its visual style (e.g., info, success, warning, or danger).
         * @property {string} [id] - An optional unique identifier for the alert, useful for managing multiple alerts.
         */
        export interface Alert {
            message: string;
            type: "info" | "success" | "warning" | "danger";
            id?: string;
        }

        /**
         * Defines a listener function for handling alerts.
         * 
         * @callback ListenerFunc
         * @param {Alert | Alert[]} alert - An `Alert` object or an array of `Alert` objects to be processed by the listener.
         */
        export type ListenerFunc = (alert: AlertModule.Alert | AlertModule.Alert[]) => void;
    }
}

// Exporting an empty object to ensure this file is treated as a module by TypeScript.
// This is necessary to extend the global namespace.
export { };