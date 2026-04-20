/**
 * Story Summarizer API Route
 * Creates dyslexia-friendly summaries of text passages
 *
 * Uses Vercel AI Gateway for routing, failover, and cost tracking.
 *
 * Setup (one-time):
 *   vercel link                          # Connect to Vercel project
 *   # Enable AI Gateway at https://vercel.com/{team}/{project}/settings
 *   vercel env pull .env.local             # Provisions VERCEL_OIDC_TOKEN
 */

import { generateText } from 'ai'

// Dyslexia-friendly summary guidelines
const SUMMARY_GUIDELINES = `Create summaries that are easy to read and understand for people with dyslexia:

Format Rules:
- Use short sentences (8-12 words)
- Maximum 2 sentences per paragraph
- Use bullet points for lists
- One main idea per paragraph
- Simple vocabulary (avoid complex words)
- Clear structure with headings

Content Guidelines:
- Focus on main ideas only
- Remove unnecessary details
- Use present tense
- Active voice (not passive)
- Concrete examples when helpful

Length Guide:
- Very short text (<100 words): 2-3 sentences
- Short text (100-300 words): 1 paragraph
- Medium text (300-600 words): 2-3 paragraphs
- Long text (600+ words): 3-5 paragraphs with headings

Remember: The goal is comprehension, not completeness. Better to be simpler than comprehensive.`

export async function POST(req: Request) {
  try {
    const { text, difficulty = 'moderate' } = await req.json()

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Determine appropriate summary length based on text length
    const textLength = text.split(/\s+/).length
    let lengthGuide = ''

    if (textLength < 100) {
      lengthGuide = 'Provide a 2-3 sentence summary.'
    } else if (textLength < 300) {
      lengthGuide = 'Provide a 1 paragraph summary with 3-4 sentences.'
    } else if (textLength < 600) {
      lengthGuide = 'Provide a 2-3 paragraph summary with clear headings.'
    } else {
      lengthGuide = 'Provide a 3-5 paragraph summary with headings for each section.'
    }

    // Generate dyslexia-friendly summary
    const { text: summary } = await generateText({
      model: 'openai/gpt-4.1-mini', // Routes through AI Gateway automatically
      system: SUMMARY_GUIDELINES,
      prompt: `Summarize this text in a dyslexia-friendly way:

${lengthGuide}

Difficulty level: ${difficulty}

Text to summarize:
"""
${text}
"""
`,
      temperature: 0.5,
    })

    return new Response(
      JSON.stringify({
        summary,
        originalLength: textLength,
        summaryLength: summary.split(/\s+/).length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Summarizer API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to summarize text' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
