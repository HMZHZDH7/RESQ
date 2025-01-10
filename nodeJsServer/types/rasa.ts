declare global {
    namespace Rasa {
        /**
         * Represents a response object from the Rasa system.
         * 
         * @property {{ str: string; srv: boolean; }[]} message - An array of messages, where each message contains a string (`str`) and a boolean (`srv`) indicating whether it is a server-side message.
         * @property {object} [data] - Optional additional data included in the response.
         * @property {{ file_content: string }} [data.data] - An optional nested object containing file content information.
         * @property {{ file_content: string }} [data.args] - An optional nested object containing arguments, represented by file content.
         */
        export interface Response {
            message: { str: string; srv: boolean; }[];
            data?: {
                data?: { file_content: string };
                args?: { file_content: string }
            }
        }

        /**
        * Represents a log entry for user interactions with the Rasa system.
        * 
        * @property {string} timestamp - The timestamp of the interaction.
        * @property {{ str: string; srv: boolean }} [message] - An optional message object containing a string (`str`) and a server-side flag (`srv`).
        * @property {object} [data] - Optional additional data related to the interaction.
        * @property {string} [data.data] - Optional string containing data content related to the interaction.
        * @property {string} [data.args] - Optional string containing argument content related to the interaction.
        */
        export interface UserInteractionLog {
            timestamp: string;
            message?: { str: string; srv: boolean };
            data?: {
                data?: string;
                args?: string;
            };
        }
    }
}

// Exporting an empty object to ensure this file is treated as a module by TypeScript.
// This is necessary to extend the global namespace.
export { };