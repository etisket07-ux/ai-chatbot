# API Integration

## Hono API Endpoints

All endpoints are in `app/api/[...hono]/route.ts` using Hono framework.

### POST /api/chat

**Purpose:** Handle user message and return Claude response.

**Request:**

```json
{
  "sessionId": "unique-session-id",
  "message": "User's question"
}
```

**Response:**

```json
{
  "sessionId": "unique-session-id",
  "response": "Claude's answer based on manual context",
  "messageId": "db-message-id"
}
```

**Flow:**

1. Validate sessionId and message
2. Search MongoDB manuals collection using RAG
3. Call Claude API with user message + RAG context
4. Save both user message and response to `conversations` collection
5. Return response to client

### GET /api/messages

**Purpose:** Fetch conversation history for a session.

**Query Parameters:**

- `sessionId` (required)
- `limit` (optional, default: 50)

**Response:**

```json
{
  "sessionId": "unique-session-id",
  "messages": [
    {
      "role": "user",
      "content": "...",
      "timestamp": "2026-05-29T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "...",
      "timestamp": "2026-05-29T10:00:05Z"
    }
  ]
}
```

### POST /api/search-manuals

**Purpose:** Search manual content (for RAG).

**Request:**

```json
{
  "query": "User's question or keywords",
  "limit": 5,
  "category": "optional-category"
}
```

**Response:**

```json
{
  "results": [
    {
      "_id": "manual-id",
      "title": "Manual section title",
      "content": "Relevant excerpt",
      "category": "HR",
      "score": 0.95
    }
  ]
}
```

**Notes:**

- Used internally by `/api/chat` for RAG context
- Can also be called directly for manual content testing

## Claude API Integration

**SDK:** @anthropic-ai/sdk

**Environment Variable:** `ANTHROPIC_API_KEY`

**Usage Pattern:**

```typescript
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Use latest
  max_tokens: 1024,
  system: `You are a helpful assistant with access to company manuals.\n\n${ragContext}`,
  messages: [
    {
      role: 'user',
      content: userMessage,
    },
  ],
});
```

**Best Practices:**

- Include retrieved manual context in system prompt
- Set appropriate max_tokens based on response needs
- Handle API rate limits gracefully
- Log token usage for monitoring
- Always use try-catch for API calls

## Error Responses

Standardized error format across all endpoints:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

**Common error codes:**

- `INVALID_SESSION` — sessionId missing or invalid
- `NO_MANUAL_FOUND` — RAG search returned no relevant results
- `CLAUDE_API_ERROR` — Claude API call failed
- `DB_ERROR` — MongoDB operation failed
- `VALIDATION_ERROR` — Request validation failed

## Rate Limiting (Future)

Consider implementing:

- Per-session message limits
- Claude API token budgeting
- MongoDB read/write limits
