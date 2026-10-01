export function isSortedAtoZ(items: string[]): boolean {
  return items.every(
    (item, i) => i === 0 || item.toLowerCase() >= items[i - 1].toLowerCase(),
  );
}

export function isSortedZtoA(items: string[]): boolean {
  return items.every(
    (item, i) => i === 0 || item.toLowerCase() <= items[i - 1].toLowerCase(),
  );
}

export function isSortedLowToHigh(prices: number[]): boolean {
  return prices.every((price, i) => i === 0 || price >= prices[i - 1]);
}

export function isSortedHighToLow(prices: number[]): boolean {
  return prices.every((price, i) => i === 0 || price <= prices[i - 1]);
}
