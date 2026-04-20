import React, { forwardRef, useMemo, useState } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import './DyslexiaInput.css'

export interface DyslexiaInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  variant?: 'default' | 'outlined' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  showPasswordToggle?: boolean
  onValueChange?: (value: string) => void
}

export interface DyslexiaTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'outlined' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  autoResize?: boolean
  onValueChange?: (value: string) => void
}

/**
 * Dyslexia-First Input Component
 *
 * Accessibility Features:
 * - Large text with clear labels
 * - High contrast borders
 * - Real-time validation feedback
 * - Clear error messages
 * - Optional icons for visual reinforcement
 */
export const DyslexiaInput = forwardRef<HTMLInputElement, DyslexiaInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      showPasswordToggle = false,
      onValueChange,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const { settings } = useDyslexiaSettings()
    const [showPassword, setShowPassword] = useState(false)
    const inputId = useMemo(() => id || `dyslexia-input-${Math.random().toString(36).substring(2, 9)}`, [id])

    // Determine actual input type
    const inputType = useMemo(() => {
      if (type === 'password' && showPasswordToggle && showPassword) {
        return 'text'
      }
      return type
    }, [type, showPasswordToggle, showPassword])

    // Build CSS classes
    const wrapperClasses = useMemo(() => {
      const classes: string[] = ['dyslexia-input-wrapper']

      if (size) classes.push(`dyslexia-input-wrapper--${size}`)
      if (fullWidth) classes.push('dyslexia-input-wrapper--full-width')
      if (error) classes.push('dyslexia-input-wrapper--error')

      return classes.join(' ')
    }, [size, fullWidth, error])

    const inputClasses = useMemo(() => {
      const classes: string[] = ['dyslexia-input']

      if (variant) classes.push(`dyslexia-input--${variant}`)
      if (icon) classes.push('dyslexia-input--has-icon')
      if (showPasswordToggle) classes.push('dyslexia-input--has-toggle')

      return classes.join(' ')
    }, [variant, icon, showPasswordToggle])

    // Inline styles
    const inputStyle = useMemo(() => ({
      fontSize: `${settings.fontSize * (size === 'sm' ? 0.9 : size === 'lg' ? 1.1 : 1)}px`,
      padding: icon || showPasswordToggle ? '0.75rem 3rem 0.75rem 1rem' : undefined,
    }), [settings.fontSize, size, icon, showPasswordToggle])

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="dyslexia-input__label">
            {label}
          </label>
        )}

        <div className="dyslexia-input__container">
          {icon && (
            <span className="dyslexia-input__icon" aria-hidden="true">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClasses}
            style={inputStyle}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            onChange={handleChange}
            {...props}
          />

          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              className="dyslexia-input__toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="dyslexia-input__error" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="dyslexia-input__helper">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

DyslexiaInput.displayName = 'DyslexiaInput'

/**
 * Textarea component
 */
export const DyslexiaTextarea = forwardRef<HTMLTextAreaElement, DyslexiaTextareaProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      autoResize = false,
      onValueChange,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const { settings } = useDyslexiaSettings()

    const inputId = useMemo(() => id || `dyslexia-textarea-${Math.random().toString(36).substring(2, 9)}`, [id])

    // Auto-resize functionality
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement
      onValueChange?.(target.value)

      if (autoResize) {
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
      }

      props.onInput?.(e)
    }

    // Build CSS classes
    const wrapperClasses = useMemo(() => {
      const classes: string[] = ['dyslexia-input-wrapper']

      if (size) classes.push(`dyslexia-input-wrapper--${size}`)
      if (fullWidth) classes.push('dyslexia-input-wrapper--full-width')
      if (error) classes.push('dyslexia-input-wrapper--error')

      return classes.join(' ')
    }, [size, fullWidth, error])

    const textareaClasses = useMemo(() => {
      const classes: string[] = ['dyslexia-input', 'dyslexia-textarea']

      if (variant) classes.push(`dyslexia-input--${variant}`)

      return classes.join(' ')
    }, [variant])

    // Inline styles
    const textareaStyle = useMemo(() => ({
      fontSize: `${settings.fontSize * (size === 'sm' ? 0.9 : size === 'lg' ? 1.1 : 1)}px`,
      minHeight: autoResize ? undefined : `${settings.fontSize * 4}px`,
    }), [settings.fontSize, size, autoResize])

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className="dyslexia-input__label">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={textareaClasses}
          style={textareaStyle}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          onInput={handleInput}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="dyslexia-input__error" role="alert">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="dyslexia-input__helper">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

DyslexiaTextarea.displayName = 'DyslexiaTextarea'

/**
 * Select component
 */
type DyslexiaSelectType = {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  options: Array<{ value: string; label: string; disabled?: boolean }>
  className?: string
  id?: string
}

export const DyslexiaSelect = forwardRef<HTMLSelectElement, DyslexiaSelectType & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>>(
  function DyslexiaSelect(
    {
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = false,
      options,
      className = '',
      id,
      ...props
    },
    ref
  ) {
  const { settings } = useDyslexiaSettings()

  const selectId = useMemo(() => id || `dyslexia-select-${Math.random().toString(36).substring(2, 9)}`, [id])

  const wrapperClasses = useMemo(() => {
    const classes: string[] = ['dyslexia-input-wrapper']

    if (size) classes.push(`dyslexia-input-wrapper--${size}`)
    if (fullWidth) classes.push('dyslexia-input-wrapper--full-width')
    if (error) classes.push('dyslexia-input-wrapper--error')

    return classes.join(' ')
  }, [size, fullWidth, error])

  const selectStyle = useMemo(() => ({
    fontSize: `${settings.fontSize * (size === 'sm' ? 0.9 : size === 'lg' ? 1.1 : 1)}px`,
  }), [settings.fontSize, size])

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={selectId} className="dyslexia-input__label">
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className="dyslexia-input dyslexia-select"
        style={selectStyle}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
        }
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={`${selectId}-error`} className="dyslexia-input__error" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${selectId}-helper`} className="dyslexia-input__helper">
          {helperText}
        </p>
      )}
    </div>
  )
})

DyslexiaSelect.displayName = 'DyslexiaSelect'

export default DyslexiaInput
