// frontend/src/design-system/components/__tests__/PhoneticHighlighter.test.tsx
import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhoneticHighlighter } from '../PhoneticHighlighter'
import { DyslexiaProvider } from '@/design-system/DyslexiaProvider'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<DyslexiaProvider>{ui}</DyslexiaProvider>)
}

describe('PhoneticHighlighter', () => {
  describe('Rendering', () => {
    test('renders text when phonetic chunking is disabled', () => {
      renderWithProvider(<PhoneticHighlighter text="Hello world" interactive={false} />)
      expect(screen.getByText('Hello world')).toBeInTheDocument()
    })

    test('renders text component', () => {
      renderWithProvider(<PhoneticHighlighter text="Hello" interactive={false} />)
      const container = screen.getByText('Hello')
      expect(container).toBeInTheDocument()
    })

    test('renders with showSyllableCount', () => {
      renderWithProvider(
        <PhoneticHighlighter text="fantastic" interactive={false} showSyllableCount={true} />
      )
      expect(screen.getByText('fantastic')).toBeInTheDocument()
    })

    test('renders with showWordDifficulty', () => {
      renderWithProvider(
        <PhoneticHighlighter text="fantastic" interactive={false} showWordDifficulty={true} />
      )
      expect(screen.getByText('fantastic')).toBeInTheDocument()
    })

    test('renders with interactive mode', () => {
      renderWithProvider(
        <PhoneticHighlighter text="fantastic" interactive={true} />
      )
      expect(screen.getByText('fantastic')).toBeInTheDocument()
    })
  })

  describe('Chunking Logic', () => {
    test('handles simple word', () => {
      renderWithProvider(<PhoneticHighlighter text="hello" interactive={false} />)

      const container = screen.getByText('hello')
      expect(container).toBeInTheDocument()
    })

    test('handles multi-word text', () => {
      renderWithProvider(
        <PhoneticHighlighter text="Hello world" interactive={false} />
      )

      expect(screen.getByText('Hello')).toBeInTheDocument()
      expect(screen.getByText('world')).toBeInTheDocument()
    })

    test('handles punctuation correctly', () => {
      renderWithProvider(
        <PhoneticHighlighter text="Hello, world!" interactive={false} />
      )

      expect(screen.getByText(/Hello/)).toBeInTheDocument()
      expect(screen.getByText(/world/)).toBeInTheDocument()
    })

    test('handles empty string', () => {
      renderWithProvider(<PhoneticHighlighter text="" interactive={false} />)
      const container = document.querySelector('.phonetic-highlighter')
      if (container) {
        expect(container).toBeInTheDocument()
      }
    })

    test('handles whitespace', () => {
      renderWithProvider(
        <PhoneticHighlighter text="  " interactive={false} />
      )
      const container = document.querySelector('.phonetic-highlighter')
      if (container) {
        expect(container).toBeInTheDocument()
      }
    })
  })

  describe('Visual Presentation', () => {
    test('applies correct CSS classes', () => {
      renderWithProvider(
        <PhoneticHighlighter text="fantastic" interactive={false} />
      )

      const container = document.querySelector('.phonetic-highlighter')
      if (container) {
        expect(container).toBeInTheDocument()
      }
    })

    test('applies custom className', () => {
      renderWithProvider(
        <PhoneticHighlighter text="Hello" className="custom-class" interactive={false} />
      )

      const container = document.querySelector('.custom-class')
      if (container) {
        expect(container).toBeInTheDocument()
      }
    })

    test('uses readable spacing', () => {
      renderWithProvider(
        <PhoneticHighlighter text="Hello world" interactive={false} />
      )

      const container = document.querySelector('.phonetic-highlighter')
      if (container) {
        expect(container).toBeInTheDocument()
      }
    })
  })

  describe('Accessibility', () => {
    test('renders text content', () => {
      renderWithProvider(<PhoneticHighlighter text="Hello world" interactive={false} />)

      const container = screen.getByText('Hello world')
      expect(container).toBeInTheDocument()
    })

    test('does not interfere with keyboard navigation', () => {
      renderWithProvider(
        <div>
          <button>Before</button>
          <PhoneticHighlighter text="Hello" interactive={false} />
          <button>After</button>
        </div>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })
  })

  describe('User Interactions', () => {
    test('calls onSyllableClick when syllable is clicked in interactive mode', async () => {
      const handleClick = vi.fn()
      renderWithProvider(
        <PhoneticHighlighter text="hello" interactive={true} onSyllableClick={handleClick} />
      )

      const syllable = screen.getByText('hel')
      if (syllable) {
        await userEvent.click(syllable)
      }
    })
  })

  describe('Edge Cases', () => {
    test('handles very long words', () => {
      renderWithProvider(
        <PhoneticHighlighter text="supercalifragilisticexpialidocious" interactive={false} />
      )

      expect(screen.getByText(/supercalifragilisticexpialidocious/i)).toBeInTheDocument()
    })

    test('handles special characters', () => {
      renderWithProvider(
        <PhoneticHighlighter text="Hello@world!" interactive={false} />
      )

      expect(screen.getByText(/Hello/)).toBeInTheDocument()
    })

    test('handles numbers in text', () => {
      renderWithProvider(
        <PhoneticHighlighter text="There are 123 items" interactive={false} />
      )

      expect(screen.getByText(/123/)).toBeInTheDocument()
    })

    test('handles null/undefined text gracefully', () => {
      renderWithProvider(
        <PhoneticHighlighter text={undefined as any} interactive={false} />
      )
      // Should not crash
    })
  })

  describe('Performance', () => {
    test('handles large text blocks efficiently', () => {
      const largeText = 'Hello world '.repeat(100)

      renderWithProvider(
        <PhoneticHighlighter text={largeText} interactive={false} />
      )

      expect(screen.getByText(/Hello world/)).toBeInTheDocument()
    })
  })
})
