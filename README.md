# RepoMentor

An AI-powered GitHub project mentor that helps beginners understand and contribute to open-source repositories.

Paste any public GitHub repo URL and get:

- **Project summary**: what the project does, in plain language
- **Tech stack detection**: languages, frameworks, and tools with confidence scores
- **Setup instructions**: step-by-step local install guide
- **Folder guide**: purpose of each major directory
- **Good first issues**: recommended issues with difficulty ratings
- **Learning path**: structured steps from reading the README to opening a PR
- **PR checklist and test suggestions**: what to verify before submitting
- **Export**: download as Markdown or save as PDF
- **Caching**: public analyses cached for 24 hours

## Quick Start

```bash
npm install
cp .env.example .env.local
```

Add to `.env.local`:

```env
OPENAI_API_KEY=sk-...
AUTH_SECRET=...          # openssl rand -base64 32
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Repository Access Policy

RepoMentor supports public GitHub repositories only. It does not use a broad server-side GitHub token to fetch repository content, and private repository analysis is rejected before repository contents are read.

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Create a new **OAuth App**.
3. Set **Homepage URL** to `http://localhost:3000` or your production URL.
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`.
5. Copy Client ID and Client Secret into `.env.local`.

GitHub access tokens remain server-side and are not exposed to browser sessions.

## Production Rate Limiting

Production deployments require distributed rate limiting through Upstash Redis:

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

The local development server falls back to an in-memory limiter. Production refuses analysis requests if Redis is not configured.

## Push to GitHub and Deploy

The repo can be published from the project directory:

```bash
npm run push:github
npm run deploy
```

`push:github` uses `GITHUB_TOKEN` from `.env.local` for local publishing only. Do not deploy `GITHUB_TOKEN` as a runtime environment variable.

`deploy` uses `VERCEL_TOKEN` if set, otherwise it starts interactive Vercel login.

### Deploy to Vercel

```bash
npx vercel --prod
```

Set these environment variables in the Vercel dashboard:

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI analysis |
| `AUTH_SECRET` | Yes | Random secret (`openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` | Yes | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | Yes | GitHub OAuth client secret |
| `AUTH_URL` | Yes | Your production URL, such as `https://repomentor.vercel.app` |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis REST URL for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis REST token for distributed rate limiting |

Update your GitHub OAuth app callback URL after deployment:

```text
https://your-app.vercel.app/api/auth/callback/github
```

## Features

### Caching

Public repository analyses are cached globally in memory for 24 hours. Click **Refresh analysis** to bypass cache when signed in.

### Export

- **Export Markdown** downloads a `.md` file with the full guide.
- **Save as PDF** opens the browser print dialog.

### Auth

Optional GitHub sign-in enables account-aware controls. It does not grant private repository analysis.

## How It Works

1. GitHub API fetches public repo metadata, README, file tree, key config files, and open issues.
2. Tech detector analyzes manifests and file extensions.
3. OpenAI generates beginner-friendly analysis from explicitly untrusted repository content.
4. Zod validates AI JSON before the UI receives it.
5. Upstash Redis protects expensive analysis endpoints with distributed production rate limits.
6. Cache stores public repository results for repeat visitors.
7. Without an API key, a fallback analyzer provides heuristic-based guidance.

## Tech Stack

- Next.js App Router
- NextAuth v5 with GitHub OAuth
- TypeScript
- Tailwind CSS 4
- GitHub REST API
- OpenAI API
- Upstash Redis REST for production rate limiting

## License

MIT
