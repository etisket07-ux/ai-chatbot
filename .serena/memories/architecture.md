# Architecture

## System Overview

**3-tier architecture (frontend + backend-in-route-handler + database):**

```
┌─────────────────┐
│  Browser (React)│  → Session ID stored in localStorage (unique per browser)
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────────────────────────┐
│  Next.js App Router                 │
│  ├─ pages/ (Chat UI)                │
│  └─ api/[...hono]/route.ts (Hono)   │
└────────┬────────────────────────────┘
         │ (async handlers)
         ↓
┌──────────────────────┐      ┌──────────────────────┐
│  Anthropic SDK       │      │  MongoDB Atlas       │
│  (Claude API)        │      │  - conversations     │
│  - LLM responses     │      │  - manuals (RAG)     │
└──────────────────────┘      └──────────────────────┘
```

## Data Flow

1. **User sends message** → Browser → HTTP POST `/api/chat` with sessionId + message
2. **RAG Search** → Hono searches MongoDB manuals collection for relevant content
3. **Claude API Call** → Hono calls Claude API with user message + RAG context
4. **Response handling** → Claude response saved to `conversations` collection → returned to browser
5. **UI Update** → React updates chat display with streamed/cached response

## Key Components

**Frontend:**

- Chat UI component (messages list, input field)
- Session ID generation & persistence
- API communication layer

**Backend (Hono in Route Handler):**

- `/api/chat` — POST endpoint for chat messages
- `/api/messages` — GET endpoint to fetch conversation history
- `/api/search-manuals` — POST endpoint for RAG manual search
- Error handling middleware
- MongoDB connection management

**Database (MongoDB Atlas):**

- `conversations` collection — chat messages
- `manuals` collection — business manual content
- Indexes on sessionId, createdAt for performance

## Integration Points

- **Claude API:** Used for generating intelligent responses based on user queries
- **MongoDB Atlas:** Central data store, used for RAG retrieval and conversation history
- **Google Cloud:** Deployment target (App Engine/Cloud Run)

See `mem:database_schema` for detailed schema information.
See `mem:api_integration` for API endpoint details.
