// Only trusted, bundled lucide-static SVG strings are accepted here.
export default function Icon({
  icon,
  size = 20,
  className,
  strokeWidth,
}: {
  icon: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  let svg = icon
    .replace(/<!--[\s\S]*?-->/, "")
    .trim()
    .replace(/\swidth="[^"]*"/, ` width="${size}"`)
    .replace(/\sheight="[^"]*"/, ` height="${size}"`)
    .replace(/\sclass="[^"]*"/, className ? ` class="${className}"` : "");
  if (strokeWidth !== undefined)
    svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
  return (
    <span
      className="contents"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
