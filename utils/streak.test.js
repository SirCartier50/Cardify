import { calculateStreak } from './streak'

describe('calculateStreak', () => {
  it('returns 1 when there is no previous study date', () => {
    expect(calculateStreak('', '2025-03-18', 5)).toBe(1)
  })

  it('keeps the same streak if studied same day', () => {
    expect(calculateStreak('2025-03-18', '2025-03-18', 3)).toBe(3)
  })

  it('increments streak if studied yesterday', () => {
    expect(calculateStreak('2025-03-17', '2025-03-18', 3)).toBe(4)
  })

  it('resets streak to 1 if gap is more than 1 day', () => {
    expect(calculateStreak('2025-03-15', '2025-03-18', 10)).toBe(1)
  })
})
