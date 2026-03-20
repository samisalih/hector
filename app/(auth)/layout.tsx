import React from 'react';
import styles from './layout.module.less';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className={styles.shell}>
      {children}
    </div>
  );
}
