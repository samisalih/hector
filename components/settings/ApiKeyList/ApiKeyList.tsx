'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal/Modal';
import type { ApiKeyResponse } from '@/types/api.types';
import styles from './ApiKeyList.module.less';

interface ApiKeyListProps {
  onCreateClick: () => void;
  onRotateSuccess: (key: string, keyName: string) => void;
  refreshTrigger?: number;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function ApiKeyList({
  onCreateClick,
  onRotateSuccess,
  refreshTrigger,
}: ApiKeyListProps): React.ReactElement {
  const [keys, setKeys] = useState<ApiKeyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRotateId, setConfirmRotateId] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/api-keys');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load');
      setKeys(json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys, refreshTrigger]);

  async function handleDelete(id: string): Promise<void> {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Delete failed');
      }
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRotate(id: string): Promise<void> {
    setRotatingId(id);
    setConfirmRotateId(null);
    try {
      const res = await fetch(`/api/v1/api-keys/${id}/rotate`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Rotate failed');
      const newKey = json.data;
      setKeys((prev) => prev.map((k) => (k.id === id ? newKey : k)));
      onRotateSuccess(newKey.key, newKey.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRotatingId(null);
    }
  }

  const confirmDeleteKey = keys.find((k) => k.id === confirmDeleteId);
  const confirmRotateKey = keys.find((k) => k.id === confirmRotateId);

  if (loading) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyText}>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>API Keys</h2>
          <p className={styles.subtitle}>
            For external tools and MCP servers. The full key is shown only once.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onCreateClick}>
          Create new key
        </Button>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      {keys.length === 0 ? (
        <div className={styles.emptyState}>
          <KeyEmptyIcon />
          <p className={styles.emptyText}>No API keys yet.</p>
          <p className={styles.emptySubtext}>
            Create your first key to connect external tools.
          </p>
          <Button variant="secondary" size="sm" onClick={onCreateClick}>
            Create first key
          </Button>
        </div>
      ) : (
        <ul className={styles.keyList}>
          {keys.map((key) => {
            const expired = isExpired(key.expiresAt);
            return (
              <li key={key.id} className={styles.keyRow}>
                <div className={styles.keyInfo}>
                  <span className={styles.keyName}>{key.name}</span>
                  <code className={styles.keyPrefix}>{key.keyPrefix}…</code>
                </div>
                <div className={styles.keyMeta}>
                  <span className={styles.metaItem}>
                    Created {formatDate(key.createdAt)}
                  </span>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaItem}>
                    {key.lastUsedAt
                      ? `Last used ${formatDate(key.lastUsedAt)}`
                      : 'Never used'}
                  </span>
                  {key.expiresAt && (
                    <>
                      <span className={styles.metaDot}>·</span>
                      <span
                        className={`${styles.metaItem} ${expired ? styles.expired : ''}`}
                      >
                        {expired ? 'Expired' : `Expires ${formatDate(key.expiresAt)}`}
                      </span>
                    </>
                  )}
                </div>
                <div className={styles.keyActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={rotatingId === key.id}
                    onClick={() => setConfirmRotateId(key.id)}
                  >
                    Rotate
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deletingId === key.id}
                    onClick={() => setConfirmDeleteId(key.id)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Delete confirmation */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete key"
        size="sm"
      >
        <p className={styles.confirmText}>
          Are you sure you want to delete <strong>{confirmDeleteKey?.name}</strong>?
          All requests using this key will immediately fail.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={!!deletingId}
            onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
          >
            Delete permanently
          </Button>
        </div>
      </Modal>

      {/* Rotate confirmation */}
      <Modal
        isOpen={!!confirmRotateId}
        onClose={() => setConfirmRotateId(null)}
        title="Rotate key"
        size="sm"
      >
        <p className={styles.confirmText}>
          The old key for <strong>{confirmRotateKey?.name}</strong> will be invalidated immediately.
          You'll receive a new key shown only once.
        </p>
        <div className={styles.confirmActions}>
          <Button variant="ghost" size="sm" onClick={() => setConfirmRotateId(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={!!rotatingId}
            onClick={() => confirmRotateId && handleRotate(confirmRotateId)}
          >
            Rotate key
          </Button>
        </div>
      </Modal>
    </>
  );
}

function KeyEmptyIcon(): React.ReactElement {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className={styles.emptyIcon}>
      <circle cx="16" cy="20" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M23 20h10M30 20v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="20" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
