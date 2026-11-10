// Small robust fetch wrapper with AbortController timeout & credentials
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function api(path, { method = 'GET', body, timeout = 15000 } = {}) {
  const url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const isFormData = body instanceof FormData;
    const res = await fetch(url, {
      method,
      credentials: 'include',
      headers: isFormData ? undefined : (body ? { 'Content-Type': 'application/json' } : undefined),
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });

    let data = null;
    try { data = await res.json(); } catch { /* empty body */ }

    if (!res.ok) {
      const err = new Error(data?.error || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Connection timed out. Please check your network.');
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    if (!navigator.onLine) {
      const offlineErr = new Error('You seem to be offline. Please check your internet connection.');
      offlineErr.status = 0;
      throw offlineErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
export const UPI_RE = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.]{1,63}$/;
