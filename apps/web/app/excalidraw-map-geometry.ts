export type MapRectangle = { x: number; y: number; width: number; height: number };

export function connectionBetween(start: MapRectangle, end: MapRectangle) {
  const startCenter = { x: start.x + start.width / 2, y: start.y + start.height / 2 };
  const endCenter = { x: end.x + end.width / 2, y: end.y + end.height / 2 };
  const dx = endCenter.x - startCenter.x;
  const dy = endCenter.y - startCenter.y;

  if (dx === 0 && dy === 0) return { x: startCenter.x, y: startCenter.y, width: 0, height: 0 };

  const boundaryScale = (rectangle: MapRectangle) => 1 / Math.max(
    Math.abs(dx) / (rectangle.width / 2),
    Math.abs(dy) / (rectangle.height / 2),
  );
  const startScale = boundaryScale(start);
  const endScale = boundaryScale(end);
  const x = startCenter.x + dx * startScale;
  const y = startCenter.y + dy * startScale;
  const endX = endCenter.x - dx * endScale;
  const endY = endCenter.y - dy * endScale;

  return { x, y, width: endX - x, height: endY - y };
}
