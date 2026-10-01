export function sumPrices(prices: number[]): number {
  return roundToTwo(prices.reduce((acc, p) => acc + p, 0));
}

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export function verifyOrderTotal(
  itemTotal: number,
  tax: number,
  total: number,
  tolerance = 0.01,
): boolean {
  const expectedTotal = roundToTwo(itemTotal + tax);
  return Math.abs(expectedTotal - total) <= tolerance;
}
