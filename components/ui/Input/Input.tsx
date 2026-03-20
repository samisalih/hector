'use client';

import React from 'react';
import styles from './Input.module.less';

interface InputProps {
  label?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  error?: string;
  type?: React.HTMLInputTypeAttribute;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  disabled = false,
  autoFocus = false,
  onKeyDown,
  className,
}: InputProps): React.ReactElement {
  const inputId = label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  const wrapperClassNames = [styles.wrapper, className ?? ''].filter(Boolean).join(' ');
  const inputClassNames = [styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassNames}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClassNames}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
