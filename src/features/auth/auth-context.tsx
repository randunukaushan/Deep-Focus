import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AppState, Platform } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { activateAccountLocalStore, activateDeviceLocalStore } from '@/features/storage/local-database';
import { useAppLocale } from '@/features/localization/app-locale-context';
import { getAuthRuntimeCopy } from '@/features/localization/auth-runtime-copy';
import { authRedirectCode, createAuthService, exchangeAuthCodeOnce, type AuthServiceResult } from './auth-service';
import { authConfigurationError, supabase } from './supabase-client';

export type AuthStatus = 'initializing' | 'signed_out' | 'verification_required' | 'signed_in' | 'recovering' | 'configuration_error' | 'error';

export type AuthSnapshot = {
  status: AuthStatus;
  userId?: string;
  email?: string;
  message?: string;
};

type AuthContextValue = {
  snapshot: AuthSnapshot;
  signInWithPassword(email: string, password: string): Promise<AuthServiceResult>;
  signUpWithPassword(email: string, password: string): Promise<AuthServiceResult>;
  signInWithGoogle(): Promise<AuthServiceResult>;
  signInWithApple(): Promise<AuthServiceResult>;
  resendVerification(email: string): Promise<AuthServiceResult>;
  requestPasswordReset(email: string): Promise<AuthServiceResult>;
  updatePassword(password: string): Promise<AuthServiceResult>;
  signOut(): Promise<AuthServiceResult>;
  handleAuthRedirect(url: string): Promise<AuthServiceResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const redirectUrl = Linking.createURL('auth/callback', { scheme: 'deepfocus' });
WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: React.PropsWithChildren) {
  const { locale } = useAppLocale();
  const copy = getAuthRuntimeCopy(locale);
  const [snapshot, setSnapshot] = useState<AuthSnapshot>(supabase
    ? { status: 'initializing' }
    : { status: 'configuration_error', message: authConfigurationError ?? copy.configurationUnavailable });
  const service = useMemo(() => supabase ? createAuthService({
    client: supabase as unknown as Parameters<typeof createAuthService>[0]['client'],
    redirectUrl,
    openAuthSession: (url, callbackUrl) => WebBrowser.openAuthSessionAsync(url, callbackUrl),
    ...(Platform.OS === 'ios' ? { apple: AppleAuthentication, crypto: Crypto } : {}),
  }) : null, []);

  const updateFromSession = useCallback((session: { user?: { id?: string; email?: string } } | null, recovery = false) => {
    if (session?.user?.id) {
      try {
        activateAccountLocalStore(session.user.id);
        setSnapshot({
          status: recovery ? 'recovering' : 'signed_in',
          userId: session.user.id,
          ...(session.user.email ? { email: session.user.email } : {}),
        });
      } catch {
        setSnapshot({ status: 'error', message: copy.accountSessionUnsafe });
      }
      return;
    }
    activateDeviceLocalStore();
    setSnapshot({ status: 'signed_out' });
  }, [copy]);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    const client = supabase;

    let mounted = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      updateFromSession(session, event === 'PASSWORD_RECOVERY');
    });

    void client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        activateDeviceLocalStore();
        setSnapshot({ status: 'error', message: copy.sessionRestoreFailed });
      } else updateFromSession(data.session);
    }).catch(() => {
      if (!mounted) return;
      activateDeviceLocalStore();
      setSnapshot({ status: 'error', message: copy.sessionRestoreFailed });
    });

    const updateRefresh = (state: string) => {
      if (state === 'active') void client.auth.startAutoRefresh();
      else void client.auth.stopAutoRefresh();
    };
    updateRefresh(AppState.currentState);
    const appStateSubscription = AppState.addEventListener('change', updateRefresh);

    void Linking.getInitialURL().then((url) => { if (url && mounted) void handleRedirect(url); });
    const linkSubscription = Linking.addEventListener('url', ({ url }) => { void handleRedirect(url); });

    async function handleRedirect(url: string) {
      const parsed = authRedirectCode(url, redirectUrl);
      if (!parsed) return;
      if (parsed.error) {
        setSnapshot({ status: 'error', message: copy.invalidLink });
        return;
      }
      if (parsed.recovery) setSnapshot((current) => ({ ...current, status: 'recovering' }));
      if (!parsed.code) return;
      try {
        const { data, error } = await exchangeAuthCodeOnce(client, parsed.code);
        if (!mounted) return;
        if (error || !data.session) setSnapshot({ status: 'error', message: copy.invalidLink });
        else updateFromSession(data.session, parsed.recovery);
      } catch {
        if (mounted) setSnapshot({ status: 'error', message: copy.linkFailed });
      }
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appStateSubscription.remove();
      linkSubscription.remove();
      void client.auth.stopAutoRefresh();
    };
  }, [copy, updateFromSession]);

  const requireService = useCallback(() => {
    if (!service) return null;
    return service;
  }, [service]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const result = requireService()?.signInWithPassword(email, password) ?? { status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable };
    return result;
  }, [copy.configurationUnavailable, requireService]);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const result = await (requireService()?.signUpWithPassword(email, password) ?? Promise.resolve({ status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }));
    if (result.status === 'verification_required') setSnapshot({ status: 'verification_required', email: email.trim() });
    return result;
  }, [copy.configurationUnavailable, requireService]);

  const signInWithGoogle = useCallback(async () => requireService()?.signInWithGoogle()
    ?? { status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }, [copy.configurationUnavailable, requireService]);

  const signInWithApple = useCallback(async () => requireService()?.signInWithApple()
    ?? { status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }, [copy.configurationUnavailable, requireService]);

  const resendVerification = useCallback(async (email: string) => requireService()?.resendVerification(email)
    ?? { status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }, [copy.configurationUnavailable, requireService]);

  const requestPasswordReset = useCallback(async (email: string) => requireService()?.requestPasswordReset(email)
    ?? { status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }, [copy.configurationUnavailable, requireService]);

  const updatePassword = useCallback(async (password: string) => {
    const result = await (requireService()?.updatePassword(password) ?? Promise.resolve({ status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }));
    if (result.status === 'signed_in') setSnapshot((current) => ({ ...current, status: 'signed_in', message: undefined }));
    return result;
  }, [copy.configurationUnavailable, requireService]);

  const signOut = useCallback(async () => requireService()?.signOut()
    ?? { status: 'error' as const, message: authConfigurationError ?? copy.configurationUnavailable }, [copy.configurationUnavailable, requireService]);

  const handleAuthRedirect = useCallback(async (url: string): Promise<AuthServiceResult> => {
    if (!supabase) return { status: 'error', message: authConfigurationError ?? copy.configurationUnavailable };
    const parsed = authRedirectCode(url, redirectUrl);
    if (!parsed) return { status: 'error', message: copy.invalidDeepFocusLink };
    if (parsed.error) return { status: 'error', message: copy.invalidLink };
    if (!parsed.code) return { status: 'error', message: copy.incompleteLink };
    if (parsed.recovery) setSnapshot((current) => ({ ...current, status: 'recovering' }));
    try {
      const { data, error } = await exchangeAuthCodeOnce(supabase, parsed.code);
      if (error || !data.session) return { status: 'error', message: copy.invalidLink };
      updateFromSession(data.session, parsed.recovery);
      return { status: parsed.recovery ? 'sent' : 'signed_in' };
    } catch { return { status: 'error', message: copy.linkFailed }; }
  }, [copy, updateFromSession]);

  const value = useMemo<AuthContextValue>(() => ({
    snapshot, signInWithPassword, signUpWithPassword, signInWithGoogle, signInWithApple,
    resendVerification, requestPasswordReset, updatePassword, signOut, handleAuthRedirect,
  }), [snapshot, signInWithPassword, signUpWithPassword, signInWithGoogle, signInWithApple, resendVerification, requestPasswordReset, updatePassword, signOut, handleAuthRedirect]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
