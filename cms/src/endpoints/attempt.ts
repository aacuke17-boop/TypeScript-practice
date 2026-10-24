import type { Endpoint } from 'payload'
import { calcQuestionScore, round2 } from '../lib/scoring'
import { jsonError } from './helpers'

type RawAnswer = { questionId?: unknown; optionIds?: unknown }

export const attemptEndpoint: Endpoint = {
  path: '/attempt',
  method: 'post',
  handler: async (req) => {
    let body: unknown
    try {
      body = await req.json?.()
    } catch {
      return jsonError('Invalid JSON body')
    }
    if (typeof body !== 'object' || body === null) {
      return jsonError('Request body must be a JSON object')
    }

    const { slug, participantName, answers } = body as {
      slug?: unknown
      participantName?: unknown
      answers?: unknown
    }

    if (typeof slug !== 'string' || slug.trim() === '') {
      return jsonError('Field "slug" is required')
    }
    if (
      participantName !== undefined &&
      participantName !== null &&
      typeof participantName !== 'string'
    ) {
      return jsonError('Field "participantName" must be a string')
    }
    const name = typeof participantName === 'string' ? participantName.trim() : ''
    if (name.length > 100) {
      return jsonError('Participant name is too long (max 100 characters)')
    }
    if (!Array.isArray(answers)) {
      return jsonError('Field "answers" must be an array')
    }

    const found = await req.payload.find({
      collection: 'questionnaires',
      where: {
        and: [{ slug: { equals: slug.trim() } }, { published: { equals: true } }],
      },
      depth: 0,
      limit: 1,
    })
    const quiz = found.docs[0]
    if (!quiz) return jsonError('Questionnaire not found', 404)

    const questions = (quiz.questions ?? []).filter((q) => q.id)
    const questionMap = new Map(questions.map((q) => [q.id as string, q]))
    const selectedByQuestion = new Map<string, Set<string>>()

    for (const raw of answers as unknown[]) {
      const item = raw as RawAnswer | null
      if (!item || typeof item.questionId !== 'string' || !Array.isArray(item.optionIds)) {
        return jsonError('Each answer must have "questionId" and "optionIds"')
      }

      const question = questionMap.get(item.questionId)
      if (!question) return jsonError(`Unknown question: ${item.questionId}`)
      if (selectedByQuestion.has(item.questionId)) {
        return jsonError(`Duplicate answer for question: ${item.questionId}`)
      }

      const validIds = new Set((question.options ?? []).map((o) => o.id))
      const selected = new Set<string>()
      for (const optionId of item.optionIds as unknown[]) {
        if (typeof optionId !== 'string' || !validIds.has(optionId)) {
          return jsonError(`Unknown option for question ${item.questionId}`)
        }
        selected.add(optionId)
      }
      selectedByQuestion.set(item.questionId, selected)
    }

    const totalSelected = Array.from(selectedByQuestion.values()).reduce(
      (sum, set) => sum + set.size,
      0,
    )
    if (totalSelected === 0) return jsonError('Select at least one option')

    const stored: { questionId: string; optionIds: string[] }[] = []
    const review: {
      questionId: string
      text: string
      points: number
      earned: number
      options: { id: string; text: string; isCorrect: boolean; selected: boolean }[]
    }[] = []
    let score = 0
    let maxScore = 0

    for (const question of questions) {
      const questionId = question.id as string
      const selected = selectedByQuestion.get(questionId) ?? new Set<string>()
      stored.push({ questionId, optionIds: Array.from(selected) })

      if (!quiz.isTest) continue

      const options = (question.options ?? [])
        .filter((o) => o.id)
        .map((o) => ({
          id: o.id as string,
          text: o.text,
          isCorrect: Boolean(o.isCorrect),
        }))
      const points = question.points ?? 0
      const earned = calcQuestionScore(points, options, selected)

      score += earned
      maxScore += points
      review.push({
        questionId,
        text: question.text,
        points,
        earned,
        options: options.map((o) => ({ ...o, selected: selected.has(o.id) })),
      })
    }

    const finalScore = round2(score)

    await req.payload.create({
      collection: 'attempts',
      data: {
        questionnaire: quiz.id,
        participantName: name || undefined,
        score: quiz.isTest ? finalScore : null,
        answers: stored,
        completedAt: new Date().toISOString(),
      },
    })

    if (!quiz.isTest) {
      return Response.json({ isTest: false, saved: true }, { status: 201 })
    }

    return Response.json(
      { isTest: true, score: finalScore, maxScore: round2(maxScore), review },
      { status: 201 },
    )
  },
}