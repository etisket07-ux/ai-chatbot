import { Manual } from './models/Manual';
import { dbConnect } from './mongodb';

/**
 * Search for relevant manual content based on user query
 * Used for RAG (Retrieval Augmented Generation)
 */
export async function searchManuals(query: string, limit = 5) {
  await dbConnect();

  try {
    const results = await Manual.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean();

    return results;
  } catch (error) {
    console.error('Error searching manuals:', error);
    return [];
  }
}

/**
 * Assemble RAG context from search results for Claude prompt
 */
export function assembleContext(searchResults: { title: string; category: string; content: string }[]): string {
  if (searchResults.length === 0) {
    return 'No relevant manual content found.';
  }

  return searchResults
    .map((result) => `## ${result.title} (${result.category})\n${result.content}`)
    .join('\n\n');
}

/**
 * Generate system prompt with RAG context
 */
export function generateSystemPrompt(ragContext: string): string {
  return `You are a helpful company assistant with access to business manuals and documentation.
You have expertise in company policies, procedures, and operational guidelines.

Here is the relevant manual content:

${ragContext}

When answering questions:
1. Base your answers on the provided manual content whenever possible
2. If the manual doesn't cover the topic, clearly state: "This topic is not covered in the available manuals"
3. Quote relevant sections when helpful to support your answer
4. If the user's question is ambiguous, ask clarifying questions
5. Be professional and helpful in your responses

Remember: Only use information from the provided manuals. Do not make up information.`;
}
