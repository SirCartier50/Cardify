import { formatAmountForStripe } from './stripe'

describe('formatAmountForStripe', () => {
  it('converts dollars to cents', () => {
    expect(formatAmountForStripe(3.99)).toBe(399)
  })

  it('handles whole dollar amounts', () => {
    expect(formatAmountForStripe(10)).toBe(1000)
  })

  it('handles zero', () => {
    expect(formatAmountForStripe(0)).toBe(0)
  })

  it('handles small amounts', () => {
    expect(formatAmountForStripe(0.50)).toBe(50)
  })
})
