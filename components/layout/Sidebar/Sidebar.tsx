'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './Sidebar.module.less';

function AllTasksIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="14" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="7" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="1" y="11" width="12" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

function TimerIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 6v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignOutIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 11l3-3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function getInitials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function Sidebar(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadProfile(): Promise<void> {
      try {
        const res = await fetch('/api/v1/me');
        if (!res.ok) return;
        const json = await res.json();
        setDisplayName(json.data?.display_name ?? null);
        setEmail(json.data?.email ?? '');
      } catch {
        // silently ignore — sidebar still renders without profile
      }
    }
    loadProfile();
  }, []);

  async function handleSignOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  const initials = getInitials(displayName, email);
  const nameLabel = displayName?.trim() || email;

  return (
    <aside className={styles.sidebar}>
      {/* Top nav pill */}
      <nav className={styles.pill}>
        <Link
          href="/"
          className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}
        >
          <AllTasksIcon />
          <span>All tasks</span>
        </Link>
        <Link
          href="/time"
          className={`${styles.navItem} ${pathname === '/time' ? styles.active : ''}`}
        >
          <TimerIcon />
          <span>Tracked time</span>
        </Link>
      </nav>

      <div className={styles.spacer} />

      {/* Settings pill */}
      <nav className={styles.pill}>
        <Link
          href="/settings"
          className={`${styles.navItem} ${pathname?.startsWith('/settings') ? styles.active : ''}`}
        >
          <SettingsIcon />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User pill */}
      <div className={styles.pill}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{nameLabel}</span>
            <span className={styles.accountType}>Free</span>
          </div>
          <button
            className={styles.signOutBtn}
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
          >
            <SignOutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
}
