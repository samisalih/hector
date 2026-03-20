'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import type { Theme } from '@/types/database.types';
import styles from './page.module.less';

interface ProfileData {
  email: string;
  display_name: string | null;
  theme: Theme;
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function ProfileSettingsPage(): React.ReactElement {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [theme, setTheme] = useState<Theme>('system');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const res = await fetch('/api/v1/me');
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load profile');
        const data: ProfileData = json.data;
        setProfile(data);
        setDisplayName(data.display_name ?? '');
        setTheme(data.theme);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleThemeChange(next: Theme): void {
    setTheme(next);
    // Live preview — persisted on save
    if (next !== 'system') {
      document.documentElement.dataset.theme = next;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    }
  }

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/v1/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim() || null,
          theme,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to save');
      setProfile(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  const isDirty =
    profile !== null &&
    (displayName !== (profile.display_name ?? '') || theme !== profile.theme);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile</h2>
        <p className={styles.subtitle}>Manage your personal information and preferences.</p>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Account</h3>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <p className={styles.staticValue}>{profile?.email}</p>
          </div>
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Appearance</h3>
        <div className={styles.field}>
          <label className={styles.label}>Theme</label>
          <div className={styles.themeSelector} role="group" aria-label="Theme">
            {THEME_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`${styles.themeOption} ${theme === value ? styles.themeActive : ''}`}
                onClick={() => handleThemeChange(value)}
                aria-pressed={theme === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.actions}>
        {saved && <span className={styles.savedHint}>Saved!</span>}
        <Button
          variant="primary"
          size="md"
          type="submit"
          loading={saving}
          disabled={!isDirty}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
