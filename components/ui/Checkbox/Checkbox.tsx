'use client';

import React from 'react';
import styles from './Checkbox.module.less';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
}: CheckboxProps): React.ReactElement {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.checked);
  };

  return (
    <label className={[styles.wrapper, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        className={styles.hiddenInput}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <span className={[styles.box, checked ? styles.checked : ''].filter(Boolean).join(' ')}>
        {checked && (
          <svg
            className={styles.checkmark}
            viewBox="0 0 10 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 4L3.8 7L9 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
