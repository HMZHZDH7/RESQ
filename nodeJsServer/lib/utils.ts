import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Type guard to check if a value is an object.
 * 
 * @param value - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
function isObject(value: any): value is object {
    return value && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Deep merges two objects, recursively merging nested objects.
 * 
 * @param target - The target object to be merged into.
 * @param source - The source object whose values will be merged into the target.
 * @returns A new object that is the result of the deep merge.
 * 
 * @example
 * const merged = deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 }, e: 4 });
 * // merged: { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
    const output: any = { ...target }; // Shallow copy of the target object

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = (source as any)[key];
            const targetValue = (target as any)[key];

            // If both values are objects, merge them recursively
            if (isObject(targetValue) && isObject(sourceValue)) {
                output[key] = deepMerge(targetValue, sourceValue);
            } else {
                // Otherwise, replace the target value with the source value
                output[key] = sourceValue;
            }
        }
    }

    return output;
};

/**
 * Compares two objects deeply to check if they are equal.
 * This function compares all properties of the objects and their nested properties.
 * 
 * @param obj1 - The first object to compare.
 * @param obj2 - The second object to compare.
 * @returns boolean - Returns `true` if both objects are deeply equal, `false` otherwise.
 */
export function deepEqual(obj1: any, obj2: any): boolean {
    // If the objects are strictly equal, no need to compare further
    if (obj1 === obj2) {
        return true;
    };

    // If one of the objects is null or they are not of type 'object', they are not equal
    if (
        obj1 === null || obj2 === null ||
        typeof obj1 !== 'object' || typeof obj2 !== 'object'
    ) {
        return false;
    };

    // Get all keys from both objects to compare their properties
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // If the number of properties is different, objects are not equal
    if (keys1.length !== keys2.length) {
        return false;
    };

    // Compare each key in the first object to ensure both objects have the same properties
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        };
    };

    return true;
};

/**
 * Utility function to join class names using clsx and merge conflicting Tailwind classes using twMerge.
 * 
 * @param inputs - The class names to be processed.
 * @returns A string of merged and cleaned class names.
 * 
 * @example
 * const classNames = cn('bg-red-500', 'text-white', 'bg-blue-500');
 * // classNames: 'text-white bg-blue-500'
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
};