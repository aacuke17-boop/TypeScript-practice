export type ScoringOption = {
  id: string
  isCorrect: boolean
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * score = points * max(0, selectedCorrect / allCorrect - selectedWrong / allWrong)
 * If a part has no options (division by zero), its share is 0.
 */
export function calcQuestionScore(
  points: number,
  options: ScoringOption[],
  selectedIds: Iterable<string>,
): number {
  const selected = new Set(selectedIds)
  const correct = options.filter((o) => o.isCorrect)
  const wrong = options.filter((o) => !o.isCorrect)

  const selectedCorrect = correct.filter((o) => selected.has(o.id)).length
  const selectedWrong = wrong.filter((o) => selected.has(o.id)).length

  const correctShare = correct.length > 0 ? selectedCorrect / correct.length : 0
  const wrongShare = wrong.length > 0 ? selectedWrong / wrong.length : 0

  return round2(points * Math.max(0, correctShare - wrongShare))
}