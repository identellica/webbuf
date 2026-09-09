import {
  useEffect,
  useRef,
  type ComponentProps,
  type ReactElement,
} from "react";

type SpaceRainRuntime = {
  installSpaceRainCanvas(canvas: HTMLCanvasElement): AbortController;
};

type SpaceRainRuntimeLoader = () => Promise<SpaceRainRuntime>;

const loadSpaceRainRuntime: SpaceRainRuntimeLoader = () =>
  import("./space-rain/runtime");

export type SpaceRainProps = Omit<
  ComponentProps<"canvas">,
  "aria-hidden" | "children" | "ref"
>;

/**
 * Starts one browser-only renderer unless its owner was already disposed.
 * Exported for lifecycle tests; product code should render {@link SpaceRain}.
 */
export async function mountSpaceRain(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
  loadRuntime: SpaceRainRuntimeLoader = loadSpaceRainRuntime,
): Promise<AbortController | undefined> {
  try {
    const runtime = await loadRuntime();
    if (signal.aborted) return undefined;

    const renderer = runtime.installSpaceRainCanvas(canvas);
    if (signal.aborted) {
      renderer.abort();
      return undefined;
    }
    signal.addEventListener("abort", () => renderer.abort(), { once: true });
    return renderer;
  } catch (error) {
    if (!signal.aborted) {
      canvas.dataset.spaceRainStatus = "fallback";
      console.warn(
        "SpaceRain runtime unavailable; retaining page background",
        error,
      );
    }
    return undefined;
  }
}

/** Shared procedural Austin Night background. */
export function SpaceRain({
  className = "pointer-events-none fixed inset-0 z-1 block h-dvh w-dvw",
  ...props
}: SpaceRainProps = {}): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const owner = new AbortController();
    void mountSpaceRain(canvas, owner.signal);
    return () => owner.abort();
  }, []);

  return (
    <canvas
      {...props}
      ref={canvasRef}
      data-space-rain-canvas
      aria-hidden="true"
      className={className}
    />
  );
}
