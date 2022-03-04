/**
 * Transforms a enum into a array and randomly remove values from it
 */
export function enumToRandomImpartialArray(e: any): any[] {
  return Object.values(e)
    .map(e => (Math.random() < 0.5 ? null : e))
    .filter(e => e !== null)
}
