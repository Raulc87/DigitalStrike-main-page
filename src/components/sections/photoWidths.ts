/**
 * Widths to generate for a photo displayed at `displaySize` CSS px (US-022 AC2): 1× always, 2× only
 * when the source is at least twice the displayed size. Never upscaled.
 */
export function photoWidths(displaySize: number, sourceWidth: number): number[] {
  return [displaySize, displaySize * 2].filter((width) => width <= sourceWidth);
}
