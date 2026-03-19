export function calculateStreak(lastStudyDate, today, currentStreak) {
  if (!lastStudyDate) return 1

  const last = new Date(lastStudyDate)
  const now = new Date(today)
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return currentStreak
  if (diffDays === 1) return currentStreak + 1
  return 1
}
