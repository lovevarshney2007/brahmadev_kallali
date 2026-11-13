import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/login', { method: 'POST', body: { email, password } });
      navigate('/admin');
    } catch (err) {
      const msg = err.message || 'Email or password is incorrect.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sec page-top">
      <div className="wrap">
        <form className="panel login" onSubmit={submit}>
          <div className="head">
            <span className="eyebrow">Trust admin</span>
            <h2>Sign in</h2>
            <p>
              For trustees and office staff who record daan, expenses and moderate photos.
            </p>
          </div>

          <label className="field">
            Email
            <input
              type="email"
              id="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brahmadev.org"
            />
          </label>

          <label className="field">
            Password
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="status error" role="alert">{error}</div>}

          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  );
}
