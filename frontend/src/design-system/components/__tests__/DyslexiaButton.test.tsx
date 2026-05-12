// frontend/src/design-system/components/__tests__/DyslexiaButton.test.tsx
import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DyslexiaButton } from '../DyslexiaButton'
import { DyslexiaProvider } from '@/design-system/DyslexiaProvider'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<DyslexiaProvider>{ui}</DyslexiaProvider>)
}

describe('DyslexiaButton', () => {
  describe('Rendering', () => {
    test('renders button with text', () => {
      renderWithProvider(<DyslexiaButton>Click Me</DyslexiaButton>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    test('renders button with icon', () => {
      renderWithProvider(<DyslexiaButton icon="🎮">Games</DyslexiaButton>)
      expect(screen.getByRole('button', { name: /games/i })).toBeInTheDocument()
      expect(screen.getByText('🎮')).toBeInTheDocument()
    })

    test('applies variant styling', () => {
      renderWithProvider(<DyslexiaButton variant="secondary">Secondary</DyslexiaButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('dyslexia-button--secondary')
    })

    test('applies size styling', () => {
      renderWithProvider(<DyslexiaButton size="lg">Large</DyslexiaButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('dyslexia-button--lg')
    })

    test('renders as disabled when disabled prop is true', () => {
      renderWithProvider(<DyslexiaButton disabled>Disabled</DyslexiaButton>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    test('shows loading spinner when loading', () => {
      renderWithProvider(<DyslexiaButton loading>Loading</DyslexiaButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('dyslexia-button--loading')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    test('renders as fullWidth when prop is true', () => {
      renderWithProvider(<DyslexiaButton fullWidth>Full Width</DyslexiaButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('dyslexia-button--full-width')
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      renderWithProvider(<DyslexiaButton>Accessible Button</DyslexiaButton>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    test('icon-only button has aria-label', () => {
      renderWithProvider(
        <DyslexiaButton icon="🎮" aria-label="Open games menu" />
      )
      expect(screen.getByRole('button', { name: /open games menu/i })).toBeInTheDocument()
    })

    test('has 60px minimum touch target', () => {
      renderWithProvider(<DyslexiaButton size="md">Touch Target</DyslexiaButton>)
      const button = screen.getByRole('button')
      const styles = window.getComputedStyle(button) as CSSStyleDeclaration & { minHeight?: string }
      const minHeight = parseInt(styles.minHeight || '60', 10)
      expect(minHeight).toBeGreaterThanOrEqual(60)
    })
  })

  describe('User Interactions', () => {
    test('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      renderWithProvider(<DyslexiaButton onClick={handleClick}>Click Me</DyslexiaButton>)

      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      renderWithProvider(
        <DyslexiaButton onClick={handleClick} disabled>Disabled</DyslexiaButton>
      )

      const button = screen.getByRole('button')
      await userEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    test('does not call onClick when loading', async () => {
      const handleClick = vi.fn()
      renderWithProvider(
        <DyslexiaButton onClick={handleClick} loading>Loading</DyslexiaButton>
      )

      const button = screen.getByRole('button')
      await userEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    test('can be activated with Enter key', async () => {
      const handleClick = vi.fn()
      renderWithProvider(<DyslexiaButton onClick={handleClick}>Submit</DyslexiaButton>)

      const button = screen.getByRole('button')
      button.focus()
      await userEvent.keyboard('{Enter}')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('can be activated with Space key', async () => {
      const handleClick = vi.fn()
      renderWithProvider(<DyslexiaButton onClick={handleClick}>Submit</DyslexiaButton>)

      const button = screen.getByRole('button')
      button.focus()
      await userEvent.keyboard('{ }')

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
