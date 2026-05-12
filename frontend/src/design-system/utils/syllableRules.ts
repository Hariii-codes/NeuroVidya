/**
 * Linguistic Rules for Syllable Chunking
 * Rule-based syllable division without AI - fast, works offline
 */

/**
 * Chunk a word into syllables using linguistic rules
 * Based on English phonotactic patterns
 */
export function chunkWordBySyllables(word: string): string[] {
  if (!word || word.length <= 3) {
    return [word]
  }

  const lowerWord = word.toLowerCase()

  // Common patterns - check these first
  const commonPatterns = [
    // Common prefixes
    { pattern: /^(pre|fore|post|anti|auto|bio|co|de|dis|en|em|ex|extra|fore|hyper|il|im|in|ir|inter|macro|micro|mid|mis|mono|multi|non|omni|over|post|pre|pro|re|semi|sub|super|trans|tri|un|under)/i, splitAfter: true },
    // Common suffixes
    { pattern: /(tion|sion|ment|ness|less|ful|able|ible|al|ial|ed|en|er|est|fy|ing|ish|ism|ist|ity|ive|ize|less|ly|ment|ness|or|ous|ship|ward|wise)$/i, splitBefore: true },
  ]

  // Try common patterns first
  for (const { pattern, splitAfter, splitBefore } of commonPatterns) {
    const match = lowerWord.match(pattern)
    if (match) {
      const prefix = match[0]
      const rest = word.slice(prefix.length)

      if (splitAfter) {
        return [prefix, ...chunkWordBySyllables(rest)]
      }
      if (splitBefore) {
        const baseWord = word.slice(0, -prefix.length)
        return [...chunkWordBySyllables(baseWord), prefix]
      }
    }
  }

  // Vowel pattern matching - main syllable division algorithm
  const vowels = 'aeiouy'
  const syllables: string[] = []
  let currentSyllable = ''
  let hasVowel = false

  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    const isVowel = vowels.includes(char.toLowerCase())
    const nextChar = word[i + 1]
    const prevChar = word[i - 1]
    const nextIsVowel = nextChar && vowels.includes(nextChar.toLowerCase())
    const prevIsVowel = prevChar && vowels.includes(prevChar.toLowerCase())

    currentSyllable += char

    // Decide whether to split here
    if (isVowel) {
      hasVowel = true

      // Split if next char is vowel (vowel team)
      if (nextIsVowel && !prevIsVowel) {
        syllables.push(currentSyllable)
        currentSyllable = ''
        hasVowel = false
      }
      // Split if we have C-V-C pattern and next consonant cluster
      else if (!nextIsVowel && hasVowel && i < word.length - 1) {
        const nextTwo = word.slice(i + 1, i + 3)
        // Check if followed by consonant blend
        if (/^[bcdfghjklmnpqrstvwxyz]{2,}/i.test(nextTwo)) {
          syllables.push(currentSyllable)
          currentSyllable = ''
          hasVowel = false
        }
      }
    }
  }

  // Add remaining syllable
  if (currentSyllable) {
    syllables.push(currentSyllable)
  }

  // Fallback: if no syllables found, return whole word
  if (syllables.length === 0) {
    return [word]
  }

  // Post-processing: merge very short syllables
  return mergeShortSyllables(syllables)
}

/**
 * Merge syllables that are too short (single consonants)
 */
function mergeShortSyllables(syllables: string[]): string[] {
  const merged: string[] = []
  let i = 0

  while (i < syllables.length) {
    const current = syllables[i]
    const next = syllables[i + 1]

    // If current is just a consonant, merge with next
    if (current.length === 1 && !'aeiouy'.includes(current.toLowerCase()) && next) {
      merged.push(current + next)
      i += 2
    } else {
      merged.push(current)
      i += 1
    }
  }

  return merged
}

/**
 * Count syllables in a word
 * Useful for reading difficulty assessment
 */
export function countSyllables(word: string): number {
  return chunkWordBySyllables(word).length
}

/**
 * Get reading difficulty level based on syllable count
 */
export function getWordDifficulty(word: string): 'easy' | 'medium' | 'hard' {
  const syllableCount = countSyllables(word)

  if (syllableCount <= 2) return 'easy'
  if (syllableCount <= 4) return 'medium'
  return 'hard'
}

/**
 * Check if a word should use AI chunking
 * Returns true for complex, irregular, or long words
 */
export function shouldUseAIForWord(word: string): boolean {
  const syllableCount = countSyllables(word)

  // Use AI for words with 5+ syllables
  if (syllableCount >= 5) return true

  // Use AI for very long words
  if (word.length >= 12) return true

  // Known irregular patterns
  const irregularPatterns = [
    /iou/, // weird vowels
    /eaud/, // French borrowings
    /ae/,  // Latin borrowings
    /oo/,  // double o variations
  ]

  return irregularPatterns.some(pattern => pattern.test(word.toLowerCase()))
}

/**
 * Chunk a sentence into words and preserve spacing
 */
export function chunkSentence(sentence: string): Array<{ word: string; syllables: string[]; isSpace: boolean }> {
  const tokens = sentence.split(/(\s+)/)
  const result: Array<{ word: string; syllables: string[]; isSpace: boolean }> = []

  for (const token of tokens) {
    const isSpace = /^\s+$/.test(token)

    if (isSpace) {
      result.push({ word: token, syllables: [token], isSpace: true })
    } else if (token.length > 0) {
      result.push({
        word: token,
        syllables: chunkWordBySyllables(token),
        isSpace: false,
      })
    }
  }

  return result
}

/**
 * Common phonetic patterns for educational purposes
 * Useful for teaching reading
 */
export const phoneticPatterns = {
  silentE: {
    pattern: /([aeiou]+)[bcdfghjklmnpqrstvwxyz]+e$/i,
    description: 'Silent E makes the first vowel long',
    examples: ['make', 'time', 'hope'],
  },
  doubleVowel: {
    pattern: /[aeiou]{2}/i,
    description: 'Two vowels walking, first does the talking',
    examples: ['rain', 'boat', 'feet'],
  },
  consonantBlend: {
    pattern: /[bcdfghjklmnpqrstvwxyz]{2}/i,
    description: 'Consonant blend sounds',
    examples: ['black', 'tree', 'stop'],
  },
  digraph: {
    pattern: /(sh|ch|th|ph|wh|ck)/i,
    description: 'Two letters make one sound',
    examples: ['ship', 'chat', 'when'],
  },
}
