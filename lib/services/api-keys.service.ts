import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, ApiKey } from '@/types/database.types'
import type { CreateApiKeyRequest } from '@/types/api.types'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { ServiceError } from './errors'

type DbClient = SupabaseClient<Database>

type ApiKeyPublicFields = Omit<ApiKey, 'key_hash'>

const PUBLIC_COLUMNS = 'id, user_id, name, key_prefix, last_used_at, expires_at, created_at'

function generateRawKey(): string {
  return `tsx_${crypto.randomBytes(16).toString('hex')}`
}

function hashKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex')
}

export async function getKeys(
  supabase: DbClient,
  userId: string
): Promise<ApiKeyPublicFields[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select(PUBLIC_COLUMNS)
    .eq('user_id', userId)

  if (error) throw new ServiceError('NOT_FOUND', error.message)
  return (data ?? []) as ApiKeyPublicFields[]
}

export async function createKey(
  supabase: DbClient,
  keyData: CreateApiKeyRequest,
  userId: string
): Promise<{ key: string; record: ApiKeyPublicFields }> {
  const rawKey = generateRawKey()
  const keyHash = hashKey(rawKey)
  const keyPrefix = rawKey.slice(0, 16)

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: keyData.name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      expires_at: keyData.expiresAt ?? null,
    })
    .select(PUBLIC_COLUMNS)
    .single()

  if (error || !data) throw new ServiceError('CONFLICT', error?.message ?? 'Failed to create API key')

  return { key: rawKey, record: data as ApiKeyPublicFields }
}

export async function rotateKey(
  supabase: DbClient,
  keyId: string,
  userId: string
): Promise<{ key: string; record: ApiKeyPublicFields }> {
  const rawKey = generateRawKey()
  const keyHash = hashKey(rawKey)
  const keyPrefix = rawKey.slice(0, 16)

  const { data, error } = await supabase
    .from('api_keys')
    .update({ key_hash: keyHash, key_prefix: keyPrefix })
    .eq('id', keyId)
    .eq('user_id', userId)
    .select(PUBLIC_COLUMNS)
    .single()

  if (error || !data) throw new ServiceError('NOT_FOUND', 'API key not found')

  return { key: rawKey, record: data as ApiKeyPublicFields }
}

export async function deleteKey(
  supabase: DbClient,
  keyId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId)

  if (error) throw new ServiceError('NOT_FOUND', error.message)
}

/**
 * Validates a raw API key against the database.
 * Uses the service role client to bypass RLS for key_hash lookup.
 * Returns the associated user_id on success, or null if invalid/expired.
 */
export async function validateApiKey(rawKey: string): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const keyHash = hashKey(rawKey)

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, expires_at')
    .eq('key_hash', keyHash)
    .single()

  if (error || !data) return null

  if (data.expires_at && new Date(data.expires_at) < new Date()) return null

  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data.user_id
}
