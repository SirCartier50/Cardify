export function filterDecks(decks, search) {
  if (!search) return decks

  const searchLower = search.toLowerCase()
  return decks.filter(deck =>
    deck.name.toLowerCase().includes(searchLower) ||
    (deck.description && deck.description.toLowerCase().includes(searchLower)) ||
    (deck.tags && deck.tags.some(tag => tag.toLowerCase().includes(searchLower)))
  )
}
