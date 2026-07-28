export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function parseViews(views: string): number {
  const match = views.trim().match(/^([\d.]+)\s*([KM]?)$/i);
  if (!match) return Number.parseInt(views, 10) || 0;
  const [, num, unit] = match;
  const value = Number.parseFloat(num);
  if (unit.toUpperCase() === "M") return value * 1_000_000;
  if (unit.toUpperCase() === "K") return value * 1_000;
  return value;
}
