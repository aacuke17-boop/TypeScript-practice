import type { Endpoint, Where } from 'payload'
import { getSearchParams, jsonError } from './helpers'

type StoredAnswer = { questionId?: unknown; optionIds?: unknown }

// Quotes a cell and neutralizes spreadsheet formulas (=, +, -, @) in user-entered text
function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export const exportCsvEndpoint: Endpoint = {
  path: '/export-csv',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return jsonError('Unauthorized', 401)

    const param = getSearchParams(req).get('questionnaire')?.trim()
    if (!param) return jsonError('Parameter "questionnaire" is required (id or slug)')

    const where: Where = /^\d+$/.test(param)
      ? { id: { equals: Number(param) } }
      : { slug: { equals: param } }

    const found = await req.payload.find({
      collection: 'questionnaires',
      where,
      depth: 0,
      limit: 1,
    })
    const quiz = found.docs[0]
    if (!quiz) return jsonError('Questionnaire not found', 404)

    const attempts = await req.payload.find({
      collection: 'attempts',
      where: { questionnaire: { equals: quiz.id } },
      sort: 'completedAt',
      depth: 0,
      pagination: false,
    })

    const questions = (quiz.questions ?? []).filter((q) => q.id)

    const header = [
      'Attempt ID',
      'Participant',
      'Completed at',
      ...(quiz.isTest ? ['Score'] : []),
      ...questions.map((q) => `Answers to question: ${q.text}`),
    ]

    const optionTexts = new Map<string, string>()
    for (const q of questions) {
      for (const o of q.options ?? []) {
        if (o.id) optionTexts.set(o.id, o.text)
      }
    }

    const lines = [header.map(csvCell).join(',')]

    for (const attempt of attempts.docs) {
      const given = new Map<string, string[]>()
      if (Array.isArray(attempt.answers)) {
        for (const item of attempt.answers as StoredAnswer[]) {
          if (typeof item?.questionId === 'string' && Array.isArray(item.optionIds)) {
            given.set(
              item.questionId,
              (item.optionIds as unknown[]).filter((id): id is string => typeof id === 'string'),
            )
          }
        }
      }

      const row = [
        attempt.id,
        attempt.participantName ?? '',
        attempt.completedAt,
        ...(quiz.isTest ? [attempt.score ?? ''] : []),
        ...questions.map((q) =>
          (given.get(q.id as string) ?? [])
            .map((id) => optionTexts.get(id))
            .filter((text): text is string => Boolean(text))
            .join('; '),
        ),
      ]
      lines.push(row.map(csvCell).join(','))
    }

    // '\uFEFF' (BOM) makes the file utf-8-sig, so Excel shows Cyrillic correctly
    return new Response(`\uFEFF${lines.join('\r\n')}\r\n`, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${quiz.slug}-attempts.csv"`,
      },
    })
  },
}