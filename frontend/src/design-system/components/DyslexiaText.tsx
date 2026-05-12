import React, { useMemo } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import './DyslexiaText.css'

export interface DyslexiaTextProps {
  children: React.ReactNode
  variant?: 'body' | 'heading' | 'subheading' | 'caption' | 'button'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'bold'
  color?: 'primary' | 'secondary' | 'muted' | 'accent'
  align?: 'left' | 'center' | 'right' | 'justify'
  className?: string
  style?: React.CSSProperties
  lineFocus?: boolean
  lineIndex?: number
  onClick?: () => void
}

/**
 * Dyslexia-First Text Component
 *
 * Features:
 * - Automatic typography based on user settings
 * - Line-by-line focus support
 * - WCAG AA compliant contrast
 */
export const DyslexiaText: React.FC<DyslexiaTextProps> = ({
  children,
  variant = 'body',
  size = 'md',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
  style,
  lineFocus,
  lineIndex,
  onClick,
}) => {
  const { settings } = useDyslexiaSettings()
  const isLineFocused = lineFocus ?? settings.lineFocusEnabled

  // Build CSS classes
  const textClasses = useMemo(() => {
    const classes: string[] = ['dyslexia-text']

    // Variant classes
    classes.push(`dyslexia-text--${variant}`)

    // Size classes
    classes.push(`dyslexia-text--${size}`)

    // Weight classes
    classes.push(`dyslexia-text--${weight}`)

    // Color classes
    classes.push(`dyslexia-text--${color}`)

    // Align classes
    classes.push(`dyslexia-text--align-${align}`)

    // Line focus classes
    if (isLineFocused && lineIndex !== undefined) {
      // Note: lineFocus comparison logic would need actual line index tracking
      // For now, just check if focus is enabled
      if (settings.lineFocusEnabled) {
        classes.push('dyslexia-line-focused')
      } else {
        classes.push('dyslexia-line-dimmed')
      }
    }

    // Custom classes
    if (className) {
      classes.push(className)
    }

    return classes.join(' ')
  }, [variant, size, weight, color, align, isLineFocused, lineIndex, settings, className])

  // Build inline styles
  const textStyle = useMemo(() => {
    const styles: React.CSSProperties = {
      ...style,
    }

    // Apply user settings via CSS variables (they're set globally, but we can override)
    if (variant === 'heading') {
      styles.fontSize = `var(--dyslexia-heading-size, ${settings.fontSize * 1.5}px)`
      styles.lineHeight = '1.4'
    } else if (variant === 'subheading') {
      styles.fontSize = `var(--dyslexia-subheading-size, ${settings.fontSize * 1.25}px)`
      styles.lineHeight = '1.5'
    } else if (variant === 'caption') {
      styles.fontSize = `var(--dyslexia-caption-size, ${settings.fontSize * 0.85}px)`
      styles.lineHeight = '1.4'
    } else {
      // Body text
      styles.fontSize = `var(--dyslexia-font-size, ${settings.fontSize}px)`
      styles.lineHeight = `var(--dyslexia-line-height, ${settings.lineHeight})`
      styles.wordSpacing = `var(--dyslexia-word-spacing, ${settings.wordSpacing}em)`
    }

    return styles
  }, [variant, settings, style])

  return (
    <span
      className={textClasses}
      style={textStyle}
      onClick={onClick}
      role="text"
    >
      {children}
    </span>
  )
}

/**
 * Heading component (semantic HTML)
 */
export const DyslexiaHeading: React.FC<Omit<DyslexiaTextProps, 'variant'> & { level: 1 | 2 | 3 | 4 | 5 | 6 }> = ({
  level,
  children,
  className = '',
  style,
  weight = 'bold',
  color = 'primary',
  align = 'left',
  onClick,
}) => {
  const { settings } = useDyslexiaSettings()

  const headingStyle = {
    ...style,
    fontSize: `${settings.fontSize * (level === 1 ? 2 : level === 2 ? 1.75 : level === 3 ? 1.5 : level === 4 ? 1.25 : 1.1)}px`,
    fontWeight: weight === 'bold' ? 700 : weight === 'medium' ? 500 : 400,
  }

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <HeadingTag
      className={`dyslexia-text dyslexia-text--heading dyslexia-text--${weight} dyslexia-text--${color} dyslexia-text--align-${align} ${className}`.trim()}
      style={headingStyle}
      onClick={onClick}
    >
      {children}
    </HeadingTag>
  )
}

/**
 * Paragraph component (semantic HTML)
 */
export const DyslexiaParagraph: React.FC<DyslexiaTextProps> = ({ children, className = '', style }) => {
  return (
    <p className={`dyslexia-text dyslexia-text--body ${className}`.trim()} style={style}>
      {children}
    </p>
  )
}

/**
 * Label component (for forms)
 */
export const DyslexiaLabel: React.FC<Omit<DyslexiaTextProps, 'variant' | 'size'> & { htmlFor?: string }> = ({ children, className = '', style, onClick, htmlFor }) => {
  return (
    <label className={`dyslexia-text dyslexia-text--label ${className}`.trim()} style={style} onClick={onClick} htmlFor={htmlFor}>
      {children}
    </label>
  )
}

export default DyslexiaText
