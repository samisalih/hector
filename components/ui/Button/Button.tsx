'use client';

import React from 'react';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import styles from './Button.module.less';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  className?: string;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
};

const sizeClass: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * General-purpose button with variant and size support.
 * Shows an inline spinner when `loading` is true and disables interaction.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  type = 'button',
  className,
}: ButtonProps): React.ReactElement {
  const spinnerSize = size === 'lg' ? 'sm' : 'sm';
  const isDisabled = disabled || loading;

  const classNames = [
    styles.button,
    variantClass[variant],
    sizeClass[size],
    loading ? styles.loading : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classNames}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading && (
        <span className={styles.spinnerWrapper}>
          <Spinner size={spinnerSize} />
        </span>
      )}
      <span className={loading ? styles.hiddenContent : undefined}>
        {children}
      </span>
    </button>
  );
}
