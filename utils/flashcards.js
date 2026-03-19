export function getMaxFlashcards(plan) {
  if (plan === "Premium") return 40
  return 10
}

export function parseFlashcards(raw, maxCards) {
  const parsed = JSON.parse(raw)
  if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
    throw new Error("Invalid flashcard format")
  }
  return parsed.flashcards.slice(0, maxCards)
}
