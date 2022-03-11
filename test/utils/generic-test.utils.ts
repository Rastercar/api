/**
 * Runs tests if the condition is true
 *
 * @example
 * ```ts
 * execTestIf(process.env.SHOULD_EXEC_MATH_TESTS)('my math test', () => {
 *  expect(2 + 2).toBe(4)
 * })
 * ```
 */
export const execTestIf = (condition: boolean): jest.It | jest.It['skip'] => (condition ? it : it.skip)
