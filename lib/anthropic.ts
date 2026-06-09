import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  return new Anthropic({ apiKey });
}

export async function getChatResponse(userMessage: string, systemPrompt: string): Promise<string> {
  const client = getClient();
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : 'Error: Unexpected response type';
}
