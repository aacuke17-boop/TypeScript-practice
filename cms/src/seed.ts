import sharp from 'sharp'
import { getPayload } from 'payload'
import config from './payload.config'
import { calcQuestionScore, round2 } from './lib/scoring'
import type { Page } from './payload-types'

// ---------- Images ----------

const IMAGES = {
    banner: { file: 'banner.png', alt: 'Abstract blue banner', background: '#2c5bd1', accent: '#9db8ff' },
    js: { file: 'cover-js.png', alt: 'Yellow abstract cover', background: '#b8860b', accent: '#ffd966' },
    geo: { file: 'cover-geo.png', alt: 'Green abstract cover', background: '#1b7a43', accent: '#8fe0b0' },
    feedback: { file: 'cover-feedback.png', alt: 'Purple abstract cover', background: '#7b3fa0', accent: '#d8b4f0' },
    weekend: { file: 'cover-weekend.png', alt: 'Orange abstract cover', background: '#c2410c', accent: '#fdba74' },
}

type ImageKey = keyof typeof IMAGES

async function makeImage(background: string, accent: string): Promise<Buffer> {
    const width = 1200
    const height = 675
    const overlay = Buffer.from(
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` +
        `<circle cx="980" cy="150" r="230" fill="${accent}" fill-opacity="0.35"/>` +
        `<circle cx="200" cy="560" r="300" fill="${accent}" fill-opacity="0.25"/>` +
        `<circle cx="640" cy="340" r="90" fill="#ffffff" fill-opacity="0.45"/>` +
        `</svg>`,
    )

    return sharp({ create: { width, height, channels: 3, background } })
        .composite([{ input: overlay }])
        .png()
        .toBuffer()
}

// ---------- Questionnaire data ----------

type OptionDef = { text: string; correct?: boolean }
type QuestionDef = { text: string; points?: number; options: OptionDef[] }
// picks[i] holds indexes of the options chosen for question i
type AttemptDef = { name?: string; picks: number[][] }
type QuizDef = {
    title: string
    slug: string
    description: string
    isTest: boolean
    cover?: ImageKey
    questions: QuestionDef[]
    attempts: AttemptDef[]
}

const ok = (text: string): OptionDef => ({ text, correct: true })
const opt = (text: string): OptionDef => ({ text })

const QUIZZES: QuizDef[] = [
    // ----- Tests -----
    {
        title: 'JavaScript basics',
        slug: 'js-basics',
        description: 'Check how well you know the fundamentals of JavaScript.',
        isTest: true,
        cover: 'js',
        questions: [
            {
                text: 'Which keywords declare a variable in JavaScript?',
                points: 2,
                options: [ok('let'), ok('const'), ok('var'), opt('int'), opt('dim')],
            },
            {
                text: 'What does typeof null return?',
                points: 3,
                options: [opt('"null"'), ok('"object"'), opt('"undefined"'), opt('"number"')],
            },
            {
                text: 'Which array methods return a new array?',
                points: 4,
                options: [ok('map'), ok('filter'), opt('forEach'), opt('push'), ok('slice')],
            },
        ],
        attempts: [
            { name: 'Olena', picks: [[0, 1, 2], [1], [0, 1, 4]] },
            { name: 'Max', picks: [[0, 1], [1], [0, 2]] },
            { name: 'Ira', picks: [[0, 3], [0], [0, 1, 4, 3]] },
            { picks: [[0, 1, 2], [2], [1, 4]] },
        ],
    },
    {
        title: 'World geography',
        slug: 'world-geography',
        description: 'Capitals, countries and oceans: how much do you know about our planet?',
        isTest: true,
        cover: 'geo',
        questions: [
            {
                text: 'What is the capital of Ukraine?',
                points: 2,
                options: [ok('Kyiv'), opt('Lviv'), opt('Kharkiv'), opt('Odesa')],
            },
            {
                text: 'Which of these countries are in Europe?',
                points: 3,
                options: [ok('France'), ok('Poland'), opt('Brazil'), opt('Egypt')],
            },
            {
                text: 'Which oceans touch the coast of Africa?',
                points: 5,
                options: [ok('Atlantic'), ok('Indian'), opt('Arctic'), opt('Pacific')],
            },
        ],
        attempts: [
            { name: 'Taras', picks: [[0], [0, 1], [0, 1]] },
            { name: 'Sofia', picks: [[0], [0, 1, 2], [0]] },
            { name: 'Andriy', picks: [[1], [0, 1], [0, 1, 2, 3]] },
            { name: 'Anna', picks: [[0], [2, 3], [1]] },
            { picks: [[2], [1], [0, 1]] },
        ],
    },
    {
        title: 'Math essentials',
        slug: 'math-essentials',
        description: 'Multiplication, prime numbers and simple equations.',
        isTest: true,
        questions: [
            {
                text: 'What is 7 × 8?',
                points: 2,
                options: [opt('54'), ok('56'), opt('63'), opt('49')],
            },
            {
                // Every option is correct: the "wrong options" share is 0 (no division by zero)
                text: 'Which of these numbers are prime?',
                points: 3,
                options: [ok('2'), ok('3'), ok('5'), ok('7')],
            },
            {
                text: 'Which equations have the solution x = 2?',
                points: 5,
                options: [ok('x + 3 = 5'), ok('2x = 4'), opt('x − 2 = 1'), opt('x² = 9'), ok('3x = 6')],
            },
        ],
        attempts: [
            { name: 'Oksana', picks: [[1], [0, 1, 2, 3], [0, 1, 4]] },
            { name: 'Dmytro', picks: [[1], [0, 1], [0, 1]] },
            { name: 'Kateryna', picks: [[0], [3], [2, 3]] },
            { name: 'Bohdan', picks: [[1], [0, 1, 2], [0, 4, 2]] },
            { picks: [[3], [0, 1, 2, 3], [0, 1, 4, 3]] },
        ],
    },

    // ----- Surveys -----
    {
        title: 'Course feedback',
        slug: 'course-feedback',
        description: 'Tell us what you think about the course.',
        isTest: false,
        cover: 'feedback',
        questions: [
            {
                text: 'How would you rate the course overall?',
                options: [opt('Excellent'), opt('Good'), opt('Average'), opt('Poor')],
            },
            {
                text: 'Which parts were the most useful?',
                options: [opt('Videos'), opt('Practical tasks'), opt('Reading materials'), opt('Live sessions')],
            },
            {
                text: 'Would you recommend this course to a friend?',
                options: [opt('Yes'), opt('Maybe'), opt('No')],
            },
        ],
        attempts: [
            { name: 'Olena', picks: [[0], [1, 3], [0]] },
            { name: 'Max', picks: [[1], [1], [0]] },
            { name: 'Ira', picks: [[2], [0, 2], [1]] },
            { picks: [[3], [0], [2]] },
            { name: 'Andriy', picks: [[0], [1, 2, 3], [0]] },
        ],
    },
    {
        title: 'Weekend preferences',
        slug: 'weekend-preferences',
        description: 'How do you like to spend your free time?',
        isTest: false,
        cover: 'weekend',
        questions: [
            {
                text: 'How do you usually spend your weekends?',
                options: [opt('Outdoors'), opt('At home'), opt('With friends or family'), opt('Working or studying')],
            },
            {
                text: 'Which activities do you enjoy?',
                options: [opt('Reading'), opt('Sports'), opt('Cooking'), opt('Gaming'), opt('Travelling')],
            },
            {
                text: 'How do you prefer to plan a day off?',
                options: [opt('Strictly planned'), opt('Roughly planned'), opt('Spontaneous')],
            },
        ],
        attempts: [
            { name: 'Taras', picks: [[0], [0, 1, 4], [2]] },
            { name: 'Sofia', picks: [[2], [2, 3], [1]] },
            { picks: [[1], [0, 3], [0]] },
            { name: 'Anna', picks: [[2], [1, 2, 4], [2]] },
        ],
    },
    {
        title: 'Learning habits',
        slug: 'learning-habits',
        description: 'Help us understand how you study.',
        isTest: false,
        questions: [
            {
                text: 'When do you study best?',
                options: [opt('Morning'), opt('Afternoon'), opt('Evening'), opt('Night')],
            },
            {
                text: 'What helps you stay focused?',
                options: [opt('Music'), opt('Silence'), opt('Short breaks'), opt('Study groups')],
            },
            {
                text: 'Which format do you prefer?',
                options: [opt('Video lessons'), opt('Articles'), opt('Interactive tasks'), opt('Books')],
            },
        ],
        attempts: [
            { name: 'Oksana', picks: [[0], [2], [2]] },
            { name: 'Dmytro', picks: [[3], [0, 2], [0, 2]] },
            { picks: [[1], [1, 2], [1]] },
            { name: 'Kateryna', picks: [[2], [0, 3], [3]] },
        ],
    },
]

// ---------- Seeding ----------

async function main(): Promise<void> {
    const payload = await getPayload({ config })

    console.log('Clearing old content…')
    // Order matters: attempts and pages refer to questionnaires and media
    await payload.delete({ collection: 'attempts', where: { id: { exists: true } } })
    await payload.delete({ collection: 'pages', where: { id: { exists: true } } })
    await payload.delete({ collection: 'questionnaires', where: { id: { exists: true } } })
    await payload.delete({ collection: 'media', where: { id: { exists: true } } })

    console.log('Creating images…')
    const media = {} as Record<ImageKey, number>
    for (const key of Object.keys(IMAGES) as ImageKey[]) {
        const image = IMAGES[key]
        const data = await makeImage(image.background, image.accent)
        const doc = await payload.create({
            collection: 'media',
            data: { alt: image.alt },
            file: { data, mimetype: 'image/png', name: image.file, size: data.length },
        })
        media[key] = doc.id
    }

    console.log('Updating header and footer…')
    await payload.updateGlobal({
        slug: 'header',
        data: {
            siteName: 'Quiz Hub',
            menu: [
                { label: 'Home', path: '/' },
                { label: 'Tests', path: '/tests' },
                { label: 'Surveys', path: '/surveys' },
            ],
        },
    })
    await payload.updateGlobal({
        slug: 'footer',
        data: {
            text: '© 2026 Quiz Hub',
            contact: 'hello@quizhub.example',
        },
    })

    console.log('Creating questionnaires and attempts…')
    const testIds: number[] = []
    const surveyIds: number[] = []
    let attemptCount = 0

    for (const [quizIndex, def] of QUIZZES.entries()) {
        const quiz = await payload.create({
            collection: 'questionnaires',
            data: {
                title: def.title,
                slug: def.slug,
                description: def.description,
                isTest: def.isTest,
                published: true,
                cover: def.cover ? media[def.cover] : undefined,
                questions: def.questions.map((question) => ({
                    text: question.text,
                    points: def.isTest ? (question.points ?? 1) : 0,
                    options: question.options.map((option) => ({
                        text: option.text,
                        isCorrect: Boolean(option.correct),
                    })),
                })),
            },
        })

        if (def.isTest) testIds.push(quiz.id)
        else surveyIds.push(quiz.id)

        for (const [attemptIndex, attempt] of def.attempts.entries()) {
            let score = 0

            const answers = (quiz.questions ?? []).map((question, questionIndex) => {
                const scoringOptions = (question.options ?? []).map((option) => ({
                    id: option.id as string,
                    isCorrect: Boolean(option.isCorrect),
                }))

                const optionIds = (attempt.picks[questionIndex] ?? []).map((index) => {
                    const option = scoringOptions[index]
                    if (!option) throw new Error(`Bad option index ${index} in "${def.slug}"`)
                    return option.id
                })

                // The same function as in the /api/attempt endpoint
                if (def.isTest) {
                    score += calcQuestionScore(question.points ?? 0, scoringOptions, optionIds)
                }

                return { questionId: question.id as string, optionIds }
            })

            // Spread the attempts over the last week
            const hoursAgo = 5 + quizIndex * 11 + attemptIndex * 29

            await payload.create({
                collection: 'attempts',
                data: {
                    questionnaire: quiz.id,
                    participantName: attempt.name,
                    score: def.isTest ? round2(score) : null,
                    answers,
                    completedAt: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
                },
            })
            attemptCount += 1
        }
    }

    console.log('Creating pages…')
    const homeLayout: Page['layout'] = [
        {
            blockType: 'hero',
            heading: 'Quizzes and surveys',
            subheading: 'Test your knowledge or share your opinion',
        },
        {
            blockType: 'text',
            body:
                'Choose any test or survey below. No registration is needed: just pick a questionnaire, ' +
                'answer the questions and see the result.',
        },
        { blockType: 'image', image: media.banner },
        { blockType: 'questionnaireList', heading: 'All materials' },
    ]

    await payload.create({
        collection: 'pages',
        data: { title: 'Home', path: '/', layout: homeLayout },
    })
    await payload.create({
        collection: 'pages',
        data: {
            title: 'Tests',
            path: '/tests',
            layout: [
                { blockType: 'hero', heading: 'Tests', subheading: 'Answer the questions and get a score' },
                { blockType: 'questionnaireList', heading: 'Available tests', items: testIds },
            ],
        },
    })
    await payload.create({
        collection: 'pages',
        data: {
            title: 'Surveys',
            path: '/surveys',
            layout: [
                { blockType: 'hero', heading: 'Surveys', subheading: 'Share your opinion, no right or wrong answers' },
                { blockType: 'questionnaireList', heading: 'Available surveys', items: surveyIds },
            ],
        },
    })

    console.log(
        `Done: ${Object.keys(IMAGES).length} images, ${QUIZZES.length} questionnaires, ` +
        `${attemptCount} attempts, 3 pages.`,
    )
}

try {
  await main()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}