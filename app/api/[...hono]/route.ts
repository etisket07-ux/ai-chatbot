import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { dbConnect } from '@/lib/mongodb';
import { Conversation } from '@/lib/models/Conversation';
import { searchManuals, assembleContext, generateSystemPrompt } from '@/lib/rag';
import { getChatResponse } from '@/lib/anthropic';
import { logger } from '@/lib/logger';

const app = new Hono().basePath('/api');

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/chat', async (c) => {
  const start = Date.now();
  try {
    const body = await c.req.json();
    const { sessionId, message } = body as { sessionId?: string; message?: string };

    if (!sessionId || !message) {
      return c.json({ error: 'sessionId and message are required', code: 'MISSING_FIELDS' }, 400);
    }

    await dbConnect();

    const manualResults = await searchManuals(message, 3);
    const ragContext = assembleContext(manualResults);
    const systemPrompt = generateSystemPrompt(ragContext);

    const assistantResponse = await getChatResponse(message, systemPrompt);

    const userMsg = { role: 'user' as const, content: message, timestamp: new Date() };
    const assistantMsg = { role: 'assistant' as const, content: assistantResponse, timestamp: new Date() };

    await Conversation.findOneAndUpdate(
      { sessionId },
      {
        $setOnInsert: { userId: sessionId },
        $push: { messages: { $each: [userMsg, assistantMsg] } },
      },
      { upsert: true, new: true }
    );

    logger.info('chat request completed', {
      sessionId,
      manualHits: manualResults.length,
      durationMs: Date.now() - start,
    });

    return c.json({ sessionId, response: assistantResponse });
  } catch (error) {
    logger.error('Error in /api/chat', { error: String(error), durationMs: Date.now() - start });
    return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
  }
});

app.get('/messages', async (c) => {
  try {
    const sessionId = c.req.query('sessionId');
    const limit = parseInt(c.req.query('limit') ?? '50', 10);

    if (!sessionId) {
      return c.json({ error: 'sessionId is required', code: 'MISSING_FIELDS' }, 400);
    }

    await dbConnect();

    const conversation = await Conversation.findOne({ sessionId }).lean();

    if (!conversation) {
      return c.json({ sessionId, messages: [] });
    }

    const messages = conversation.messages.slice(-limit);
    return c.json({ sessionId, messages });
  } catch (error) {
    logger.error('Error in /api/messages', { error: String(error) });
    return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
  }
});

app.post('/search-manuals', async (c) => {
  try {
    const body = await c.req.json();
    const { query, limit = 5, category } = body as {
      query?: string;
      limit?: number;
      category?: string;
    };

    if (!query) {
      return c.json({ error: 'query is required', code: 'MISSING_FIELDS' }, 400);
    }

    await dbConnect();

    const results = await searchManuals(query, limit);
    const filtered = category
      ? results.filter((r) => r.category === category)
      : results;

    return c.json({ results: filtered });
  } catch (error) {
    logger.error('Error in /api/search-manuals', { error: String(error) });
    return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
  }
});

export const POST = handle(app);
export const GET = handle(app);
