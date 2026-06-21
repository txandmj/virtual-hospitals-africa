import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { maxBy, minBy } from '../../util/maxBy.ts'

const people = [
  { name: 'Ann', age: 30 },
  { name: 'Bob', age: 45 },
  { name: 'Cat', age: 12 },
]

describe('maxBy', () => {
  it('finds the max by key', () => {
    assertEquals(maxBy(people, 'age'), { name: 'Bob', age: 45 })
  })

  it('finds the max by accessor function', () => {
    assertEquals(maxBy(people, (p) => p.age), { name: 'Bob', age: 45 })
    assertEquals(maxBy(people, (p) => p.name), { name: 'Cat', age: 12 })
  })

  it('returns the first item on ties', () => {
    assertEquals(
      maxBy([{ id: 1, n: 5 }, { id: 2, n: 5 }], 'n'),
      { id: 1, n: 5 },
    )
  })

  it('works on any iterable', () => {
    assertEquals(maxBy(new Set([3, 1, 4, 1, 5]), (n) => n), 5)
  })

  it('compares dates', () => {
    const events = [
      { at: new Date('2020-01-01') },
      { at: new Date('2024-06-15') },
      { at: new Date('2022-03-09') },
    ]
    assertEquals(maxBy(events, 'at'), { at: new Date('2024-06-15') })
  })

  it('returns undefined for an empty iterable', () => {
    assertEquals(maxBy([] as { age: number }[], 'age'), undefined)
  })
})

describe('minBy', () => {
  it('finds the min by key', () => {
    assertEquals(minBy(people, 'age'), { name: 'Cat', age: 12 })
  })

  it('finds the min by accessor function', () => {
    assertEquals(minBy(people, (p) => p.name), { name: 'Ann', age: 30 })
  })

  it('returns undefined for an empty iterable', () => {
    assertEquals(minBy([] as { age: number }[], 'age'), undefined)
  })
})
