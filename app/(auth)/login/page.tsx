'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from '../auth.module.less';

export default function LoginPage(): React.ReactElement {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password.');
      setLoading(false);
      return;
    }

    const redirectTo = searchParams.get('redirectTo') ?? '/';
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <div>
        <h1 className={styles.wordmark}>Hector</h1>
        <p className={styles.heading}>Sign in to your account</p>
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
        <div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        </div>
        <Button variant="primary" size="md" type="submit" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className={styles.footer}>
        <span>Don't have an account?</span>
        <Link href="/register" className={styles.footerLink}>Sign up</Link>
      </div>
    </div>
  );
}
