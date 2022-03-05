import { inspect, InspectOptions } from 'util'

export const consoleLogDeep = (x: unknown, opts: InspectOptions = {}) => {
  const def: InspectOptions = { showHidden: false, depth: null, colors: true }
  console.log(inspect(x, { ...def, ...opts }))
}
