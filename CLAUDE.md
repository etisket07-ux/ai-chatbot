# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI-powered chatbot** that reads stored business manuals and answers user questions using Claude API.

**Tech:** Next.js 15+ (App Router) + Hono + MongoDB Atlas + Anthropic SDK  
**Users:** ~5 people  
**Deployment:** Google Cloud

See `mem:architecture` for system design overview.

## Technology Stack

- **Frontend:** Next.js 15+ (React 19+), TypeScript
- **Backend:** Hono (in Next.js Route Handlers via wildcard routing)
- **Database:** MongoDB Atlas (Development cluster) + Mongoose ODM
- **AI/LLM:** Anthropic SDK (`@anthropic-ai/sdk`), Claude API
- **Testing:** Manual testing + Playwright (E2E)
- **Deployment:** Google Cloud (App Engine/Cloud Run)

See `mem:tech_stack` for dependencies and versions.

## Architecture

```
Browser (React + localStorage sessionId)
    ↓ HTTP
Hono API Endpoints (app/api/[...hono]/route.ts)
    ├─ POST /api/chat (user message → RAG search → Claude response)
    ├─ GET /api/messages (fetch conversation history)
    └─ POST /api/search-manuals (manual content retrieval)
    ↓
MongoDB Atlas
    ├─ conversations (chat history)
    └─ manuals (business manual content for RAG)
```

See `mem:architecture` for detailed component breakdown.

## Quick Start

### 1. Setup

```bash
npm install
```

Create `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Development

```bash
npm run dev          # Start at http://localhost:3000
npm run type-check   # TypeScript checks
npm run lint         # ESLint
npm run format       # Prettier
```

### 3. Testing

**Manual testing:**
- Open http://localhost:3000 in browser
- Test chat, message persistence, Claude responses
- Check MongoDB Atlas cluster for saved data

**E2E tests (Playwright):**
```bash
npx playwright test
```

See `mem:suggested_commands` for full command reference.

## Key Files & Locations

| File | Purpose |
|------|---------|
| `app/page.tsx` | Chat UI (React component) |
| `app/api/[...hono]/route.ts` | Hono server with all API endpoints |
| `lib/mongodb.ts` | MongoDB connection & utilities |
| `lib/rag.ts` | RAG search logic |
| `utils/sessionId.ts` | Browser session ID generation |
| `tests/e2e/chat.spec.ts` | Playwright E2E tests |

## API Endpoints

All endpoints in `app/api/[...hono]/route.ts`:

- **POST /api/chat** — Send user message, get Claude response  
  Request: `{ sessionId, message }`  
  Response: `{ sessionId, response, messageId }`

- **GET /api/messages?sessionId=...** — Fetch conversation history  
  Response: `{ sessionId, messages: [...] }`

- **POST /api/search-manuals** — Search manual content  
  Request: `{ query, limit, category }`  
  Response: `{ results: [...] }`

See `mem:api_integration` for detailed specs.

## Database Schema

**Collections:**
- `conversations` — Chat messages (sessionId, userId, messages[], timestamps)
- `manuals` — Business manual content (title, category, content, keywordTokens)

See `mem:database_schema` for full schema with indexes.

## RAG (Retrieval Augmented Generation)

**How it works:**
1. User asks question → extracted keywords
2. Search MongoDB `manuals` for relevant content
3. Assemble top results into Claude system prompt
4. Claude responds using manual context
5. Response saved to `conversations` collection

**Strategies:** Full-text search (recommended for start), keyword matching, vector embeddings (future)

See `mem:rag_strategy` for implementation details, search methods, and testing.

## Code Conventions

**TypeScript:**
- Strict mode enabled
- No `any` types (use `unknown` with narrowing)
- Function signatures with type annotations

**Naming:**
- camelCase: variables, functions
- PascalCase: types, interfaces, classes

**API/Backend:**
- RESTful endpoints
- Hono middleware for validation
- Try-catch for error handling
- Consistent error response format: `{ error: string, code: string }`

**Database:**
- Mongoose schemas with TypeScript interfaces
- Automatic timestamps (createdAt, updatedAt)
- Data validation before save

**Comments:**
- Minimal; prefer clear naming
- Comments only for non-obvious logic

See `mem:conventions` for full code style guide and file structure.

## Pre-Commit Checklist

Before pushing code:

```bash
npm run type-check   # TypeScript must pass
npm run lint         # No ESLint errors
npm run format       # Code formatted
```

**Manual testing:**
- ✅ Chat works in browser
- ✅ Messages persist in MongoDB
- ✅ Claude responses appear
- ✅ RAG returns relevant manual content
- ✅ Session ID persists in localStorage
- ✅ New browser sessions get new IDs

**E2E tests (if exists):**
```bash
npx playwright test
```

See `mem:task_completion` for full checklist.

## Environment Variables

**Required in `.env.local` (local development):**
```env
MONGODB_URI=mongodb+srv://...               # MongoDB Atlas connection
ANTHROPIC_API_KEY=sk-ant-...                # Anthropic API key
NEXT_PUBLIC_API_URL=http://localhost:3000   # Frontend API endpoint
```

**For production (Google Cloud):**
Set same variables in Google Cloud Secret Manager or Cloud Run environment.

## Important Notes

- **MongoDB Atlas Development cluster** is used for both local and production (not separate DBs)
- **Browser session IDs** stored in localStorage; no authentication system
- **Claude API key** managed via environment variables; never commit to git
- **5-user limit** — basic implementation without sophisticated scaling
- **Manual testing focus** — simple E2E tests as needed, not a test-heavy project

## Useful Resources

- Next.js App Router: https://nextjs.org/docs/app
- Hono: https://hono.dev/docs
- Mongoose: https://mongoosejs.com/docs
- Anthropic SDK: https://github.com/anthropics/anthropic-sdk-python
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

## Memory System

This project uses Serena memory for durable knowledge:

Start with `mem:core` for navigation. Key memories:
- `mem:architecture` — System design
- `mem:api_integration` — API endpoints & Claude integration
- `mem:database_schema` — MongoDB collections
- `mem:rag_strategy` — RAG implementation
- `mem:conventions` — Code style & patterns

Run `serena memories check` to validate all references.