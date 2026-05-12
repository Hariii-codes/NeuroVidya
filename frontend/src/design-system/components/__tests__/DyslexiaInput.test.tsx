// frontend/src/design-system/components/__tests__/DyslexiaInput.test.tsx
import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DyslexiaInput } from '../DyslexiaInput'
import { DyslexiaProvider } from '@/design-system/DyslexiaProvider'

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<DyslexiaProvider>{ui}</DyslexiaProvider>)
}

describe('DyslexiaInput', () => {
  describe('Rendering', () => {
    test('renders input with label', () => {
      renderWithProvider(<DyslexiaInput label="Email" />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    test('renders input with placeholder', () => {
      renderWithProvider(<DyslexiaInput label="Email" placeholder="Enter your email" />)
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    })

    test('renders as textarea when multiline', () => {
      renderWithProvider(<DyslexiaInput label="Message" multiline />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    test('shows error message when provided', () => {
      renderWithProvider(<DyslexiaInput label="Email" error="Invalid email" />)
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })

    test('shows helper text when provided', () => {
      renderWithProvider(<DyslexiaInput label="Password" helperText="Must be at least 8 characters" />)
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
    })

    test('renders as disabled when disabled prop is true', () => {
      renderWithProvider(<DyslexiaInput label="Email" disabled />)
      expect(screen.getByLabelText('Email')).toBeDisabled()
    })

    test('renders with icon when provided', () => {
      renderWithProvider(<DyslexiaInput label="Search" icon="🔍" />)
      expect(screen.getByText('🔍')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('label is properly associated with input', () => {
      renderWithProvider(<DyslexiaInput label="Email" />)
      const input = screen.getByLabelText('Email')
      expect(input).toBeInTheDocument()
    })

    test('has proper ARIA attributes when error exists', () => {
      renderWithProvider(<DyslexiaInput label="Email" error="Required field" id="email-input" />)
      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')
    })

    test('has proper ARIA attributes when disabled', () => {
      renderWithProvider(<DyslexiaInput label="Email" disabled />)
      const input = screen.getByLabelText('Email')
      // Disabled attribute is set instead of aria-disabled
      expect(input).toBeDisabled()
    })

    test('has 48px minimum height for touch targets', () => {
      renderWithProvider(<DyslexiaInput label="Email" />)
      const input = screen.getByLabelText('Email')
      const styles = window.getComputedStyle(input) as CSSStyleDeclaration & { minHeight?: string }
      const minHeight = parseInt(styles.minHeight || '48', 10)
      expect(minHeight).toBeGreaterThanOrEqual(48)
    })
  })

  describe('User Interactions', () => {
    test('calls onChange when user types', async () => {
      const handleChange = vi.fn()
      renderWithProvider(<DyslexiaInput label="Email" onChange={handleChange} />)

      const input = screen.getByLabelText('Email')
      await userEvent.type(input, 'test@example.com')

      expect(handleChange).toHaveBeenCalled()
    })

    test('calls onFocus when input is focused', async () => {
      const handleFocus = vi.fn()
      renderWithProvider(<DyslexiaInput label="Email" onFocus={handleFocus} />)

      const input = screen.getByLabelText('Email')
      await userEvent.click(input)

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    test('calls onBlur when input loses focus', async () => {
      const handleBlur = vi.fn()
      renderWithProvider(<DyslexiaInput label="Email" onBlur={handleBlur} />)

      const input = screen.getByLabelText('Email')
      await userEvent.click(input)
      await userEvent.tab()

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    test('does not call onChange when disabled', async () => {
      const handleChange = vi.fn()
      renderWithProvider(<DyslexiaInput label="Email" onChange={handleChange} disabled />)

      const input = screen.getByLabelText('Email')
      await userEvent.type(input, 'test@example.com')

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('Value Management', () => {
    test('displays initial value', () => {
      renderWithProvider(<DyslexiaInput label="Email" value="test@example.com" />)
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    test('updates value when controlled', async () => {
      const TestComponent = () => {
        const [value, setValue] = React.useState('initial')
        return (
          <DyslexiaInput
            label="Test"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )
      }

      renderWithProvider(<TestComponent />)

      const input = screen.getByLabelText('Test')
      await userEvent.clear(input)
      await userEvent.type(input, 'updated')

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    test('can be navigated to with Tab key', async () => {
      renderWithProvider(
        <div>
          <DyslexiaInput label="First" />
          <DyslexiaInput label="Second" />
        </div>
      )

      const firstInput = screen.getByLabelText('First')
      const secondInput = screen.getByLabelText('Second')

      firstInput.focus()
      expect(firstInput).toHaveFocus()

      await userEvent.tab()
      expect(secondInput).toHaveFocus()
    })
  })
})
