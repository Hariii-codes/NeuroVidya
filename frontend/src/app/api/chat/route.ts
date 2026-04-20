/**
 * AI Assistant Chat API Route
 * Provides dyslexia-friendly learning assistance
 *
 * Uses Vercel AI Gateway for routing, failover, and cost tracking.
 *
 * Setup (one-time):
 *   vercel link                          # Connect to Vercel project
 *   # Enable AI Gateway at https://vercel.com/{team}/{project}/settings
 *   vercel env pull .env.local             # Provisions VERCEL_OIDC_TOKEN
 *
 * The model: "openai/gpt-4.1-mini" string routes through AI Gateway automatically.
 * No manual API keys needed when using Vercel AI Gateway with OIDC.
 */

import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

// Dyslexia-friendly system prompt
const ASSISTANT_SYSTEM_PROMPT = `You are a friendly, patient learning assistant for NeuroVidya, a platform designed for users with dyslexia.

Your role is to help students learn reading, spelling, and writing in a supportive way.

Important guidelines:
- Use simple, clear language
- Break complex concepts into smaller steps
- Encourage and celebrate effort
- Use short sentences and paragraphs
- Avoid idioms and figurative language
- Be patient and supportive

When explaining:
1. Use short sentences (10-15 words max)
2. One idea per paragraph
3. Give concrete examples
4. Use step-by-step instructions
5. Praise effort, not just correctness

Format your responses with:
- Short paragraphs (2-3 sentences max)
- Bullet points for lists
- Clear headings
- Encouraging tone

Remember: The user may have difficulty with reading, so be encouraging and never critical of mistakes.`

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    // Convert UIMessage to ModelMessage (async in v6)
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model: 'openai/gpt-4.1-mini', // Routes through AI Gateway automatically
      system: ASSISTANT_SYSTEM_PROMPT,
      messages: modelMessages,
      temperature: 0.7,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
