import { filterDecks } from './marketplace'

const mockDecks = [
  { name: 'JavaScript Basics', description: 'Learn JS fundamentals', tags: ['js', 'web'] },
  { name: 'Python 101', description: 'Intro to Python', tags: ['python', 'backend'] },
  { name: 'React Hooks', description: 'Advanced React patterns', tags: ['react', 'js', 'web'] },
  { name: 'Biology', description: 'Cell structure and DNA', tags: ['science'] },
]

describe('filterDecks', () => {
  it('returns all decks when search is empty', () => {
    expect(filterDecks(mockDecks, '')).toHaveLength(4)
  })

  it('returns all decks when search is null', () => {
    expect(filterDecks(mockDecks, null)).toHaveLength(4)
  })

  it('filters by deck name', () => {
    const result = filterDecks(mockDecks, 'python')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Python 101')
  })

  it('filters by description', () => {
    const result = filterDecks(mockDecks, 'DNA')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Biology')
  })

  it('filters by tag', () => {
    const result = filterDecks(mockDecks, 'web')
    expect(result).toHaveLength(2)
  })

  it('is case insensitive', () => {
    const result = filterDecks(mockDecks, 'JAVASCRIPT')
    expect(result).toHaveLength(1)
  })

  it('returns empty array when nothing matches', () => {
    const result = filterDecks(mockDecks, 'chemistry')
    expect(result).toHaveLength(0)
  })

  it('handles decks with missing description and tags', () => {
    const decks = [{ name: 'Test Deck' }]
    const result = filterDecks(decks, 'test')
    expect(result).toHaveLength(1)
  })
})
