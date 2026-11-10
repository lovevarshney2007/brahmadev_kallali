import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';

export default function AdminLogin() {
  const [isSetup, setIsSetup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      if (isSetup) {
        const res = await api('/auth/setup-initial-admin', {
          method: 'POST',
          body: { name: name || 'Trustee', email, password },
        });
        setSuccess(res.message || 'Admin account created successfully!');
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        await api('/auth/login', { method: 'POST', body: { email, password } });
        navigate('/admin');
      }
    } catch (err) {
      if (err.message && err.message.includes('No admin accounts exist')) {
        setIsSetup(true);
      }
      setError(err.message || 'Operation failed');
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
            <h2>{isSetup ? 'Create Initial Admin' : 'Sign in'}</h2>
            <p>
              {isSetup
                ? 'Create the first trustee admin account to manage the temple portal.'
                : 'For trustees and office staff who record daan, expenses and moderate photos.'}
            </p>
          </div>

          {isSetup && (
            <label className="field">
              Your Name
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Temple Trustee"
              />
            </label>
          )}

          <label className="field">
            Email
            <input
              type="email"
              id="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@brahmadev.org"
            />
          </label>

          <label className="field">
            Password {isSetup && <span className="small muted">(min 10 characters)</span>}
            <input
              type="password"
              id="password"
              autoComplete={isSetup ? 'new-password' : 'current-password'}
              required
              minLength={isSetup ? 10 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="status error" role="alert">{error}</div>}
          {success && <div className="status ok" role="status">{success}</div>}

          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? (isSetup ? 'Creating account…' : 'Signing in…') : (isSetup ? 'Create Admin Account' : 'Sign in')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '.5rem' }}>
            <button
              type="button"
              className="btn small"
              style={{ border: 'none', background: 'none', textDecoration: 'underline', color: 'var(--muted)', cursor: 'pointer' }}
              onClick={() => { setIsSetup(!isSetup); setError(''); }}
            >
              {isSetup ? 'Already have an account? Sign in' : 'First time setup? Create first admin account'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
