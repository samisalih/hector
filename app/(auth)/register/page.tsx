'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from '../auth.module.less';

export default function RegisterPage(): React.ReactElement {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setPasswordError('');
    setConfirmError('');
    setError(null);

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setError('This email is already registered.');
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div>
          <h1 className={styles.wordmark}>Hector</h1>
          <p className={styles.heading}>Check your inbox</p>
        </div>
        <p className={styles.successBanner}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <div className={styles.footer}>
          <Link href="/login" className={styles.footerLink}>Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div>
        <h1 className={styles.wordmark}>Hector</h1>
        <p className={styles.heading}>Create an account</p>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.fields}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          error={passwordError}
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          error={confirmError}
        />
        <Button variant="primary" size="md" type="submit" loading={loading}>
          Create account
        </Button>
      </form>

      <div className={styles.footer}>
        <span>Already have an account?</span>
        <Link href="/login" className={styles.footerLink}>Sign in</Link>
      </div>
    </div>
  );
}
