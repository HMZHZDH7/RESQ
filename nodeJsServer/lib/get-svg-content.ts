import fs from 'fs';
import path from 'path';

export const getSvgContent = (svgName: string) => {
    const svgDirectory = path.join(process.cwd(), 'components/icons');

    const filePath = path.join(svgDirectory, `${svgName}.svg`);

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        throw new Error(`Error reading SVG file: ${err}`);
    }
};