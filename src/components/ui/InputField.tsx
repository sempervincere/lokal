'use client';

import { useState } from 'react';
import { T } from '@/lib/constants/mock-data';

interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function InputField({ prefix, suffix, style = {}, ...props }: InputFieldProps) {
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
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
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
