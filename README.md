
# SaaS Customer Support UI

SaaS dashboard frontend for conversations, leads, analytics, AI training, and account settings.

## External API Integration

This frontend now uses a real external API over HTTP for all runtime data operations.

- API client: `src/app/services/api.ts`
- Environment template: `.env.example`
- API tests: `src/app/services/__tests__/api.test.ts`

## Prerequisites

- Node.js 20+
- npm 10+
- External API server running (see integration guide)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Set the API endpoint in `.env.local`:

```bash
VITE_API_URL=http://localhost:3100/api
VITE_API_TIMEOUT_MS=15000
VITE_API_TOKEN_STORAGE_KEY=saas.auth.token
```

## Run

```bash
npm run dev
```

## Test

```bash
npm run test
```

## Production Build

Set `VITE_API_URL` to your production API endpoint (HTTPS recommended), then build:

```bash
npm run build
```

Example:

```bash
VITE_API_URL=https://api.your-domain.com/api npm run build
```

## Endpoint Summary

The frontend calls these backend routes:

- `GET /auth/me`
- `PATCH /auth/profile`
- `GET /conversations`
- `GET /conversations/:id`
- `GET /conversations/:id/messages`
- `POST /conversations/:id/messages`
- `POST /conversations/:id/read`
- `GET /leads`
- `PATCH /leads/:id/status`
- `GET /leads/export`
- `GET /ai/knowledge-base`
- `POST /ai/knowledge-base`
- `PATCH /ai/knowledge-base/:id`
- `DELETE /ai/knowledge-base/:id`
- `POST /ai/train`
- `POST /ai/test`
- `GET /analytics/stats`
- `GET /analytics/charts`
- `GET /settings/integrations`
- `POST /settings/ai-toggle`
  