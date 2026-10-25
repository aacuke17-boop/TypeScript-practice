# Questionnaires: Payload CMS + TypeScript

A small application for creating and taking surveys and tests.

- **Authors** work in the Payload admin panel: they create questionnaires and tests,
  edit pages made of blocks, view attempts and export them to CSV.
- **Visitors** need no account: they open the site, take any published questionnaire
  and see the result.

## Live demo

- Site: https://quiz-hub-jet.vercel.app/
- CMS admin panel: https://type-script-practice-rosy.vercel.app//admin

## Repository structure

This is a monorepo.

```
.
├── cms/        Next.js + Payload 3 (admin panel, collections, REST endpoints, seed)
└── frontend/   Vite + TypeScript, vanilla JS without frameworks
```

### cms/

- `src/collections/`: Users, Media, Questionnaires, Pages, Attempts
- `src/globals/`: Header, Footer
- `src/blocks/`: Hero, Text, Image, QuestionnaireList
- `src/endpoints/`: custom API endpoints
- `src/lib/scoring.ts`: scoring formula
- `src/migrations/`: database migrations
- `src/seed.ts`: demo data

### frontend/

- `src/types/`: type aliases, intersection and union types, API response types
- `src/api.ts`: typed `fetchJson<T>()` returning `ApiResult<T>`
- `src/state.ts`: loading, error and ready states
- `src/router.ts`: client-side router (`/survey/<slug>` and CMS pages)
- `src/blocks/`, `src/renderBlocks.ts`: block renderers
- `src/pages/`: CMS page, questionnaire page, result, 404

## API

| Endpoint | Description |
|---|---|
| `GET /api/common` | Header and Footer as one flat JSON |
| `GET /api/page?path=` | Page with blocks (`404` for an unknown path) |
| `GET /api/questionnaire?slug=` | Questionnaire without correct answers |
| `POST /api/attempt` | Validates answers, scores a test, saves the attempt |
| `GET /api/export-csv?questionnaire=` | CSV export (authenticated authors only) |

## Scoring

For every question of a test:

```
score = points × max(0, selectedCorrect / allCorrect − selectedWrong / allWrong)
```

If a question has no wrong options, the second share is 0 (no division by zero).
Surveys are not scored. The total score of a test is the sum over its questions.

## Running locally

Requirements: Node.js 22 or newer and a PostgreSQL database (for example, a free Neon project).

### CMS

```bash
cd cms
npm install
cp .env.example .env      # then fill in the values
npm run dev
```

The admin panel opens at http://localhost:3000/admin. On the first start create
the first user. Demo data (optional):

```bash
npm run seed
```

The seed script **deletes all content** (attempts, pages, questionnaires, media)
and creates it again. Users are not touched.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # then fill in the value
npm run dev
```

The site opens at http://localhost:5173.

## Environment variables

### cms/.env

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled string on Vercel) |
| `PAYLOAD_SECRET` | Random secret string |
| `FRONTEND_URL` | Allowed frontend origins for CORS, comma separated, no trailing slash |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (production only; locally files go to `cms/media/`) |

### frontend/.env

| Variable | Description |
|---|---|
| `VITE_API_URL` | CMS address, for example `http://localhost:3000` (no trailing slash) |

## Deployment

Both projects are deployed to Vercel from this repository.

| Project | Root Directory | Variables |
|---|---|---|
| CMS | `cms` | `DATABASE_URL`, `PAYLOAD_SECRET`, `FRONTEND_URL`, `BLOB_READ_WRITE_TOKEN` |
| Frontend | `frontend` | `VITE_API_URL` |

- The database is a separate Neon project for production. Migrations are applied with
  the direct (non-pooled) connection string: `npm run payload -- migrate`.
- Uploaded images are stored in Vercel Blob, because the local folder is not
  persistent on Vercel.
- When creating a migration, set a dummy `BLOB_READ_WRITE_TOKEN`
  (`vercel_blob_rw_dummy_dummysecret`), otherwise the Blob plugin is disabled and its
  database column is not included in the migration.
- `frontend/vercel.json` rewrites all paths to `index.html`, so direct links to
  `/survey/<slug>` work.
- The first user of the production admin panel is created on the first visit to `/admin`.