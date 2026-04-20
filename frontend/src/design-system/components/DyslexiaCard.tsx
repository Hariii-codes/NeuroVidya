import React, { forwardRef, useMemo } from 'react'
import { useDyslexiaSettings } from '../DyslexiaProvider'
import './DyslexiaCard.css'

export interface DyslexiaCardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  hover?: boolean
  clickable?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  icon?: React.ReactNode
  title?: string
  subtitle?: string
  accent?: boolean
}

/**
 * Dyslexia-First Card Component
 *
 * Accessibility Features:
 * - High contrast borders
 * - Generous padding for reduced visual noise
 * - Clear visual hierarchy
 * - Optional icon for dual coding
 */
export const DyslexiaCard = forwardRef<HTMLDivElement, DyslexiaCardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      rounded = 'md',
      hover = false,
      clickable = false,
      className = '',
      style,
      onClick,
      icon,
      title,
      subtitle,
      accent = false,
    },
    ref
  ) => {
    const { settings } = useDyslexiaSettings()

    // Build CSS classes
    const cardClasses = useMemo(() => {
      const classes: string[] = ['dyslexia-card']

      // Variant classes
      classes.push(`dyslexia-card--${variant}`)

      // Padding classes
      if (padding !== 'none') {
        classes.push(`dyslexia-card--padding-${padding}`)
      }

      // Rounded classes
      classes.push(`dyslexia-card--rounded-${rounded}`)

      // State classes
      if (hover) classes.push('dyslexia-card--hover')
      if (clickable || onClick) classes.push('dyslexia-card--clickable')
      if (accent) classes.push('dyslexia-card--accent')

      // Custom classes
      if (className) {
        classes.push(className)
      }

      return classes.join(' ')
    }, [variant, padding, rounded, hover, clickable, accent, className])

    // Inline styles
    const cardStyle = useMemo(() => ({
      ...style,
      fontSize: `${settings.fontSize}px`,
      lineHeight: settings.lineHeight,
    }), [settings, style])

    const content = (
      <>
        {(icon || title || subtitle) && (
          <div className="dyslexia-card__header">
            {icon && (
              <div className="dyslexia-card__icon" aria-hidden="true">
                {icon}
              </div>
            )}
            {(title || subtitle) && (
              <div className="dyslexia-card__title-group">
                {title && (
                  <h3 className="dyslexia-card__title">{title}</h3>
                )}
                {subtitle && (
                  <p className="dyslexia-card__subtitle">{subtitle}</p>
                )}
              </div>
            )}
          </div>
        )}
        <div className="dyslexia-card__content">
          {children}
        </div>
      </>
    )

    if (onClick || clickable) {
      return (
        <div
          ref={ref}
          className={cardClasses}
          style={cardStyle}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClick?.()
            }
          }}
        >
          {content}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cardClasses}
        style={cardStyle}
      >
        {content}
      </div>
    )
  }
)

DyslexiaCard.displayName = 'DyslexiaCard'

/**
 * Card Grid - For displaying multiple cards in a grid
 */
export const DyslexiaCardGrid: React.FC<{
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ children, columns = 3, gap = 'md', className = '' }) => {
  const classes = [
    'dyslexia-card-grid',
    `dyslexia-card-grid--${columns}`,
    `dyslexia-card-grid--gap-${gap}`,
    className,
  ].filter(Boolean).join(' ')

  return <div className={classes}>{children}</div>
}

/**
 * Stats Card - For displaying metrics/progress
 */
export const DyslexiaStatsCard: React.FC<{
  value: string | number
  label: string
  icon?: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  className?: string
}> = ({ value, label, icon, trend, className = '' }) => {
  return (
    <DyslexiaCard
      variant="flat"
      padding="lg"
      className={`dyslexia-stats-card ${className}`.trim()}
    >
      <div className="dyslexia-stats-card__top">
        {icon && (
          <div className="dyslexia-stats-card__icon" aria-hidden="true">
            {icon}
          </div>
        )}
        {trend && (
          <div
            className={`dyslexia-stats-card__trend dyslexia-stats-card__trend--${trend.positive ? 'positive' : 'negative'}`}
          >
            {trend.value}
          </div>
        )}
      </div>
      <div className="dyslexia-stats-card__value">{value}</div>
      <div className="dyslexia-stats-card__label">{label}</div>
    </DyslexiaCard>
  )
}

/**
 * Action Card - Card with primary action button
 */
export const DyslexiaActionCard: React.FC<{
  title: string
  description?: string
  icon?: React.ReactNode
  actionLabel: string
  onAction: () => void
  variant?: DyslexiaCardProps['variant']
  className?: string
}> = ({ title, description, icon, actionLabel, onAction, variant = 'default', className = '' }) => {
  return (
    <DyslexiaCard
      variant={variant}
      padding="lg"
      icon={icon}
      title={title}
      subtitle={description}
      className={`dyslexia-action-card ${className}`.trim()}
    >
      <button
        className="dyslexia-action-card__button"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </DyslexiaCard>
  )
}

export default DyslexiaCard
