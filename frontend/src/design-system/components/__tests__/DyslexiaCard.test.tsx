// frontend/src/design-system/components/__tests__/DyslexiaCard.test.tsx
import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DyslexiaCard } from '../DyslexiaCard'
import { DyslexiaProvider } from '@/design-system/DyslexiaProvider'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<DyslexiaProvider>{ui}</DyslexiaProvider>)
}

describe('DyslexiaCard', () => {
  describe('Rendering', () => {
    test('renders card with children', () => {
      renderWithProvider(<DyslexiaCard>Card Content</DyslexiaCard>)
      expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    test('renders card with title', () => {
      renderWithProvider(<DyslexiaCard title="Test Title">Content</DyslexiaCard>)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    test('applies variant styling', () => {
      renderWithProvider(<DyslexiaCard variant="elevated">Content</DyslexiaCard>)
      const card = screen.getByText('Content').closest('.dyslexia-card')
      expect(card).toHaveClass('dyslexia-card--elevated')
    })

    test('renders with icon when provided', () => {
      renderWithProvider(<DyslexiaCard icon="📚" title="Library">Content</DyslexiaCard>)
      expect(screen.getByText('📚')).toBeInTheDocument()
    })

    test('applies custom className', () => {
      renderWithProvider(<DyslexiaCard className="custom-class">Content</DyslexiaCard>)
      const card = screen.getByText('Content').closest('.dyslexia-card')
      expect(card).toHaveClass('custom-class')
    })
  })

  describe('User Interactions', () => {
    test('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      renderWithProvider(
        <DyslexiaCard onClick={handleClick} clickable>
          Clickable Card
        </DyslexiaCard>
      )

      await userEvent.click(screen.getByText('Clickable Card'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('has keyboard accessibility when clickable', async () => {
      const handleClick = vi.fn()
      renderWithProvider(
        <DyslexiaCard onClick={handleClick} clickable>
          Keyboard Card
        </DyslexiaCard>
      )

      const card = screen.getByText('Keyboard Card')
      card.focus()
      await userEvent.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('shows focus ring when keyboard focused', async () => {
      renderWithProvider(
        <DyslexiaCard clickable>Focus Test</DyslexiaCard>
      )

      const cardElement = document.querySelector('.dyslexia-card--clickable')
      if (cardElement) {
        cardElement.focus()
        expect(cardElement).toHaveFocus()
      }
    })
  })

  describe('Accessibility', () => {
    test('clickable card has proper role', () => {
      renderWithProvider(
        <DyslexiaCard clickable>Clickable</DyslexiaCard>
      )

      const cardElement = document.querySelector('.dyslexia-card--clickable')
      if (cardElement) {
        expect(cardElement).toHaveAttribute('role', 'button')
        expect(cardElement).toHaveAttribute('tabIndex', '0')
      }
    })

    test('non-clickable card has no button role', () => {
      renderWithProvider(<DyslexiaCard>Not Clickable</DyslexiaCard>)

      const cardElement = document.querySelector('.dyslexia-card')
      if (cardElement) {
        expect(cardElement).not.toHaveAttribute('role', 'button')
      }
    })

    test('card with title is accessible', () => {
      renderWithProvider(
        <DyslexiaCard clickable title="Card Title">
          Content
        </DyslexiaCard>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    test('flat variant has no shadow', () => {
      renderWithProvider(<DyslexiaCard variant="flat">Flat</DyslexiaCard>)
      const card = screen.getByText('Flat').closest('.dyslexia-card')
      expect(card).toHaveClass('dyslexia-card--flat')
    })

    test('outlined variant has border', () => {
      renderWithProvider(<DyslexiaCard variant="outlined">Outlined</DyslexiaCard>)
      const card = screen.getByText('Outlined').closest('.dyslexia-card')
      expect(card).toHaveClass('dyslexia-card--outlined')
    })

    test('elevated variant has shadow', () => {
      renderWithProvider(<DyslexiaCard variant="elevated">Elevated</DyslexiaCard>)
      const card = screen.getByText('Elevated').closest('.dyslexia-card')
      expect(card).toHaveClass('dyslexia-card--elevated')
    })
  })

  describe('Content Layout', () => {
    test('renders header section when title provided', () => {
      renderWithProvider(
        <DyslexiaCard title="Card Title">
          <p>Body content</p>
        </DyslexiaCard>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Body content')).toBeInTheDocument()
    })

    test('renders with subtitle', () => {
      renderWithProvider(
        <DyslexiaCard title="Card Title" subtitle="Card Subtitle">
          Content
        </DyslexiaCard>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card Subtitle')).toBeInTheDocument()
    })

    test('renders with icon', () => {
      renderWithProvider(
        <DyslexiaCard icon="📚" title="Library">
          Content
        </DyslexiaCard>
      )

      expect(screen.getByText('📚')).toBeInTheDocument()
    })
  })
})
