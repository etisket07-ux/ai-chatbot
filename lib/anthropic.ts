import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Get chat response from Claude API
 */
export async function getChatResponse(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    return 'Error: Unexpected response type from Claude API';
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}
