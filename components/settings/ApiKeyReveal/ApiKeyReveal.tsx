'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import styles from './ApiKeyReveal.module.less';

interface ApiKeyRevealProps {
  isOpen: boolean;
  apiKey: string;
  keyName: string;
  onClose: () => void;
}

export function ApiKeyReveal({
  isOpen,
  apiKey,
  keyName,
  onClose,
}: ApiKeyRevealProps): React.ReactElement {
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Your API key — ${keyName}`} size="md">
      <div className={styles.warningBanner}>
        <WarningIcon />
        <span>
          This key will <strong>never be shown again</strong>. Copy it now and store it somewhere safe.
        </span>
      </div>

      <div className={styles.keyBox}>
        <code className={styles.keyText}>{apiKey}</code>
        <button
          className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
          onClick={handleCopy}
          aria-label="Copy API key"
          type="button"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      {copied && <p className={styles.copiedHint}>Copied to clipboard!</p>}

      <div className={styles.footer}>
        <Button variant="primary" size="md" onClick={onClose}>
          I've saved the key
        </Button>
      </div>
    </Modal>
  );
}

function WarningIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}

function CopyIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
