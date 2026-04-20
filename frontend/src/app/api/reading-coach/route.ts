/**
 * Reading Coach API Route
 * Provides AI-powered feedback on pronunciation and reading
 *
 * Uses Vercel AI Gateway for routing, failover, and cost tracking.
 *
 * Setup (one-time):
 *   vercel link                          # Connect to Vercel project
 *   # Enable AI Gateway at https://vercel.com/{team}/{project}/settings
 *   vercel env pull .env.local             # Provisions VERCEL_OIDC_TOKEN
 */

import { generateText, Output } from 'ai'
import { z } from 'zod'

// Schema for pronunciation analysis
const PronunciationFeedbackSchema = z.object({
  isCorrect: z.boolean(),
  confidence: z.number().min(0).max(100),
  feedback: z.string(),
  encouragement: z.string(),
  tips: z.array(z.string()).optional(),
})

export async function POST(req: Request) {
  try {
    const { word, userTranscription, context } = await req.json()

    if (!word || !userTranscription) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: word, userTranscription' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Calculate similarity (simple Levenshtein-based)
    const similarity = calculateSimilarity(
      word.toLowerCase(),
      userTranscription.toLowerCase()
    )

    // Generate personalized feedback using AI
    const { output: feedback } = await generateText({
      model: 'openai/gpt-4.1-mini', // Routes through AI Gateway automatically
      output: Output.object({
        schema: PronunciationFeedbackSchema,
      }),
      prompt: `Analyze this reading attempt and provide encouraging feedback:

Target word: "${word}"
What the student said: "${userTranscription}"
Similarity score: ${similarity}%
Context: ${context || 'Reading practice'}

Provide:
1. A brief, encouraging message (2-3 sentences max)
2. Specific praise if they did well OR gentle correction if struggling
3. 1-2 practical tips for improvement (be specific and simple)

Keep language simple and encouraging. Use short sentences.`,
    })

    return new Response(JSON.stringify(feedback), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Reading Coach API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to analyze pronunciation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * Calculate similarity between two strings (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const maxLen = Math.max(len1, len2)
  const distance = matrix[len1][len2]
  return Math.round(((maxLen - distance) / maxLen) * 100)
}
