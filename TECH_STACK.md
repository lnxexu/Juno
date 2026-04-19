# Tech Stack Implementation

## ✅ Implemented (Frontend)

### Current Stack
- **Framework**: React 18.3.1 (via Figma Make - React only, not Next.js)
- **Styling**: TailwindCSS 4.1.12
- **State Management**: Zustand 5.0.12 ✅
- **Routing**: React Router 7.13.0
- **Charts**: Recharts 2.15.2
- **Icons**: Lucide React

### File Structure
```
src/
├── app/
│   ├── components/
│   │   └── DashboardLayout.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── DashboardOverview.tsx
│   │   ├── ConversationsPage.tsx
│   │   ├── AITrainingPage.tsx
│   │   ├── LeadsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/
│   │   └── api.ts                # Mock API layer (ready for backend)
│   ├── store/
│   │   ├── authStore.ts          # Zustand store ✅
│   │   ├── conversationStore.ts  # Zustand store ✅
│   │   ├── leadsStore.ts         # Zustand store ✅
│   │   ├── aiTrainingStore.ts    # Zustand store ✅
│   │   └── analyticsStore.ts     # Zustand store ✅
│   ├── routes.tsx
│   └── App.tsx
└── styles/
    └── theme.css
```

## 🔄 Ready to Integrate (Backend)

### Your Target Stack

#### Backend (Node.js + NestJS)
- **Framework**: NestJS (recommended)
- **Database**: PostgreSQL
  - Use `pg` or `@nestjs/typeorm`
  - pgvector extension for embeddings
- **Caching/Queue**: Redis + BullMQ
- **ORM**: TypeORM or Prisma

#### AI Layer
- **OpenAI SDK**: `openai` npm package
  - GPT-4.1 Turbo for responses
  - GPT-4o mini for cost optimization
  - text-embedding-3-small for embeddings
- **Vector DB**: pgvector (PostgreSQL extension) or Pinecone

#### Integrations
- **Meta Graph API**: `axios` or `@nestjs/axios`
  - Facebook Messenger API
  - Instagram Direct API
- **Webhooks**: NestJS controllers with signature verification

## 📦 Backend Dependencies (to install)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/bullmq": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "bullmq": "^5.0.0",
    "openai": "^4.20.0",
    "axios": "^1.6.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  }
}
```

## 🎯 Feature Mapping

### 1. Authentication & Users
**Frontend**: `authStore.ts` → Mock API
**Backend**: NestJS Auth Module
```typescript
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/profile
```

### 2. Conversations (Meta Graph API)
**Frontend**: `conversationStore.ts` → Mock API
**Backend**: NestJS Conversations Module + Meta Service
```typescript
GET    /api/conversations
GET    /api/conversations/:id
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages
POST   /api/webhooks/meta           // Receive messages from Facebook/Instagram
```

**Meta Graph API Integration**:
```typescript
// Send message to Facebook/Instagram
POST https://graph.facebook.com/v18.0/me/messages
{
  "recipient": { "id": "USER_ID" },
  "message": { "text": "AI response here" }
}

// Webhook verification
GET /webhooks/meta?hub.mode=subscribe&hub.verify_token=...
```

### 3. Leads Management
**Frontend**: `leadsStore.ts` → Mock API
**Backend**: NestJS Leads Module
```typescript
GET    /api/leads
POST   /api/leads
PATCH  /api/leads/:id
GET    /api/leads/export            // CSV export
```

### 4. AI Training (OpenAI Embeddings)
**Frontend**: `aiTrainingStore.ts` → Mock API
**Backend**: NestJS AI Module + OpenAI Service
```typescript
GET    /api/ai/knowledge
POST   /api/ai/knowledge             // Add Q&A, generate embedding
PATCH  /api/ai/knowledge/:id
DELETE /api/ai/knowledge/:id
POST   /api/ai/train                 // Retrain model
POST   /api/ai/test                  // Test AI response
POST   /api/ai/generate              // Generate AI response (used in conversations)
```

**OpenAI Integration**:
```typescript
// Generate embedding for knowledge base
const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: question,
});

// Store in PostgreSQL with pgvector
INSERT INTO knowledge_base (question, answer, embedding)
VALUES ($1, $2, $3::vector);

// Find similar questions (semantic search)
SELECT * FROM knowledge_base
ORDER BY embedding <=> $1::vector
LIMIT 5;

// Generate AI response
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [
    { role: "system", content: "Knowledge: " + context },
    { role: "user", content: customerMessage }
  ],
});
```

### 5. Analytics
**Frontend**: `analyticsStore.ts` → Mock API
**Backend**: NestJS Analytics Module
```typescript
GET    /api/analytics/stats
GET    /api/analytics/charts
GET    /api/analytics/performance
```

## 🔄 Job Queue Architecture (BullMQ + Redis)

```typescript
// Queue: ai-response
{
  name: 'generate-response',
  data: {
    conversationId: 123,
    message: 'Customer question',
    useAI: true
  }
}

// Queue: lead-processing
{
  name: 'qualify-lead',
  data: {
    leadId: 456,
    conversationHistory: [...]
  }
}

// Queue: analytics-update
{
  name: 'update-stats',
  data: {
    userId: 'uuid',
    event: 'conversation-completed'
  }
}
```

## 🚀 Deployment Architecture

### Frontend (React)
- **Platform**: Vercel, Netlify, or AWS S3 + CloudFront
- **Build**: `pnpm build` (Vite production build)
- **Env Vars**: `VITE_API_URL`, `VITE_WS_URL`

### Backend (NestJS)
- **Platform**: Railway, Render, AWS ECS, or DigitalOcean
- **Database**: PostgreSQL (Railway, Supabase, AWS RDS)
- **Redis**: Railway, Redis Cloud, or AWS ElastiCache
- **Env Vars**:
  - `DATABASE_URL`
  - `REDIS_URL`
  - `OPENAI_API_KEY`
  - `META_APP_ID`
  - `META_APP_SECRET`
  - `META_PAGE_ACCESS_TOKEN`
  - `META_WEBHOOK_VERIFY_TOKEN`

## 📱 Mobile App (Future)

### Tech Stack
- **Framework**: React Native
- **State**: Zustand (same stores as web!)
- **Local DB**: WatermelonDB (offline-first)
- **Storage**: MMKV (fast key-value storage)
- **Sync**: WatermelonDB sync with NestJS backend

### Shared Code
```typescript
// Share Zustand stores between web and mobile
src/
├── shared/
│   ├── store/         # Zustand stores (shared)
│   ├── services/      # API client (shared)
│   └── types/         # TypeScript types (shared)
├── web/               # React web app
└── mobile/            # React Native app
```

## ✅ What's Done vs. What's Next

### ✅ Done (Frontend Prototype)
- Modern UI/UX with Tailwind
- Zustand state management
- Mock API layer (ready for backend)
- Real-time UI updates
- All 7 pages fully functional
- Responsive design

### 🔄 Next Steps (Backend Integration)
1. Set up NestJS project
2. Configure PostgreSQL + pgvector
3. Implement OpenAI service
4. Set up Meta Graph API webhooks
5. Add Redis + BullMQ for queues
6. Connect frontend to real API
7. Add WebSocket for real-time
8. Deploy to production

## 💡 Quick Start Command

When you're ready to build the backend:

```bash
# Create NestJS project
npx @nestjs/cli new backend

# Install dependencies
cd backend
npm install @nestjs/typeorm typeorm pg @nestjs/bullmq bullmq redis openai

# Generate modules
nest g module auth
nest g module conversations
nest g module leads
nest g module ai
nest g module analytics
nest g module integrations

# Copy the integration guide
cp ../INTEGRATION_GUIDE.md ./docs/
```
