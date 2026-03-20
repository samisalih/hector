'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from '../auth.module.less';

export default function ForgotPasswordPage(): React.ReactElement {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className={styles.card}>
        <div>
          <h1 className={styles.wordmark}>Hector</h1>
          <p className={styles.heading}>Check your inbox</p>
        </div>
        <p className={styles.successBanner}>
          We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
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
        <p className={styles.heading}>Reset your password</p>
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
        <Button variant="primary" size="md" type="submit" loading={loading}>
          Send reset link
        </Button>
      </form>

      <div className={styles.footer}>
        <Link href="/login" className={styles.footerLink}>Back to sign in</Link>
      </div>
    </div>
  );
}
