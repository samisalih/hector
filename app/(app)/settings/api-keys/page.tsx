'use client';

import React, { useState } from 'react';
import { ApiKeyList } from '@/components/settings/ApiKeyList/ApiKeyList';
import { CreateApiKeyModal } from '@/components/settings/CreateApiKeyModal/CreateApiKeyModal';
import { ApiKeyReveal } from '@/components/settings/ApiKeyReveal/ApiKeyReveal';

export default function ApiKeysSettingsPage(): React.ReactElement {
  const [createOpen, setCreateOpen] = useState(false);
  const [revealKey, setRevealKey] = useState<{ key: string; name: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleCreated(key: string, name: string): void {
    setRevealKey({ key, name });
    setRefreshTrigger((n) => n + 1);
  }

  function handleRotateSuccess(key: string, name: string): void {
    setRevealKey({ key, name });
  }

  function handleRevealClose(): void {
    setRevealKey(null);
  }

  return (
    <>
      <ApiKeyList
        onCreateClick={() => setCreateOpen(true)}
        onRotateSuccess={handleRotateSuccess}
        refreshTrigger={refreshTrigger}
      />

      <CreateApiKeyModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <ApiKeyReveal
        isOpen={!!revealKey}
        apiKey={revealKey?.key ?? ''}
        keyName={revealKey?.name ?? ''}
        onClose={handleRevealClose}
      />
    </>
  );
}
