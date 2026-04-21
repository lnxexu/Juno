# Tech Stack

## Frontend

- Framework: React 18 + Vite
- Language: TypeScript
- State: Zustand
- Routing: React Router
- UI: Tailwind CSS + Radix UI
- Charts: Recharts
- Testing: Vitest + Testing Library

## API Integration

- API client location: `src/app/services/api.ts`
- Transport: `fetch` with JSON + CSV support
- Base URL: `VITE_API_URL`
- Timeout: `VITE_API_TIMEOUT_MS`
- Token key: `VITE_API_TOKEN_STORAGE_KEY`
- Error handling: normalized server/client errors into user-readable messages

## Backend (External Project)

- Location: outside frontend workspace (recommended `../Saas-external-api`)
- Reference style: `FinancialTracker/api`
- Runtime recommendation: Node.js + TypeScript
- API pattern: REST endpoints used by frontend stores/services

## API Domains

- Auth
- Conversations and Messages
- Leads
- AI Training / Knowledge Base
- Analytics
- Settings / Integrations

## Verification Commands

Frontend:

```bash
npm run test
npm run build
```

Set environment before build for production validation:

```bash
VITE_API_URL=https://api.your-domain.com/api npm run build
```
