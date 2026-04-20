import React, { forwardRef, useMemo } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import './DyslexiaButton.css'

export interface DyslexiaButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right' | 'only'
  loading?: boolean
  disabled?: boolean
  children?: React.ReactNode
}

/**
 * Dyslexia-First Button Component
 *
 * Accessibility Features:
 * - 60px minimum touch target (WCAG AAA)
 * - Icon + text for dual coding
 * - High contrast focus ring (3px)
 * - Clear visual feedback on all states
 * - Keyboard navigation support
 */
export const DyslexiaButton = forwardRef<HTMLButtonElement, DyslexiaButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      icon,
      iconPosition = 'left',
      loading = false,
      disabled = false,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { settings } = useDyslexiaSettings()

    // Build CSS classes
    const buttonClasses = useMemo(() => {
      const classes: string[] = ['dyslexia-button']

      // Variant classes
      classes.push(`dyslexia-button--${variant}`)

      // Size classes
      classes.push(`dyslexia-button--${size}`)

      // State classes
      if (loading) classes.push('dyslexia-button--loading')
      if (disabled) classes.push('dyslexia-button--disabled')
      if (fullWidth) classes.push('dyslexia-button--full-width')

      // Icon-only class
      const hasIconOnly = iconPosition === 'only' || (!children && icon)
      if (hasIconOnly) classes.push('dyslexia-button--icon-only')

      // Custom classes

      // Custom classes
      if (className) {
        classes.push(className)
      }

      return classes.join(' ')
    }, [variant, size, loading, disabled, fullWidth, iconPosition, icon, children, className])

    // Inline styles for dynamic settings
    const buttonStyle = useMemo(() => ({
      fontSize: `${settings.fontSize * (size === 'sm' ? 0.85 : size === 'lg' ? 1.1 : 1)}px`,
      minHeight: `${Math.max(60, settings.fontSize * 2.5)}px`, // Minimum 60px touch target
      minWidth: iconPosition === 'only' || (!children && icon) ? `${Math.max(60, settings.fontSize * 2.5)}px` : undefined,
    }), [settings.fontSize, size, iconPosition, children, icon])

    // Render icon
    const renderIcon = () => {
      if (!icon) return null

      return (
        <span className="dyslexia-button__icon" aria-hidden="true">
          {icon}
        </span>
      )
    }

    // Render content
    const renderContent = () => {
      if (iconPosition === 'only' || (!children && icon)) {
        return renderIcon()
      }

      return (
        <>
          {iconPosition === 'left' && renderIcon()}
          <span className="dyslexia-button__text">{children}</span>
          {iconPosition === 'right' && renderIcon()}
        </>
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        style={buttonStyle}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="dyslexia-button__spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.25"
              />
              <path
                d="M12 2C17.5228 2 22 6.47715 22 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </span>
        )}
        <span className="dyslexia-button__content">{renderContent()}</span>
      </button>
    )
  }
)

DyslexiaButton.displayName = 'DyslexiaButton'

/**
 * Button Group - for related buttons
 */
export const DyslexiaButtonGroup: React.FC<{
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  className?: string
}> = ({ children, orientation = 'horizontal', className = '' }) => {
  const classes = [
    'dyslexia-button-group',
    `dyslexia-button-group--${orientation}`,
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}

/**
 * Icon Button - For icon-only actions (still has proper accessibility)
 */
export const DyslexiaIconButton = forwardRef<
  HTMLButtonElement,
  {
    'aria-label': string
    icon: React.ReactNode
    variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'xl'
    fullWidth?: boolean
    loading?: boolean
    disabled?: boolean
    className?: string
    style?: React.CSSProperties
    form?: string
    title?: string
    id?: string
  }
>(({ icon, 'aria-label': ariaLabel, size = 'md', variant = 'primary', ...props }, ref) => {
  return (
    <DyslexiaButton
      ref={ref}
      icon={icon}
      iconPosition="only"
      size={size}
      variant={variant}
      aria-label={ariaLabel}
      {...props}
    />
  )
})

DyslexiaIconButton.displayName = 'DyslexiaIconButton'

/**
 * Link Button - Looks like a button, acts like a link
 */
export const DyslexiaLinkButton = forwardRef<
  HTMLAnchorElement,
  DyslexiaButtonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ variant = 'accent', size = 'md', children, className = '', ...props }, ref) => {
  const { settings } = useDyslexiaSettings()

  return (
    <a
      ref={ref}
      className={`dyslexia-button dyslexia-button--link dyslexia-button--${variant} dyslexia-button--${size} ${className}`.trim()}
      style={{
        fontSize: `${settings.fontSize * (size === 'sm' ? 0.85 : size === 'lg' ? 1.1 : 1)}px`,
        minHeight: `${Math.max(60, settings.fontSize * 2.5)}px`,
      }}
      role="button"
      {...props}
    >
      {children}
    </a>
  )
})

DyslexiaLinkButton.displayName = 'DyslexiaLinkButton'

export default DyslexiaButton
