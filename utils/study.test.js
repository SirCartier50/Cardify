import { calculateMasteryRate } from './study'

describe('calculateMasteryRate', () => {
  it('calculates percentage correctly', () => {
    expect(calculateMasteryRate(5, 10)).toBe(50)
  })

  it('returns 100 for perfect score', () => {
    expect(calculateMasteryRate(10, 10)).toBe(100)
  })

  it('returns 0 when no cards correct', () => {
    expect(calculateMasteryRate(0, 10)).toBe(0)
  })

  it('returns 0 when totalCards is 0', () => {
    expect(calculateMasteryRate(0, 0)).toBe(0)
  })

  it('returns 0 when totalCards is negative', () => {
    expect(calculateMasteryRate(5, -1)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(calculateMasteryRate(1, 3)).toBe(33)
    expect(calculateMasteryRate(2, 3)).toBe(67)
  })
})
