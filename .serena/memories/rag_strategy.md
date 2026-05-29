# RAG (Retrieval Augmented Generation) Strategy

## Overview

RAG ensures Claude receives only relevant manual content when answering user questions. This reduces hallucinations and keeps responses grounded in actual business manuals.

## Implementation

**Location:** `lib/rag.ts`

### Search Strategy

When user asks a question:

1. **Query Parsing** — Extract keywords from user message
2. **MongoDB Search** — Search `manuals` collection
3. **Relevance Scoring** — Rank results by relevance
4. **Context Assembly** — Combine top results into prompt context

### Search Methods (choose one or combine)

**Method 1: Full-Text Search (simplest)**

```typescript
// MongoDB text index search
db.manuals
  .find({
    $text: { $search: userQuery },
    category: optionalCategory,
  })
  .limit(5)
  .sort({ score: { $meta: 'textScore' } });
```

**Method 2: Keyword Matching**

- Split user query into keywords
- Match against `keywordTokens` field
- Combine with category filter

**Method 3: Vector Embeddings (future)**

- Use OpenAI embeddings or similar
- Store vectors in MongoDB
- Use vector search for semantic matching
- More accurate but requires additional setup

## Context Assembly

```typescript
const ragContext = searchResults
  .map((result) => `## ${result.title} (${result.category})\n${result.content}`)
  .join('\n\n');

const systemPrompt = `You are a helpful company assistant with access to business manuals.
Use the following context to answer user questions:

${ragContext}

If the manual doesn't contain relevant information, say so clearly.`;
```

## RAG Prompt Guidelines

**System message template:**

```
You are a helpful company assistant with expertise in company policies and procedures.
You have access to the following manuals and documents:

[MANUAL CONTENT INSERTED HERE]

When answering questions:
1. Base your answer on the provided manual content
2. If the manual doesn't cover the topic, say "This topic is not covered in the available manuals"
3. Quote relevant sections when helpful
4. Ask clarifying questions if the user's question is ambiguous
```

## Performance Considerations

- **Keep context size reasonable** — aim for 5-10 most relevant results
- **Precompute embeddings** — if using vector search, embed all manuals upfront
- **Cache popular queries** — store recent RAG results in Redis (optional)
- **Monitor search quality** — track failed searches and manual coverage gaps

## Testing RAG

1. **Manual search endpoint** — Test `/api/search-manuals` directly
2. **Query variations** — Test same question with different wording
3. **Edge cases** — Test with empty results, partial matches, category filters
4. **Integration** — Test end-to-end: user question → RAG → Claude response

## Limitations & Future Improvements

**Current limitations:**

- Basic keyword/full-text search (not semantic)
- No handling of multi-part questions
- No follow-up context from previous messages

**Future improvements:**

- Vector embeddings for semantic search
- Conversation context for better relevance
- Manual versioning and obsolescence handling
- User feedback loop to improve search ranking
