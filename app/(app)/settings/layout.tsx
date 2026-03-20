'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.less';

function UserIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 13.5c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8h5M12 8v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactElement;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/settings', label: 'Profile', icon: <UserIcon /> },
  { href: '/settings/api-keys', label: 'API Keys', icon: <KeyIcon /> },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();

  return (
    <div className={styles.settingsShell}>
      <nav className={styles.settingsNav} aria-label="Settings">
        <h1 className={styles.settingsTitle}>Settings</h1>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.mobileWrapper}>
        <div className={styles.mobileTabs} role="tablist" aria-label="Settings">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                role="tab"
                className={`${styles.mobileTab} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {icon}
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
        <main className={styles.settingsContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
