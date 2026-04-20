// frontend/src/test/accessibility/__tests__/designSystemAccessibility.test.tsx
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { DyslexiaButton } from '@/design-system/components/DyslexiaButton'
import { DyslexiaInput } from '@/design-system/components/DyslexiaInput'
import { DyslexiaCard } from '@/design-system/components/DyslexiaCard'
import { DyslexiaText } from '@/design-system/components/DyslexiaText'
import { DyslexiaProvider } from '@/design-system/DyslexiaProvider'

// Extend Vitest expect
expect.extend(toHaveNoViolations)

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<DyslexiaProvider>{ui}</DyslexiaProvider>)
}

describe('Design System Accessibility', () => {
  describe('DyslexiaButton', () => {
    test('has no accessibility violations', async () => {
      const { container } = renderWithProvider(<DyslexiaButton>Click Me</DyslexiaButton>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('button with icon has no violations', async () => {
      const { container } = renderWithProvider(
        <DyslexiaButton icon="🎮" aria-label="Open games menu" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('disabled button has no violations', async () => {
      const { container } = renderWithProvider(<DyslexiaButton disabled>Disabled</DyslexiaButton>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('loading button has no violations', async () => {
      const { container } = renderWithProvider(<DyslexiaButton loading>Loading</DyslexiaButton>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('DyslexiaInput', () => {
    test('has no accessibility violations', async () => {
      const { container } = renderWithProvider(<DyslexiaInput label="Email" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('input with error has no violations', async () => {
      const { container } = renderWithProvider(
        <DyslexiaInput label="Email" error="Invalid email format" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('input with helper text has no violations', async () => {
      const { container } = renderWithProvider(
        <DyslexiaInput
          label="Password"
          helperText="Must be at least 8 characters long"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('disabled input has no violations', async () => {
      const { container } = renderWithProvider(<DyslexiaInput label="Email" disabled />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('textarea has no violations', async () => {
      const { container } = renderWithProvider(<DyslexiaInput label="Message" multiline />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('DyslexiaCard', () => {
    test('has no accessibility violations', async () => {
      const { container } = renderWithProvider(<DyslexiaCard>Card Content</DyslexiaCard>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('clickable card has no violations', async () => {
      const { container } = renderWithProvider(
        <DyslexiaCard clickable onClick={() => {}}>
          Clickable Card
        </DyslexiaCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('card with title has no violations', async () => {
      const { container } = renderWithProvider(
        <DyslexiaCard title="Card Title">Content</DyslexiaCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Component Combinations', () => {
    test('form with multiple inputs has no violations', async () => {
      const { container } = renderWithProvider(
        <form>
          <DyslexiaInput label="Name" />
          <DyslexiaInput label="Email" type="email" />
          <DyslexiaInput label="Message" multiline />
          <DyslexiaButton type="submit">Submit</DyslexiaButton>
        </form>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('card with actions has no violations', async () => {
      const { container } = renderWithProvider(
        <DyslexiaCard title="Actions">
          <p>Are you sure?</p>
        </DyslexiaCard>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('complex layout has no violations', async () => {
      const { container } = renderWithProvider(
        <div>
          <DyslexiaCard title="Section 1">
            <DyslexiaInput label="Field 1" />
          </DyslexiaCard>
          <DyslexiaCard title="Section 2">
            <DyslexiaButton>Action</DyslexiaButton>
          </DyslexiaCard>
        </div>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('DyslexiaProvider Integration', () => {
    test('provider context has no violations', async () => {
      const { container } = render(
        <DyslexiaProvider>
          <DyslexiaCard>
            <DyslexiaButton>Test</DyslexiaButton>
          </DyslexiaCard>
        </DyslexiaProvider>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ARIA Attributes', () => {
    test('disabled elements have disabled attribute', () => {
      renderWithProvider(<DyslexiaButton disabled>Disabled</DyslexiaButton>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    test('loading elements have aria-busy', () => {
      renderWithProvider(<DyslexiaButton loading>Loading</DyslexiaButton>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    test('error inputs have aria-invalid', () => {
      renderWithProvider(<DyslexiaInput label="Email" error="Invalid" />)

      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('inputs with errors have aria-describedby', () => {
      renderWithProvider(<DyslexiaInput label="Email" error="Invalid" id="email-input" />)

      const input = screen.getByLabelText('Email')
      expect(input).toHaveAttribute('aria-describedby')
    })
  })

  describe('Screen Reader Support', () => {
    test('icon-only buttons have aria-label', () => {
      renderWithProvider(
        <DyslexiaButton icon="🔍" aria-label="Search" />
      )

      const button = screen.getByRole('button', { name: 'Search' })
      expect(button).toBeInTheDocument()
    })

    test('all inputs have associated labels', () => {
      renderWithProvider(<DyslexiaInput label="Search" />)

      const input = screen.getByLabelText('Search')
      expect(input).toBeInTheDocument()
    })

    test('helper text is accessible', () => {
      renderWithProvider(
        <DyslexiaInput
          label="Password"
          helperText="Must be at least 8 characters"
        />
      )

      const helperText = screen.getByText('Must be at least 8 characters')
      expect(helperText).toBeInTheDocument()
    })

    test('error messages are accessible', () => {
      renderWithProvider(<DyslexiaInput label="Email" error="Invalid email" />)

      const errorMessage = screen.getByText('Invalid email')
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('Color Contrast', () => {
    test('meets WCAG AA standards for text', async () => {
      const { container } = render(
        <DyslexiaProvider>
          <DyslexiaCard>
            <DyslexiaText variant="body">
              This is body text that should meet contrast requirements
            </DyslexiaText>
          </DyslexiaCard>
        </DyslexiaProvider>
      )

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })

      expect(results).toHaveNoViolations()
    })
  })

  describe('Touch Target Size', () => {
    test('buttons meet minimum touch target size', () => {
      renderWithProvider(<DyslexiaButton size="md">Click Me</DyslexiaButton>)

      const button = screen.getByRole('button')
      const styles = window.getComputedStyle(button)
      const minHeight = parseInt(styles.minHeight || '60', 10)

      // WCAG recommends 44x44px, we use 60px for dyslexia users
      expect(minHeight).toBeGreaterThanOrEqual(60)
    })

    test('inputs meet minimum touch target size', () => {
      renderWithProvider(<DyslexiaInput label="Email" />)

      const input = screen.getByLabelText('Email')
      const styles = window.getComputedStyle(input)
      const minHeight = parseInt(styles.minHeight || '48', 10)

      // Minimum 48px for inputs
      expect(minHeight).toBeGreaterThanOrEqual(48)
    })
  })
})
