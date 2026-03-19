export function calculateMasteryRate(cardsCorrect, totalCards) {
  if (totalCards <= 0) return 0
  return Math.round((cardsCorrect / totalCards) * 100)
}
