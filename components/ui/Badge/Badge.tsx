'use client';

import React from 'react';
import styles from './Badge.module.less';

type BadgeVariant = 'default' | 'warning' | 'danger' | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  default: styles.default,
  warning: styles.warning,
  danger: styles.danger,
  success: styles.success,
};

export function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps): React.ReactElement {
  const classNames = [styles.badge, variantClass[variant], className ?? '']
    .filter(Boolean)
    .join(' ');

  return <span className={classNames}>{children}</span>;
}
