const VIEWPORT_BASE_WIDTH = 375;
const PX_SIZE_PATTERN = /^(\d+(?:\.\d+)?)px$/i;

function toViewportUnit(value: number) {
  return `${Number(((value / VIEWPORT_BASE_WIDTH) * 100).toFixed(4))}vw`;
}

export function formatResponsiveSize(value?: number | string, fallback?: number | string) {
  const targetValue = value ?? fallback;

  if (targetValue === undefined || targetValue === null || targetValue === "") {
    return "";
  }

  if (typeof targetValue === "number") {
    return toViewportUnit(targetValue);
  }

  const normalizedValue = targetValue.trim();
  const pxMatch = normalizedValue.match(PX_SIZE_PATTERN);

  if (pxMatch) {
    return toViewportUnit(Number(pxMatch[1]));
  }

  return normalizedValue;
}
