const SvgRenderer = ({ svgContent, width, height, className = "" }: { svgContent: string; width?: number; height?: number; className?: string }) => {

  let cleanedSvgText = svgContent;

  if (width) {
    cleanedSvgText = cleanedSvgText.replace(
      /<svg([^>]*?)\s*width="[^"]*"([^>]*)>/,
      `<svg$1$2>`
    );
  };

  if (height) {
    cleanedSvgText = cleanedSvgText.replace(
      /<svg([^>]*?)\s*height="[^"]*"([^>]*)>/,
      `<svg$1$2>`
    );
  };

  if (className) {
    cleanedSvgText = cleanedSvgText.replace(
      /<svg([^>]*?)\s*class="[^"]*"([^>]*)>/,
      `<svg$1$2>`
    );
  };

  // Ajoute les attributs width, height et className à la racine du SVG
  const svgWithProps = cleanedSvgText ? cleanedSvgText.replace(
    /<svg([^>]*?)>/,
    `<svg$1 width="${width}" height="${height}" class="${className}">`
  ) : "";

  return (
    <div
      className="svg-container"
      dangerouslySetInnerHTML={{ __html: svgWithProps }}
    />
  );
};

export default SvgRenderer;
