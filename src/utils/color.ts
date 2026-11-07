// Lightens (positive percent) or darkens (negative) a #rrggbb color by the
// given percent, clamped to the valid channel range. Used to fake shaded,
// gradient-lit 3D surfaces (hull highlights, star facets) from a single
// base color without defining a second color anywhere.
export function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}
