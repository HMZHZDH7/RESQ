import fs from 'fs';
import path from 'path';

export const getSvgContent = (svgName: string) => {
    // Chemin vers le répertoire contenant les fichiers SVG
    const svgDirectory = path.join(process.cwd(), 'components/icons'); // Adapte ce chemin si nécessaire

    const filePath = path.join(svgDirectory, `${svgName}.svg`);

    try {
        // Lire le fichier SVG de manière synchrone
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        throw new Error(`Error reading SVG file: ${err}`);
    }
};