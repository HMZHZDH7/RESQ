/**
 * Extracts the error message from an error object.
 * 
 * @param {unknown} error - The error object, which can be of any type.
 * @returns {string} - The error message as a string.
 * If the error is an instance of Error, it returns its message.
 * Otherwise, it converts the error to a string.
 */
export function getErrorMessage(error: unknown) {
    // Check if the error is an instance of the built-in Error class
    if (error instanceof Error) return error.message;

    // If the error is not an instance of Error, convert it to a string and return
    return String(error);
};