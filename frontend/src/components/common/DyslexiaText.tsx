import React from 'react'

type DyslexiaTextAs = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label'

interface DyslexiaTextProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  color?: string
  as?: DyslexiaTextAs
}

const DyslexiaText: React.FC<DyslexiaTextProps> = ({
  children,
  className = '',
  size = 'md',
  weight = 'normal',
  color = 'text-dyslexia-darkGray',
  as = 'span',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  const combinedClasses = `
    ${sizeClasses[size]}
    ${weightClasses[weight]}
    ${color}
    leading-dyslexia
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return React.createElement(
    as,
    { className: combinedClasses },
    children
  )
}

export { DyslexiaText }
export default DyslexiaText
