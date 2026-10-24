import { fetchJson, postJson } from '../api'
import { el } from '../dom'
import { showError, showLoading, showReady } from '../state'
import type {
  AnswerPayload,
  AttemptRequest,
  AttemptResult,
  QuestionData,
  QuestionnaireResponse,
  Slug,
} from '../types'
import { renderNotFound } from './notFound'
import { renderResult } from './result'

function renderIntro(quiz: QuestionnaireResponse): HTMLElement {
  const intro = el('header', { className: 'survey-intro' }, [
    el('span', {
      className: quiz.isTest ? 'badge badge-test' : 'badge badge-survey',
      text: quiz.isTest ? 'Test' : 'Survey',
    }),
    el('h1', { text: quiz.title }),
  ])

  if (quiz.description) {
    intro.append(el('p', { className: 'survey-description', text: quiz.description }))
  }
  if (quiz.cover) {
    intro.append(
      el('img', {
        className: 'survey-cover',
        attrs: { src: quiz.cover.url, alt: quiz.cover.alt },
      }),
    )
  }
  return intro
}

function renderQuestion(question: QuestionData, number: number, isTest: boolean): HTMLElement {
  const fieldset = el(
    'fieldset',
    { className: 'question', attrs: { 'data-question-id': question.id } },
    [el('legend', { text: `${number}. ${question.text}` })],
  )

  if (isTest) {
    const word = question.points === 1 ? 'point' : 'points'
    fieldset.append(el('p', { className: 'question-points', text: `${question.points} ${word}` }))
  }
  fieldset.append(el('p', { className: 'question-hint', text: 'Select all that apply' }))

  for (const option of question.options) {
    const input = el('input', {
      attrs: { type: 'checkbox', name: `q-${question.id}`, value: option.id },
    })
    fieldset.append(el('label', { className: 'option' }, [input, el('span', { text: option.text })]))
  }
  return fieldset
}

function collectAnswers(form: HTMLFormElement): AnswerPayload[] {
  const answers: AnswerPayload[] = []

  form.querySelectorAll<HTMLFieldSetElement>('fieldset.question').forEach((fieldset) => {
    const questionId = fieldset.dataset.questionId
    if (!questionId) return

    const optionIds = Array.from(
      fieldset.querySelectorAll<HTMLInputElement>('input[type="checkbox"]:checked'),
    ).map((input) => input.value)

    answers.push({ questionId, optionIds })
  })

  return answers
}

// isCurrent() returns false if the visitor has already navigated elsewhere
export async function renderQuestionnairePage(
  container: HTMLElement,
  slug: Slug,
  siteName: string,
  isCurrent: () => boolean,
): Promise<void> {
  showLoading(container)

  const loaded = await fetchJson<QuestionnaireResponse>(
    `/api/questionnaire?slug=${encodeURIComponent(slug)}`,
  )
  if (!isCurrent()) return

  if (loaded.status === 'error') {
    if (loaded.httpStatus === 404) {
      document.title = `Page not found — ${siteName}`
      renderNotFound(container)
      return
    }
    showError(container, loaded.message, () => {
      void renderQuestionnairePage(container, slug, siteName, isCurrent)
    })
    return
  }

  const quiz = loaded.data
  document.title = `${quiz.title} — ${siteName}`

  // ---------- form ----------
  const nameInput = el('input', {
    attrs: {
      type: 'text',
      id: 'participant-name',
      name: 'participantName',
      maxlength: '100',
      autocomplete: 'name',
    },
  })
  const nameField = el('div', { className: 'name-field' }, [
    el('label', { text: 'Your name (optional)', attrs: { for: 'participant-name' } }),
    nameInput,
  ])

  const errorBox = el('p', { className: 'form-error', attrs: { role: 'alert' } })
  const submitButton = el('button', { text: 'Submit', attrs: { type: 'submit' } })

  const form = el('form', { className: 'survey-form' }, [
    nameField,
    ...quiz.questions.map((question, index) => renderQuestion(question, index + 1, quiz.isTest)),
    errorBox,
    submitButton,
  ])

  let submitting = false

  async function send(answers: AnswerPayload[]): Promise<void> {
    const request: AttemptRequest = { slug: quiz.slug, answers }
    const name = nameInput.value.trim()
    if (name) request.participantName = name

    const result = await postJson<AttemptResult>('/api/attempt', request)
    if (!isCurrent()) return

    if (result.status === 'error') {
      // Keep the form and the chosen answers, let the visitor try again
      errorBox.textContent = result.message
      submitting = false
      submitButton.disabled = false
      submitButton.textContent = 'Submit'
      return
    }

    showReady(
      container,
      renderResult(quiz, result.data, () => {
        void renderQuestionnairePage(container, slug, siteName, isCurrent)
      }),
    )
    window.scrollTo(0, 0)
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    if (submitting) return

    const answers = collectAnswers(form)
    if (!answers.some((answer) => answer.optionIds.length > 0)) {
      errorBox.textContent = 'Select at least one option.'
      return
    }

    submitting = true
    submitButton.disabled = true
    submitButton.textContent = 'Submitting…'
    errorBox.textContent = ''
    void send(answers)
  })

  showReady(container, renderIntro(quiz), form)
}