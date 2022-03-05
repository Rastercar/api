/**
 * @param inbalance **default: 50** - Percentual value representing the chance to return true,
 * ex: 10 = 10% chance this function will return true
 */
export function randomBool(inbalance = 50): boolean {
  return Math.random() < inbalance / 100
}

/**
 * Creates a random number from a **inclusive** interval
 */
export function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomElementFromArray<T>(array: T[]): T {
  return array[randomIntFromInterval(0, array.length - 1)]
}

export function randomColor(): string {
  const colors = ['red', 'green', 'blue', 'violet', 'pink', 'orange', 'silver', 'black']
  return randomElementFromArray(colors)
}
