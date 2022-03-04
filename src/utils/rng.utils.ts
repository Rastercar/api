/**
 * Creates a random number from a **inclusive** interval
 */
export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomElementFromArray<T>(array: T[]): T {
  return array[randomIntFromInterval(0, array.length)]
}

export function randomColor() {
  const colors = ['red', 'green', 'blue', 'violet', 'pink', 'orange', 'silver', 'black']
  return randomElementFromArray(colors)
}
