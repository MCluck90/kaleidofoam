export const isObject = (
  obj: unknown
): obj is Record<string | number | symbol, unknown> =>
  obj !== null && obj !== undefined
