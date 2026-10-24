import { el } from '../dom'
import type { AttemptResult, QuestionnaireResponse, ReviewOption, ReviewQuestion } from '../types'

function renderReviewOption(option: ReviewOption): HTMLElement {
  let state = 'neutral'
  let mark = ''
  let note = ''

  if (option.selected && option.isCorrect) {
    state = 'correct'
    mark = '✓'
    note = 'Your answer, correct'
  } else if (option.selected && !option.isCorrect) {
    state = 'wrong'
    mark = '✗'
    note = 'Your answer, wrong'
  } else if (option.isCorrect) {
    state = 'missed'
    mark = '✓'
    note = 'Correct answer, not selected'
  }

  const item = el('li', { className: `review-option ${state}` })
  item.append(
    el('span', { className: 'review-mark', text: mark, attrs: { 'aria-hidden': 'true' } }),
    el('span', { className: 'review-text', text: option.text }),
  )
  if (note) {
    item.append(el('span', { className: 'review-note', text: note }))
  }
  return item
}

function renderReviewQuestion(question: ReviewQuestion, number: number): HTMLElement {
  return el('section', { className: 'review-question' }, [
    el('h3', { text: `${number}. ${question.text}` }),
    el('p', {
      className: 'review-earned',
      text: `Points: ${question.earned} of ${question.points}`,
    }),
    el('ul', { className: 'review-options' }, question.options.map(renderReviewOption)),
  ])
}

export function renderResult(
  quiz: QuestionnaireResponse,
  result: AttemptResult,
  onRetake: () => void,
): HTMLElement {
  const section = el('section', { className: 'result' }, [
    el('h1', { text: quiz.title }),
  ])

  // "isTest" is the discriminant: TypeScript knows which fields exist in each branch
  if (result.isTest) {
    section.append(
      el('p', {
        className: 'result-score',
        text: `Your score: ${result.score} out of ${result.maxScore}`,
      }),
      el('h2', { text: 'Review' }),
      ...result.review.map((question, index) => renderReviewQuestion(question, index + 1)),
    )
  } else {
    section.append(
      el('p', { className: 'result-saved', text: 'Thank you! Your answers have been saved.' }),
    )
  }

  const retake = el('button', { text: 'Take again', attrs: { type: 'button' } })
  retake.addEventListener('click', onRetake)

  section.append(
    el('div', { className: 'result-actions' }, [
      retake,
      el('a', { text: 'Back to home', attrs: { href: '/' } }),
    ]),
  )
  return section
}