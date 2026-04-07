export function subsets<T>(array: T[]): T[][] {
  return array.reduce<T[][]>(
    (acc, item) => [...acc, ...acc.map((subset) => [...subset, item])],
    [[]],
  )
}
