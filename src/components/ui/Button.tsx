'use client';

import { useState } from 'react';
import { T } from '@/lib/constants/mock-data';
import { LoadingSpinner } from './LoadingSpinner';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  loading = false,
  icon,
  full,
  style = {},
  type = 'button',
  className,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const isDisabled = disabled || loading;

  const pad = { sm: '7px 16px', md: '11px 22px', lg: '13px 32px' }[size];
  const fs  = { sm: 13, md: 14, lg: 15 }[size];

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 9999,
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 150ms ease-out',
    fontSize: fs,
    padding: pad,
    opacity: isDisabled ? 0.5 : 1,
    width: full ? '100%' : 'auto',
    letterSpacing: '-0.01em',
    ...style,
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: hovered && !isDisabled ? T.p500 : T.p600,
      color: T.c50,
      boxShadow: hovered && !isDisabled ? '0 4px 14px rgba(27,122,101,0.3)' : 'none',
    },
    secondary: {
      background: hovered && !isDisabled ? T.p100 : 'transparent',
      color: T.p600,
      border: `1.5px solid ${T.p600}`,
    },
    accent: {
      background: hovered && !isDisabled ? T.e500 : T.e600,
      color: T.c50,
      boxShadow: hovered && !isDisabled ? '0 4px 14px rgba(193,122,95,0.3)' : 'none',
    },
    ghost: {
      background: hovered && !isDisabled ? T.c200 : 'transparent',
      color: T.g700,
      borderRadius: 10,
      padding: '8px 14px',
    },
    dark: {
      background: hovered && !isDisabled ? '#2a2a2a' : T.g900,
      color: T.c50,
    },
    danger: {
      background: hovered && !isDisabled ? '#b84a3a' : T.danger,
      color: T.c50,
      boxShadow: hovered && !isDisabled ? '0 4px 14px rgba(196,91,74,0.3)' : 'none',
    },
  };

  return (
    <button
      type={type}
      className={className}
      style={{ ...base, ...variants[variant] }}
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={isDisabled}
      aria-busy={loading}
    >
      {loading ? (
        <LoadingSpinner
          size={size === 'sm' ? 'sm' : 'sm'}
          color={variant === 'secondary' ? T.p600 : T.c50}
        />
      ) : (
        icon && icon
      )}
      {children}
    </button>
  );
}
