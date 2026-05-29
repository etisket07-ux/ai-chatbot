import { Hono } from 'hono';
import { handle } from 'hono/vercel';

const app = new Hono().basePath('/api');

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// Placeholder endpoints
app.post('/chat', (c) => {
  return c.json({ message: 'Chat endpoint - coming soon' });
});

app.get('/messages', (c) => {
  return c.json({ messages: [] });
});

app.post('/search-manuals', (c) => {
  return c.json({ results: [] });
});

export const POST = handle(app);
export const GET = handle(app);
