export type ViewTransform = {
  x: number;
  y: number;
  k: number;
};

export const IDENTITY_TRANSFORM: ViewTransform = { x: 0, y: 0, k: 1 };

export function clampZoom(value: number, min = 1, max = 8) {
  return Math.min(max, Math.max(min, value));
}

export function zoomAtPoint(
  transform: ViewTransform,
  point: { x: number; y: number },
  nextK: number,
): ViewTransform {
  const k = clampZoom(nextK);
  const scale = k / transform.k;
  return {
    k,
    x: point.x - (point.x - transform.x) * scale,
    y: point.y - (point.y - transform.y) * scale,
  };
}

export function panBy(transform: ViewTransform, dx: number, dy: number): ViewTransform {
  return { ...transform, x: transform.x + dx, y: transform.y + dy };
}
