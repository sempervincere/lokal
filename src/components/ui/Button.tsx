'use client';

import { useState } from 'react';
import { T } from '@/lib/constants/mock-data';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  icon,
  full,
  style = {},
  type = 'button',
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const pad = { sm: '7px 16px', md: '11px 22px', lg: '13px 32px' }[size];
  const fs = { sm: 13, md: 14, lg: 15 }[size];

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 9999,
    fontFamily: 'inherit',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 150ms ease-out',
    fontSize: fs,
    padding: pad,
    opacity: disabled ? 0.45 : 1,
    width: full ? '100%' : 'auto',
    letterSpacing: '-0.01em',
    ...style,
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: hovered ? T.p500 : T.p600,
      color: T.c50,
      boxShadow: hovered ? '0 4px 14px rgba(27,122,101,0.3)' : 'none',
    },
    secondary: {
      background: hovered ? T.p100 : 'transparent',
      color: T.p600,
      border: `1.5px solid ${T.p600}`,
    },
    accent: {
      background: hovered ? T.e500 : T.e600,
      color: T.c50,
      boxShadow: hovered ? '0 4px 14px rgba(193,122,95,0.3)' : 'none',
    },
    ghost: {
      background: hovered ? T.c200 : 'transparent',
      color: T.g700,
      borderRadius: 10,
      padding: '8px 14px',
    },
    dark: {
      background: hovered ? '#2a2a2a' : T.g900,
      color: T.c50,
    },
  };

  return (
    <button
      type={type}
      style={{ ...base, ...variants[variant] }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon && icon}
      {children}
    </button>
  );
}
