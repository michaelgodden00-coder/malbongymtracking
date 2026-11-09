import { useState } from 'react';
import { api } from '../api.js';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const action = mode === 'login' ? api.login : api.register;
      await action({ name, email, password });
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div style={{ fontSize: 48, marginBottom: 12 }}>⛳</div>
        <h1>The Fairway Club</h1>
        <p>Your private strength tracker. Log workouts, track progression,<br />and compete with friends.</p>

        <form className="login-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Name
              <input autoComplete="name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
            </label>
          )}
          <label>
            Email
            <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === 'register' ? 8 : undefined} />
          </label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? 'New to the club?' : 'Already have an account?'}{' '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </div>

        <div className="login-divider"><span>or</span></div>
        <a className="google-btn" href="/auth/google">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Continue with Google
        </a>

        <p className="login-privacy">Your data is private. Only you can see your workouts unless you choose to follow friends.</p>
      </div>
    </div>
  );
}
