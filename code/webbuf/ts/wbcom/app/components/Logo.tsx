interface Props {
  size?: number;
  className?: string;
}

/** Canonical single-color WebBuf master, rendered by the shared brand factory. */
export default function Logo({ size = 32, className = "" }: Props) {
  const source = [64, 128, 200, 400].find((value) => value >= size * 3) ?? 400;
  return (
    <img
      src={`/images/brand/webbuf-dark-${source}.webp`}
      width={size}
      height={size}
      alt="WebBuf"
      className={`shrink-0 ${className}`}
    />
  );
}
