'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from '../auth.module.less';

export default function ResetPasswordPage(): React.ReactElement {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState('');

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setConfirmError('');
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login');
  }

  return (
    <div className={styles.card}>
      <div>
        <h1 className={styles.wordmark}>Hector</h1>
        <p className={styles.heading}>Set a new password</p>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.fields}>
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          autoFocus
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
          Update password
        </Button>
      </form>
    </div>
  );
}
