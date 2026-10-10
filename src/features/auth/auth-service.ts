export type AuthServiceResult =
  | { status: 'signed_in' | 'verification_required' | 'sent' | 'cancelled' }
  | { status: 'error'; message: string };

export type AuthClient = {
  auth: {
    signInWithPassword(input: { email: string; password: string }): Promise<{ data: { session: unknown }; error: unknown }>;
    signUp(input: { email: string; password: string; options: { emailRedirectTo: string } }): Promise<{ data: { session: unknown }; error: unknown }>;
    resend(input: { type: 'signup'; email: string; options: { emailRedirectTo: string } }): Promise<{ error: unknown }>;
    resetPasswordForEmail(email: string, options: { redirectTo: string }): Promise<{ error: unknown }>;
    updateUser(input: { password: string }): Promise<{ error: unknown }>;
    signInWithOAuth(input: { provider: 'google'; options: { redirectTo: string; skipBrowserRedirect: true } }): Promise<{ data: { url: string | null }; error: unknown }>;
    exchangeCodeForSession(code: string): Promise<{ data: { session: unknown }; error: unknown }>;
    signInWithIdToken(input: { provider: 'apple'; token: string; nonce: string }): Promise<{ data: { session: unknown }; error: unknown }>;
    signOut(): Promise<{ error: unknown }>;
  };
};

type BrowserAuthResult = { type: string; url?: string };
type AppleCredential = { identityToken?: string | null };
type AppleAuthModule = {
  AppleAuthenticationScope: { EMAIL: number; FULL_NAME: number };
  signInAsync(input: { nonce: string; requestedScopes: number[] }): Promise<AppleCredential>;
};
type CryptoModule = {
  randomUUID(): string;
  digestStringAsync(algorithm: string, value: string): Promise<string>;
  CryptoDigestAlgorithm: { SHA256: string };
};

export type AuthServiceDependencies = {
  client: AuthClient;
  redirectUrl: string;
  openAuthSession: (url: string, redirectUrl: string) => Promise<BrowserAuthResult>;
  apple?: AppleAuthModule;
  crypto?: CryptoModule;
};

type CodeExchangeClient<T> = { auth: { exchangeCodeForSession(code: string): Promise<T> } };
type ExchangeEntry<T> = { promise: Promise<T>; expiresAt: number };
const exchanges = new WeakMap<object, Map<string, ExchangeEntry<unknown>>>();
const REPLAY_WINDOW_MS = 5 * 60 * 1000;

/** Coalesces callback delivery from both the browser result and native deep-link listener. */
export function exchangeAuthCodeOnce<T>(client: CodeExchangeClient<T>, code: string, now = Date.now()): Promise<T> {
  let entries = exchanges.get(client);
  if (!entries) {
    entries = new Map();
    exchanges.set(client, entries);
  }
  for (const [knownCode, entry] of entries) if (entry.expiresAt <= now) entries.delete(knownCode);
  const existing = entries.get(code);
  if (existing) return existing.promise as Promise<T>;
  const promise = client.auth.exchangeCodeForSession(code);
  entries.set(code, { promise, expiresAt: now + REPLAY_WINDOW_MS });
  while (entries.size > 32) entries.delete(entries.keys().next().value as string);
  return promise;
}

function safeMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  if (code === 'invalid_credentials' || code === 'email_not_confirmed') return 'Email or password is incorrect, or email verification is still needed.';
  if (code === 'weak_password') return 'Choose a stronger password and try again.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Please wait a little before trying again.';
  if (code === 'secure_storage_unavailable' || code === 'secure_storage_write_failed') return 'Secure sign-in could not be saved on this device. Your account was not opened.';
  return 'We could not complete sign-in. Check your connection and try again.';
}

function resultFor(error: unknown): AuthServiceResult {
  return { status: 'error', message: safeMessage(error) };
}

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) return String((error as { code?: unknown }).code);
  return '';
}

function emailValue(email: string): string {
  const value = email.trim();
  if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new RangeError('INVALID_EMAIL');
  return value;
}

export function createAuthService(dependencies: AuthServiceDependencies) {
  const { client, redirectUrl } = dependencies;
  return {
    async signInWithPassword(email: string, password: string): Promise<AuthServiceResult> {
      if (!password) return { status: 'error', message: 'Enter your password.' };
      try {
        const { data, error } = await client.auth.signInWithPassword({ email: emailValue(email), password });
        if (error) return resultFor(error);
        if (!data.session) return { status: 'error', message: 'Sign-in did not create a session. Try again or verify your email.' };
        return { status: 'signed_in' };
      } catch (error) { return resultFor(error); }
    },

    async signUpWithPassword(email: string, password: string): Promise<AuthServiceResult> {
      if (!password) return { status: 'error', message: 'Enter a password.' };
      try {
        const { data, error } = await client.auth.signUp({ email: emailValue(email), password, options: { emailRedirectTo: redirectUrl } });
        if (error) return resultFor(error);
        return data.session ? { status: 'signed_in' } : { status: 'verification_required' };
      } catch (error) { return resultFor(error); }
    },

    async resendVerification(email: string): Promise<AuthServiceResult> {
      try {
        const { error } = await client.auth.resend({ type: 'signup', email: emailValue(email), options: { emailRedirectTo: redirectUrl } });
        return error ? resultFor(error) : { status: 'sent' };
      } catch (error) { return resultFor(error); }
    },

    async requestPasswordReset(email: string): Promise<AuthServiceResult> {
      try {
        const { error } = await client.auth.resetPasswordForEmail(emailValue(email), { redirectTo: redirectUrl });
        // Do not reveal whether the email belongs to an existing account.
        return error ? resultFor(error) : { status: 'sent' };
      } catch (error) { return resultFor(error); }
    },

    async updatePassword(password: string): Promise<AuthServiceResult> {
      if (!password) return { status: 'error', message: 'Enter a new password.' };
      try {
        const { error } = await client.auth.updateUser({ password });
        return error ? resultFor(error) : { status: 'signed_in' };
      } catch (error) { return resultFor(error); }
    },

    async signInWithGoogle(): Promise<AuthServiceResult> {
      try {
        const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl, skipBrowserRedirect: true } });
        if (error) return resultFor(error);
        if (!data.url) return { status: 'error', message: 'Google sign-in is not configured for this app yet.' };
        const browserResult = await dependencies.openAuthSession(data.url, redirectUrl);
        if (browserResult.type !== 'success') return { status: 'cancelled' };
        if (!browserResult.url) return { status: 'error', message: 'The sign-in response was incomplete. Please try again.' };
        const code = new URL(browserResult.url).searchParams.get('code');
        if (!code) return { status: 'error', message: 'The sign-in response was incomplete. Please try again.' };
        const exchanged = await exchangeAuthCodeOnce(client, code);
        if (exchanged.error) return resultFor(exchanged.error);
        return exchanged.data.session ? { status: 'signed_in' } : { status: 'error', message: 'Sign-in did not create a session. Try again.' };
      } catch (error) { return resultFor(error); }
    },

    async signInWithApple(): Promise<AuthServiceResult> {
      if (!dependencies.apple || !dependencies.crypto) return { status: 'error', message: 'Apple sign-in is available on supported iOS devices.' };
      try {
        const rawNonce = dependencies.crypto.randomUUID();
        const hashedNonce = await dependencies.crypto.digestStringAsync(dependencies.crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
        const credential = await dependencies.apple.signInAsync({
          nonce: hashedNonce,
          requestedScopes: [dependencies.apple.AppleAuthenticationScope.EMAIL, dependencies.apple.AppleAuthenticationScope.FULL_NAME],
        });
        if (!credential.identityToken) return { status: 'error', message: 'Apple did not return a sign-in token. Please try again.' };
        const { data, error } = await client.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken, nonce: rawNonce });
        if (error) return resultFor(error);
        return data.session ? { status: 'signed_in' } : { status: 'error', message: 'Sign-in did not create a session. Try again.' };
      } catch (error) {
        if (errorMessage(error) === 'ERR_REQUEST_CANCELED') return { status: 'cancelled' };
        return resultFor(error);
      }
    },

    async signOut(): Promise<AuthServiceResult> {
      try {
        const { error } = await client.auth.signOut();
        return error ? resultFor(error) : { status: 'sent' };
      } catch (error) { return resultFor(error); }
    },
  };
}

export function authRedirectCode(url: string, redirectUrl: string): { code: string | null; error: boolean; recovery: boolean } | null {
  try {
    const parsed = new URL(url);
    const expected = new URL(redirectUrl);
    if (parsed.protocol !== expected.protocol || parsed.host !== expected.host || parsed.pathname !== expected.pathname) return null;
    return {
      code: parsed.searchParams.get('code'),
      error: parsed.searchParams.has('error') || parsed.searchParams.has('error_code'),
      recovery: parsed.searchParams.get('type') === 'recovery',
    };
  } catch { return null; }
}

