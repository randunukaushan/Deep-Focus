'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { accountCopy, type Locale } from '@/content/locale';
import { accountPrivacyCopy } from '@/content/account-privacy-copy';

type PortalState = 'loading' | 'signed_out' | 'signed_in' | 'unavailable' | 'error';
type AuthMode = 'sign_in' | 'sign_up' | 'reset';

export function AccountPortal({ locale = 'en' }: { locale?: Locale }) {
  const copy = accountCopy[locale];
  const privacyCopy = accountPrivacyCopy[locale];
  const [state, setState] = useState<PortalState>(() => (getSupabaseBrowserClient() ? 'loading' : 'unavailable'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('sign_in');
  const client = getSupabaseBrowserClient();

  useEffect(() => {
    if (!client) {
      return undefined;
    }
    let mounted = true;
    void client.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setState('error');
      else if (data.user) {
        setEmail(data.user.email ?? '');
        setState('signed_in');
      } else setState('signed_out');
    }).catch(() => { if (mounted) setState('error'); });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState(session?.user ? 'signed_in' : 'signed_out');
      if (session?.user?.email) setEmail(session.user.email);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [client]);

  async function signIn() {
    if (!client || !email.trim() || !password) {
      setMessage(copy.enterEmailPassword);
      return;
    }
    setBusy(true);
    setMessage('');
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage(copy.safeError);
    else setMessage(copy.signedInMessage);
  }

  async function signUp() {
    if (!client || !email.trim() || !password) {
      setMessage(copy.enterEmailPasswordForAccount);
      return;
    }
    setBusy(true);
    setMessage('');
    const { data, error } = await client.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (error) setMessage(copy.safeError);
    else setMessage(data.session ? copy.accountCreatedMessage : copy.checkEmailMessage);
  }

  async function requestReset() {
    if (!client || !email.trim()) {
      setMessage(copy.enterEmail);
      return;
    }
    setBusy(true);
    setMessage('');
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.href });
    setBusy(false);
    setMessage(error ? copy.safeError : copy.resetSentMessage);
  }

  async function signInWithGoogle() {
    if (!client) return;
    setBusy(true);
    setMessage('');
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
    if (error) {
      setBusy(false);
      setMessage(copy.safeError);
    }
  }

  async function signOut() {
    if (!client) return;
    setPassword('');
    setBusy(true);
    const { error } = await client.auth.signOut();
    setBusy(false);
    setMessage(error ? copy.safeError : copy.signedOutMessage);
  }

  function downloadAccountSummary() {
    const body = JSON.stringify({
      exportedAt: new Date().toISOString(),
      accountEmail: email || null,
      privateDataSync: 'not_enabled',
      note: 'This preview exports portal-visible account status only; private app data is not included.',
    }, null, 2);
    const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deep-focus-account-summary.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main aria-busy={busy} className="page-shell" id="main-content" tabIndex={-1}>
      <header className="page-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
        {state === 'loading' ? <p className="notice" role="status">{copy.checkingSession}</p> : null}
        {state === 'unavailable' ? <p className="notice" role="status">{copy.unavailable}</p> : null}
        {state === 'error' ? <div className="notice-group"><p className="notice" role="alert">{copy.sessionError}</p><button className="text-button" onClick={() => window.location.reload()} type="button">{copy.retrySession}</button></div> : null}
      </header>
      {state === 'signed_in' ? <section className="content-card account-card">
        <p className="eyebrow">{copy.signedInEyebrow}</p>
        <h2>{email || copy.yourAccount}</h2>
        <p>{copy.signedInDescription}</p>
        <button className="button button-primary" disabled={busy} onClick={() => void signOut()} type="button">{busy ? copy.signingOut : copy.signOut}</button>
        <section aria-labelledby="privacy-controls-title" className="privacy-controls">
          <h3 id="privacy-controls-title">{privacyCopy.title}</h3>
          <p>{privacyCopy.summaryDescription}</p>
          <button className="button button-secondary" disabled={busy} onClick={downloadAccountSummary} type="button">{privacyCopy.downloadSummary}</button>
          <h3>{privacyCopy.deletionTitle}</h3>
          <p>{privacyCopy.deletionDescription}</p>
          <button aria-disabled="true" className="button button-secondary" disabled type="button">{privacyCopy.deletionPending}</button>
        </section>
      </section> : state === 'signed_out' ? <section aria-labelledby="account-form-title" className="content-card account-card">
        <p className="eyebrow">{copy.developmentAccess}</p>
        <h2 id="account-form-title">{authMode === 'reset' ? copy.resetTitle : copy.signInTitle}</h2>
        <p className="account-boundary">{copy.credentialsBoundary}</p>
        <label htmlFor="account-email">{copy.email}</label>
        <input autoComplete="email" id="account-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        {authMode === 'reset' ? null : <><label htmlFor="account-password">{copy.password}</label><input autoComplete={authMode === 'sign_up' ? 'new-password' : 'current-password'} id="account-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} /></>}
        <div className="actions">
          {authMode === 'reset' ? <button className="button button-primary" disabled={busy} onClick={() => void requestReset()} type="button">{busy ? copy.sending : copy.sendReset}</button> : <><button className="button button-primary" disabled={busy} onClick={() => void signIn()} type="button">{copy.signIn}</button><button className="button button-secondary" disabled={busy} onClick={() => void signUp()} type="button">{copy.createAccount}</button><button className="button button-secondary" disabled={busy} onClick={() => void signInWithGoogle()} type="button">{copy.continueGoogle}</button></>}
        </div>
        <div className="account-links"><button className="text-button" disabled={busy} onClick={() => { setAuthMode(authMode === 'reset' ? 'sign_in' : 'reset'); setMessage(''); }} type="button">{authMode === 'reset' ? copy.backToSignIn : copy.forgotPassword}</button></div>
        {message ? <p aria-live="polite" className="account-message" role="status">{message}</p> : null}
      </section> : null}
      <div className="page-sections">
        <section className="content-card"><p className="eyebrow">{copy.dataEyebrow}</p><h2>{copy.syncTitle}</h2><p>{copy.syncDescription}</p></section>
        <section className="content-card"><p className="eyebrow">{copy.safetyEyebrow}</p><h2>{copy.safetyTitle}</h2><p>{copy.safetyDescription}</p></section>
      </div>
    </main>
  );
}
