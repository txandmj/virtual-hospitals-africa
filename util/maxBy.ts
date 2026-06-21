type Comparable = number | string | Date

function bestBy<T>(
  iterable: Iterable<T>,
  iteratee: keyof T | ((obj: T) => Comparable),
  better: (value: Comparable, best: Comparable) => boolean,
): T | undefined {
  const getter = typeof iteratee === 'function' ? iteratee : (obj: T) => obj[iteratee] as unknown as Comparable

  let best: T | undefined
  let best_value: Comparable | undefined
  for (const item of iterable) {
    const value = getter(item)
    if (best_value === undefined || better(value, best_value)) {
      best = item
      best_value = value
    }
  }
  return best
}

export function maxBy<T>(
  iterable: Iterable<T>,
  iteratee: keyof T | ((obj: T) => Comparable),
): T | undefined {
  return bestBy(iterable, iteratee, (value, best) => value > best)
}

export function minBy<T>(
  iterable: Iterable<T>,
  iteratee: keyof T | ((obj: T) => Comparable),
): T | undefined {
  return bestBy(iterable, iteratee, (value, best) => value < best)
}
