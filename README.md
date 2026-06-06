# RepoMentor

An AI-powered GitHub project mentor that helps beginners understand and contribute to open-source repositories.

Paste any public GitHub repo URL and get:

- **Project summary** — what the project does, in plain language
- **Tech stack detection** — languages, frameworks, and tools with confidence scores
- **Setup instructions** — step-by-step local install guide
- **Folder guide** — purpose of each major directory
- **Good first issues** — recommended issues with difficulty ratings
- **Learning path** — structured steps from reading the README to opening a PR
- **PR checklist & test suggestions** — what to verify before submitting
- **Export** — download as Markdown or save as PDF
- **Caching** — analyses cached for 24 hours to save API calls

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
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new **OAuth App**
3. Set **Homepage URL** to `http://localhost:3000` (or your production URL)
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret into `.env.local`

Signing in gives you higher GitHub API rate limits (5,000/hr vs 60/hr).

## Push to GitHub & Deploy

The repo is initialized locally. Run these from the project directory:

```bash
# 1. Push to GitHub (creates repo + pushes main)
npm run push:github

# 2. Deploy to Vercel
npm run deploy
```

`push:github` uses `GITHUB_TOKEN` from `.env.local`.  
`deploy` uses `VERCEL_TOKEN` if set, otherwise opens interactive Vercel login.

### Deploy to Vercel (manual)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/repomentor)

Or:

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
| `AUTH_URL` | Yes | Your production URL (e.g. `https://repomentor.vercel.app`) |
| `GITHUB_TOKEN` | No | Server-side token for anonymous users |

Update your GitHub OAuth app's callback URL to:
`https://your-app.vercel.app/api/auth/callback/github`

## Features

### Caching
Analyses are cached in memory for 24 hours. Click **Refresh analysis** to bypass cache.

### Export
- **Export Markdown** — downloads a `.md` file with the full guide
- **Save as PDF** — opens the browser print dialog (choose "Save as PDF")

### Auth
Optional GitHub sign-in improves rate limits. The app works without signing in.

## How It Works

1. **GitHub API** fetches repo metadata, README, file tree, key config files, and open issues
2. **Tech detector** analyzes manifests and file extensions
3. **OpenAI** (gpt-4o-mini) generates beginner-friendly analysis
4. **Cache** stores results for repeat visits
5. Without an API key, a **fallback analyzer** provides heuristic-based guidance

## Tech Stack

- Next.js 15 (App Router)
- NextAuth v5 (GitHub OAuth)
- TypeScript
- Tailwind CSS 4
- GitHub REST API
- OpenAI API

## License

MIT
