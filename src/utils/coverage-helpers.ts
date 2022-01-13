/**
 * Returns a function that just returns the provided value, this
 * is usefull to use within decorators that requires explicit type
 * checking, for example:
 *
 * ```ts
 * .@Mutation(() => String),
 * // equals
 * .@Mutation(returns(String))
 * ```
 * the difference is that returns() wont appear as uncovered in test
 * coverage reports
 */
export const returns = (type: any) => () => type
