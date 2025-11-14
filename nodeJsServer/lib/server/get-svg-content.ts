"use server";
import fs from "fs";
import path from 'path';

/**
 * Reads the content of an SVG file from the components/icons directory.
 * 
 * @param {string} svgName - The name of the SVG file (without the .svg extension).
 * @returns {string} - The content of the SVG file as a string.
 * @throws {Error} - Throws an error if there is an issue reading the file.
 */
export const getSvgContent = (svgName: string): string => {
    // Define the directory where SVG files are stored
    const svgDirectory = path.join(process.cwd(), 'components/icons');

    // Create the full file path by appending the SVG name and extension
    const filePath = path.join(svgDirectory, `${svgName}.svg`);

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        throw new Error(`Error reading SVG file: ${err}`);
    }
};