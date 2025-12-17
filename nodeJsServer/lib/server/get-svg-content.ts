"use server";

import fs from "fs";
import path from "path";

// On déclare le dossier une seule fois
const svgDirectory = path.join(process.cwd(), "components/icons");

// Cache pour éviter de relire les SVG à chaque appel
const cache = new Map<string, string>();

/**
 * Reads and caches the content of an SVG file in components/icons.
 */
export const getSvgContent = (svgName: string): string => {
    if (cache.has(svgName)) {
        return cache.get(svgName)!;
    }

    const filePath = path.join(svgDirectory, `${svgName}.svg`);

    if (!fs.existsSync(filePath)) {
        throw new Error(`[getSvgContent] SVG not found: ${filePath}`);
    }

    const data = fs.readFileSync(filePath, "utf8");
    cache.set(svgName, data);
    return data;
};
