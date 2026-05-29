# Code Conventions

**TypeScript Style:**

- Strict mode enabled (`strict: true` in tsconfig.json)
- Naming: camelCase for variables/functions, PascalCase for classes/types/interfaces
- Async/await preferred over promises/callbacks
- Use type annotations for function parameters and returns

**File Structure:**

```
app/
  api/
    [...hono]/
      route.ts          # Hono server with all API endpoints
  page.tsx              # Chat UI
  layout.tsx
  globals.css
components/
  ChatMessage.tsx
  ChatInput.tsx
lib/
  mongodb.ts            # MongoDB connection + utility functions
  rag.ts                # RAG search logic
pages/ or app/          # Next.js pages
public/
utils/
  sessionId.ts          # Browser session ID generation
tests/
  e2e/
    chat.spec.ts        # Playwright E2E tests
.env.local              # Local environment variables (DO NOT COMMIT)
```

**Imports:**

- ES modules (modern)
- Next.js Server Components by default (unless `'use client'` needed)

**Database Schema (Mongoose):**

- Use TypeScript interfaces alongside Mongoose schemas
- Always validate data before saving to MongoDB
- Use Mongoose middleware for timestamps (createdAt, updatedAt)

**API Routes (Hono):**

- RESTful endpoints: POST /api/chat, GET /api/messages, POST /api/search-manuals
- Request validation with Hono middleware
- Consistent error response format: `{ error: string, code: string }`

**Error Handling:**

- Try-catch blocks in async functions
- Log errors with context (endpoint, user session, timestamp)
- Return meaningful error messages to client
- Never expose sensitive data (API keys, MongoDB connection strings) in error messages

**Comments:**

- Minimal docstrings; prefer clear naming
- Comments for non-obvious logic only (e.g., RAG relevance scoring, API rate limiting)
- Inline comments for business logic in chatbot responses

**Type Safety:**

- No `any` types; use `unknown` with type narrowing if needed
- Strict null checks enabled
- Interfaces for API requests/responses

**Code Style:**

- 2-space indentation (configured in Prettier)
- Semicolons required
- Single quotes for strings (Prettier config)
