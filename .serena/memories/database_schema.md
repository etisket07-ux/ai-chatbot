# Database Schema

## Mongoose Collections (MongoDB)

### conversations Collection

Stores all chat messages for each user session.

```typescript
{
  _id: ObjectId,
  sessionId: string,              // Unique browser session ID
  userId: string,                 // User identifier (can be same as sessionId for simplicity)
  messages: [
    {
      role: 'user' | 'assistant',
      content: string,            // Message text
      timestamp: Date,
      model?: string,             // Claude model used (for assistant messages)
      tokensUsed?: number         // Token count (optional, for monitoring)
    }
  ],
  createdAt: Date,                // Conversation created timestamp
  updatedAt: Date,                // Last message timestamp
  metadata?: {
    userAgent?: string,           // Browser info
    ipAddress?: string,           // Optional, for logging
  }
}
```

**Indexes:**

- `sessionId` (unique)
- `createdAt` (for sorting/pagination)
- `updatedAt` (for recent conversations)

### manuals Collection

Stores business manual content for RAG retrieval.

```typescript
{
  _id: ObjectId,
  title: string,                  // Manual section title
  category: string,               // Category (e.g., "HR", "IT", "Sales")
  content: string,                // Full text content
  keywordTokens?: string[],       // Keywords for faster search
  embeddingVector?: number[],     // Optional: vector embeddings for semantic search (future)
  createdAt: Date,                // Uploaded/created date
  updatedAt: Date,
  metadata?: {
    source?: string,              // Where the manual came from
    version?: string,             // Manual version
    author?: string               // Who uploaded it
  }
}
```

**Indexes:**

- `category` (for filtering)
- `title` (for full-text search)
- `content` (text index for search)
- `keywordTokens` (for exact matching)

## Connection

- **URI:** MongoDB Atlas Development cluster (used for both local and production)
- **Library:** Mongoose
- **Connection management:** Singleton pattern in `lib/mongodb.ts`

## Important Notes

- Use Mongoose middleware for automatic timestamp management
- Always validate schema before inserting data
- Use `.lean()` for read-only queries (performance)
- Implement connection pooling for production
- Never store sensitive data (API keys, tokens) in manuals collection
