'use client';

import React from 'react';
import styles from './Spinner.module.less';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function Spinner({ size = 'md', color }: SpinnerProps): React.ReactElement {
  const classNames = [styles.spinner, sizeClass[size]].join(' ');

  return (
    <span
      className={classNames}
      role="status"
      aria-label="Loading"
      style={color ? ({ '--spinner-color': color } as React.CSSProperties) : undefined}
    />
  );
}
