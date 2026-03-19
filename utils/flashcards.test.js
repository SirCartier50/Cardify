import { getMaxFlashcards, parseFlashcards } from './flashcards'

describe('getMaxFlashcards', () => {
  it('returns 40 for Premium plan', () => {
    expect(getMaxFlashcards('Premium')).toBe(40)
  })

  it('returns 10 for Free plan', () => {
    expect(getMaxFlashcards('Free')).toBe(10)
  })

  it('returns 10 when plan is undefined', () => {
    expect(getMaxFlashcards(undefined)).toBe(10)
  })

  it('returns 10 for any non-Premium value', () => {
    expect(getMaxFlashcards('Basic')).toBe(10)
    expect(getMaxFlashcards(null)).toBe(10)
  })
})

describe('parseFlashcards', () => {
  it('parses valid flashcard JSON', () => {
    const raw = JSON.stringify({
      flashcards: [
        { front: 'Q1', back: 'A1' },
        { front: 'Q2', back: 'A2' },
      ]
    })
    const result = parseFlashcards(raw, 10)
    expect(result).toHaveLength(2)
    expect(result[0].front).toBe('Q1')
  })

  it('slices to maxCards limit', () => {
    const cards = Array.from({ length: 15 }, (_, i) => ({
      front: `Q${i}`,
      back: `A${i}`,
    }))
    const raw = JSON.stringify({ flashcards: cards })
    const result = parseFlashcards(raw, 10)
    expect(result).toHaveLength(10)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseFlashcards('not json', 10)).toThrow()
  })

  it('throws when flashcards key is missing', () => {
    const raw = JSON.stringify({ cards: [] })
    expect(() => parseFlashcards(raw, 10)).toThrow('Invalid flashcard format')
  })

  it('throws when flashcards is not an array', () => {
    const raw = JSON.stringify({ flashcards: 'not an array' })
    expect(() => parseFlashcards(raw, 10)).toThrow('Invalid flashcard format')
  })
})
