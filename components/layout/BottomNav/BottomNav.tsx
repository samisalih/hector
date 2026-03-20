'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.less';

interface TabItem {
  href: string;
  label: string;
  icon: React.ReactElement;
}

function HomeIcon(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L11 2l8 7.5V19a1 1 0 0 1-1 1H14v-5h-4v5H4a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ClockIcon(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 7v4l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="13" width="4" height="6" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="9" y="8" width="4" height="11" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="15" y="3" width="4" height="16" rx="1" fill="currentColor" />
    </svg>
  );
}

function GearIcon(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 2v2.5M11 17.5V20M2 11h2.5M17.5 11H20M4.22 4.22l1.77 1.77M16.01 16.01l1.77 1.77M4.22 17.78l1.77-1.77M16.01 5.99l1.77-1.77"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TAB_ITEMS: TabItem[] = [
  { href: '/', label: 'Home', icon: <HomeIcon /> },
  { href: '/timer', label: 'Timer', icon: <ClockIcon /> },
  { href: '/time', label: 'Zeit', icon: <ChartIcon /> },
  { href: '/settings', label: 'Settings', icon: <GearIcon /> },
];

export default function BottomNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label="Hauptnavigation">
      {TAB_ITEMS.map(({ href, label, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
            <span className={styles.iconWrapper}>{icon}</span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
