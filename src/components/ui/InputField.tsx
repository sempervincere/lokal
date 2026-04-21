'use client';

import { useState } from 'react';
import { T } from '@/lib/constants/mock-data';

interface InputFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function InputField({ placeholder, value, onChange, type = 'text', prefix, suffix, style = {}, onKeyDown }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: T.c50,
      border: `1.5px solid ${focused ? T.p500 : T.c200}`,
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: focused ? `0 0 0 3px ${T.p100}` : 'none',
      transition: 'all 150ms',
      ...style,
    }}>
      {prefix && prefix}
      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={onKeyDown}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
          fontSize: 14,
          color: T.g900,
        }}
      />
      {suffix && suffix}
    </div>
  );
}
