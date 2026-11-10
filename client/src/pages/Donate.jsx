import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { useSite } from '../SiteContext.jsx';
import { api, inr, UPI_RE } from '../api.js';
import { SectionHead, Tbc } from '../components/Decor.jsx';

const PRESETS = [101, 251, 501, 1101, 2101];

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Donate() {
  const { settings, refresh } = useSite();
  const [amount, setAmount] = useState(501);
  const [custom, setCustom] = useState('');
  const [purpose, setPurpose] = useState('General daan');
  const [donorName, setDonorName] = useState('');
  const [showName, setShowName] = useState(false);
  const [pay, setPay] = useState({ enabled: false });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { api('/payments/config').then(setPay).catch(() => {}); }, []);

  const finalAmount = custom ? Math.round(Number(custom)) : amount;
  const upi = settings?.upiId;
  const upiUri = useMemo(() => {
    if (!upi || !UPI_RE.test(upi)) return null;
    const p = new URLSearchParams({ pa: upi, pn: settings.payeeName || 'Shri Brahmadev Devasthan', cu: 'INR', tn: `Daan - ${purpose}` });
    if (finalAmount > 0) p.set('am', finalAmount.toFixed(2));
    return `upi://pay?${p.toString()}`;
  }, [upi, settings, finalAmount, purpose]);

  async function payOnline() {
    if (!(finalAmount >= 1)) {
      toast.error('Please choose or enter an amount.');
      setStatus({ kind: 'error', text: 'Please choose or enter an amount.' });
      return;
    }
    setBusy(true); setStatus(null);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Could not load the payment window. Check your internet connection and try again.');
      const order = await api('/payments/order', { method: 'POST', body: { amount: finalAmount, purpose, donorName, showName } });
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Shri Kshetra Brahmadev Devasthan',
        description: `Daan · ${purpose}`,
        notes: order.notes,
        prefill: { name: donorName },
        theme: { color: '#D9670B' },
        handler: async (resp) => {
          try {
            const r = await api('/payments/verify', { method: 'POST', body: resp });
            const msg = r.receiptNo
              ? `Thank you. Your daan of ${inr(r.amount)} is received. Receipt no. ${r.receiptNo}.`
              : r.message;
            toast.success(msg);
            setStatus({ kind: 'ok', text: msg });
            refresh();
          } catch (e) {
            toast.error(e.message);
            setStatus({ kind: 'error', text: e.message });
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on('payment.failed', (r) => {
        const msg = `Payment failed: ${r.error?.description || 'please try again.'}`;
        toast.error(msg);
        setStatus({ kind: 'error', text: msg });
      });
      rzp.open();
    } catch (e) {
      toast.error(e.message);
      setStatus({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upi);
      setCopied(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="sec daan page-top" id="donate">
      <div className="wrap">
        <SectionHead eyebrow="Daan and seva" title="Offer your daan">
          <p>Give through any UPI app by scanning the QR code{pay.enabled ? ', or pay online by UPI, card or net banking' : ''}. Every offering appears in the public <Link to="/ledger">Daan Ledger</Link>, along with how the trust spends it.</p>
        </SectionHead>

        <div className="give">
          <div className="qr-card">
            <h3>Choose your daan</h3>
            <div className="amounts" role="group" aria-label="Choose an amount">
              {PRESETS.map((a) => (
                <button type="button" key={a} aria-pressed={!custom && amount === a} onClick={() => { setAmount(a); setCustom(''); }}>{inr(a)}</button>
              ))}
              <label className="sr-only" htmlFor="customAmt">Other amount in rupees</label>
              <input id="customAmt" type="number" min="1" placeholder="Other ₹" value={custom} onChange={(e) => setCustom(e.target.value)} />
            </div>
            <div className="qr-frame">
              {upiUri ? <QRCodeSVG value={upiUri} size={216} level="M" marginSize={0} /> : 'The trust’s official QR code will appear here once its UPI ID is added.'}
            </div>
            <div className="upi-line">
              {upiUri ? (
                <>UPI ID: <strong>{upi}</strong><button className="copy" type="button" onClick={copyUpi}>{copied ? 'Copied' : 'Copy'}</button>{finalAmount > 0 && <> · {inr(finalAmount)}</>}</>
              ) : <span className="tbc" style={{ color: 'var(--gold-bright)', borderColor: 'var(--gold-bright)' }}>UPI ID to be confirmed</span>}
            </div>
            {upiUri && <a className="btn light small" href={upiUri}>Open in UPI app (on phone)</a>}
            <small>After paying by QR, please send your name, amount and UPI reference to the temple office so your receipt can be issued and your daan added to the ledger.</small>
          </div>

          <div className="prose">
            <div className="panel">
              <h3>Your details</h3>
              <div className="form">
                <label>Purpose
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    {(settings?.purposes || ['General daan']).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label>Your name (optional)<input value={donorName} maxLength={120} onChange={(e) => setDonorName(e.target.value)} /></label>
                <label className="check wide"><input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} /> Show my name in the public ledger</label>
              </div>
              {pay.enabled ? (
                <div className="btns"><button className="btn primary" type="button" disabled={busy} onClick={payOnline}>{busy ? 'Opening…' : `Pay ${finalAmount > 0 ? inr(finalAmount) : ''} online`}</button></div>
              ) : (
                <p className="small muted">Online payment is not switched on yet. Please use the QR code.</p>
              )}
              {pay.enabled && <p className="small muted">Online payments are recorded in the ledger automatically, with an instant receipt number.</p>}
              {status && <div className={`status ${status.kind}`} role="status">{status.text}</div>}
            </div>

            <div className="how">
              <div><strong>Choose and pay</strong>Pick an amount and pay by QR or online.</div>
              <div><strong>Get a receipt</strong>Online payments get one instantly. For QR payments, share your UPI reference with the office.</div>
              <div><strong>See it recorded</strong>Your daan appears in the public ledger.</div>
              <div><strong>See it used</strong>Every expense paid from daan is listed with its purpose.</div>
            </div>

            <div className="note">
              <strong>Donate only through the official QR code and UPI ID on this page.</strong>{' '}
              {settings?.trustName || settings?.trustRegNo || settings?.taxNote
                ? <>{[settings.trustName, settings.trustRegNo && `Reg. no. ${settings.trustRegNo}`, settings.taxNote].filter(Boolean).join(' · ')}</>
                : <>Trust registration and tax benefit details will be published once verified. <Tbc /></>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
