import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import * as Crypto from 'expo-crypto';
import { createAccountBackendConnection } from './account-backend-connection';
import { supabase } from './supabase-client';
import type { AuthSnapshot } from './auth-context';

export type BackendAccountState =
  | { status: 'signed_out' | 'not_configured' | 'connecting' | 'unavailable' }
  | { status: 'connected'; userId: string; workspaceId: string };

/** Online account provisioning retries on foreground without blocking local work. */
export function useBackendAccount(snapshot: AuthSnapshot): BackendAccountState {
  const [state, setState] = useState<BackendAccountState>({ status: 'signed_out' });
  const userId = snapshot.status === 'signed_in' ? snapshot.userId : undefined;
  useEffect(() => {
    let active = true;
    let inFlight = false;
    const baseUrl = process.env.EXPO_PUBLIC_DEEP_FOCUS_API_BASE_URL?.trim();
    if (!userId || !supabase) return;
    if (!baseUrl) return;
    const connection = createAccountBackendConnection({
      baseUrl, auth: supabase.auth, isCurrent: (ownerId) => active && ownerId === userId,
    });
    const idempotencyKey = Crypto.randomUUID();
    async function connect() {
      if (!active || inFlight || AppState.currentState !== 'active') return;
      inFlight = true;
      setState({ status: 'connecting' });
      try {
        // The generic initial label contains no email or provider metadata.
        // Retrying bootstrap never overwrites an existing chosen display name.
        const result = await connection.connect({ userId: userId!, displayName: 'Deep Focus', idempotencyKey });
        if (active) setState({ status: 'connected', userId: userId!, workspaceId: result.profile.workspaceId });
      } catch {
        if (active) setState({ status: 'unavailable' });
      } finally { inFlight = false; }
    }
    void connect();
    const subscription = AppState.addEventListener('change', (next) => { if (next === 'active') void connect(); });
    return () => { active = false; subscription.remove(); };
  }, [userId]);
  if (!userId) return { status: 'signed_out' };
  if (!process.env.EXPO_PUBLIC_DEEP_FOCUS_API_BASE_URL?.trim()) return { status: 'not_configured' };
  if (state.status === 'connected' && state.userId !== userId) return { status: 'connecting' };
  return state;
}
