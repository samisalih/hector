'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import type { NewApiKeyResponse } from '@/types/api.types';
import styles from './CreateApiKeyModal.module.less';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (key: string, keyName: string) => void;
}

export function CreateApiKeyModal({
  isOpen,
  onClose,
  onCreated,
}: CreateApiKeyModalProps): React.ReactElement {
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose(): void {
    setName('');
    setExpiresAt('');
    setNameError('');
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError('');
    setSubmitting(true);
    setError(null);

    try {
      const body: { name: string; expiresAt?: string } = { name: name.trim() };
      if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();

      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to create key');

      const newKey = json.data as NewApiKeyResponse;
      handleClose();
      onCreated(newKey.key, newKey.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  // Minimum date for expiry: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create API key" size="sm">
      <form onSubmit={handleSubmit}>
        <div className={styles.fields}>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My MCP server"
            error={nameError}
            autoFocus
          />

          <div className={styles.field}>
            <label className={styles.label} htmlFor="expires-at">
              Expires on
              <span className={styles.optional}> — optional</span>
            </label>
            <input
              id="expires-at"
              type="date"
              className={styles.dateInput}
              value={expiresAt}
              min={minDate}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        {error && <p className={styles.errorBanner}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={submitting}>
            Create key
          </Button>
        </div>
      </form>
    </Modal>
  );
}
