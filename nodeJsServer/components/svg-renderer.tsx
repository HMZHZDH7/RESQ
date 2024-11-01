const SvgRenderer = ({ svgContent, width, height, className = "" }: { svgContent: string; width?: number; height?: number; className?: string }) => {

  // Initialize cleanedSvgText with the original SVG content
  let cleanedSvgText = svgContent;

  // Remove width attribute from the SVG if a new width is provided
  if (width) {
    cleanedSvgText = cleanedSvgText.replace(
      /<svg([^>]*?)\s*width="[^"]*"([^>]*)>/,
      `<svg$1$2>`
    );
  };

  // Remove height attribute from the SVG if a new height is provided
  if (height) {
    cleanedSvgText = cleanedSvgText.replace(
      /<svg([^>]*?)\s*height="[^"]*"([^>]*)>/,
      `<svg$1$2>`
    );
  };

  // Remove existing class attribute if a new className is provided
  if (className) {
    cleanedSvgText = cleanedSvgText.replace(
      /<svg([^>]*?)\s*class="[^"]*"([^>]*)>/,
      `<svg$1$2>`
    );
  };

  // Inject width, height, and className attributes into the SVG root
  const svgWithProps = cleanedSvgText ? cleanedSvgText.replace(
    /<svg([^>]*?)>/,
    `<svg$1 width="${width}" height="${height}" class="${className}">`
  ) : "";

  // Render the SVG content with the provided properties inside a container
  return (
    <div
      className="svg-container"
      dangerouslySetInnerHTML={{ __html: svgWithProps }}
    />
  );
};

export default SvgRenderer;