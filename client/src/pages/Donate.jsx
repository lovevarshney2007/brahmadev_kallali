import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const { settings, refresh, lang, t } = useSite();
  const [amount, setAmount] = useState(501);
  const [custom, setCustom] = useState('');
  const [purpose, setPurpose] = useState('General daan');
  const [donorName, setDonorName] = useState('');
  const [showName, setShowName] = useState(false);
  const [pay, setPay] = useState({ enabled: false });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMr = lang === 'mr';

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
      const errMsg = isMr ? 'कृपया रक्कम निवडा किंवा टाका.' : 'Please choose or enter an amount.';
      setStatus({ kind: 'error', text: errMsg });
      return;
    }
    setBusy(true); setStatus(null);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error(isMr ? 'पेमेंट विंडो उघडता आली नाही. इंटरनेट तपासा.' : 'Could not load the payment window. Check your internet connection and try again.');
      const order = await api('/payments/order', { method: 'POST', body: { amount: finalAmount, purpose, donorName, showName } });
      const rzp = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: isMr ? 'श्री क्षेत्र ब्रह्मदेव देवस्थान' : 'Shri Kshetra Brahmadev Devasthan',
        description: `${isMr ? 'दान' : 'Daan'} · ${purpose}`,
        notes: order.notes,
        prefill: { name: donorName },
        theme: { color: '#D35400' },
        handler: async (resp) => {
          try {
            const r = await api('/payments/verify', { method: 'POST', body: resp });
            const msg = r.receiptNo
              ? (isMr ? `धन्यवाद. आपले ${inr(r.amount)} चे दान प्राप्त झाले. पावती क्र. ${r.receiptNo}.` : `Thank you. Your daan of ${inr(r.amount)} is received. Receipt no. ${r.receiptNo}.`)
              : r.message;
            setStatus({ kind: 'ok', text: msg });
            refresh();
          } catch (e) {
            setStatus({ kind: 'error', text: e.message });
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on('payment.failed', (r) => {
        const msg = `${isMr ? 'पेमेंट अयशस्वी झाले' : 'Payment failed'}: ${r.error?.description || (isMr ? 'कृपया पुन्हा प्रयत्न करा.' : 'please try again.')}`;
        setStatus({ kind: 'error', text: msg });
      });
      rzp.open();
    } catch (e) {
      setStatus({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(upi);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <section className="sec daan page-top" id="donate">
      <div className="wrap">
        <SectionHead 
          eyebrow={isMr ? "दान आणि सेवा" : "Daan and seva"} 
          title={t.donatePage.title}
        >
          <p>{t.donatePage.subtitle} {isMr ? 'प्रत्येक देणगी सार्वजनिक' : 'Every offering appears in the public'} <Link to="/ledger">{t.nav.ledger}</Link>{isMr ? ' मध्ये नोंदवली जाते.' : ', along with how the trust spends it.'}</p>
        </SectionHead>

        <div className="give">
          <div className="qr-card">
            <h3>{isMr ? "दानाचा पर्याय निवडा" : "Choose your daan"}</h3>
            <div className="amounts" role="group" aria-label={t.donatePage.chooseAmount}>
              {PRESETS.map((a) => (
                <button type="button" key={a} aria-pressed={!custom && amount === a} onClick={() => { setAmount(a); setCustom(''); }}>{inr(a)}</button>
              ))}
              <label className="sr-only" htmlFor="customAmt">{t.donatePage.otherAmount}</label>
              <input id="customAmt" type="number" min="1" placeholder={isMr ? "इतर ₹" : "Other ₹"} value={custom} onChange={(e) => setCustom(e.target.value)} />
            </div>
            <div className="qr-frame">
              {upiUri ? <QRCodeSVG value={upiUri} size={216} level="M" marginSize={0} /> : (isMr ? 'अधिकृत UPI ID जोडल्यानंतर ट्रस्टचा QR कोड येथे दिसेल.' : 'The trust’s official QR code will appear here once its UPI ID is added.')}
            </div>
            <div className="upi-line">
              {upiUri ? (
                <>UPI ID: <strong>{upi}</strong><button className="copy" type="button" onClick={copyUpi}>{copied ? (isMr ? 'कॉपी झाले' : 'Copied') : (isMr ? 'कॉपी करा' : 'Copy')}</button>{finalAmount > 0 && <> · {inr(finalAmount)}</>}</>
              ) : <span className="tbc" style={{ color: 'var(--gold-bright)', borderColor: 'var(--gold-bright)' }}>{isMr ? 'UPI ID लवकरच जोडले जाईल' : 'UPI ID to be confirmed'}</span>}
            </div>
            {upiUri && <a className="btn light small" href={upiUri}>{isMr ? 'UPI ॲपमध्ये उघडा' : 'Open in UPI app (on phone)'}</a>}
            <small>{isMr ? 'QR कोडने दान दिल्यानंतर, पावतीसाठी आणि हिशोबात नाव नोंदवण्यासाठी कृपया नाव व रक्कम मंदिर कार्यालयाला कळवावी.' : 'After paying by QR, please send your name, amount and UPI reference to the temple office so your receipt can be issued and your daan added to the ledger.'}</small>
          </div>

          <div className="prose">
            <div className="panel">
              <h3>{isMr ? "आपला तपशील" : "Your details"}</h3>
              <div className="form">
                <label>{t.donatePage.purposeLabel}
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                    {(settings?.purposes || ['General daan']).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </label>
                <label>{t.donatePage.donorName}<input value={donorName} placeholder={t.donatePage.namePlaceholder} maxLength={120} onChange={(e) => setDonorName(e.target.value)} /></label>
                <label className="check wide"><input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} /> {t.donatePage.showNamePublic}</label>
              </div>
              {pay.enabled ? (
                <div className="btns"><button className="btn primary" type="button" disabled={busy} onClick={payOnline}>{busy ? (isMr ? 'उघडत आहे…' : 'Opening…') : `${finalAmount > 0 ? inr(finalAmount) : ''} ${isMr ? 'ऑनलाइन दान करा' : 'Pay online'}`}</button></div>
              ) : (
                <p className="small muted">{isMr ? 'ऑनलाइन पेमेंट लवकरच सुरू होईल. कृपया वरील QR कोडचा वापर करा.' : 'Online payment is not switched on yet. Please use the QR code.'}</p>
              )}
              {pay.enabled && <p className="small muted">{isMr ? 'ऑनलाइन दान आपोआप हिशोब वहीत नोंदवले जाते आणि तात्काळ पावती मिळते.' : 'Online payments are recorded in the ledger automatically, with an instant receipt number.'}</p>}
              {status && <div className={`status ${status.kind}`} role="status">{status.text}</div>}
            </div>

            <div className="how">
              <div><strong>{isMr ? 'रक्कम निवडा' : 'Choose and pay'}</strong>{isMr ? 'रक्कम निवडून QR कोड किंवा ऑनलाइन पेमेंटने दान द्या.' : 'Pick an amount and pay by QR or online.'}</div>
              <div><strong>{isMr ? 'पावती मिळवा' : 'Get a receipt'}</strong>{isMr ? 'ऑनलाइन दानाची पावती तात्काळ मिळते. QR दानासाठी संदर्भ क्रमांक कार्यालयाशी शेअर करा.' : 'Online payments get one instantly. For QR payments, share your UPI reference with the office.'}</div>
              <div><strong>{isMr ? 'नोंद पहा' : 'See it recorded'}</strong>{isMr ? 'आपले दान सार्वजनिक हिशोब वहीत पारदर्शकपणे दिसते.' : 'Your daan appears in the public ledger.'}</div>
              <div><strong>{isMr ? 'खर्च पहा' : 'See it used'}</strong>{isMr ? 'मंदिराच्या प्रत्येक सेवेचा खर्च हेतूसह उपलब्ध आहे.' : 'Every expense paid from daan is listed with its purpose.'}</div>
            </div>

            <div className="note">
              <strong>{isMr ? 'केवळ या पृष्ठावरील अधिकृत QR कोड आणि UPI द्वारेच दान द्या.' : 'Donate only through the official QR code and UPI ID on this page.'}</strong>{' '}
              {settings?.trustName || settings?.trustRegNo || settings?.taxNote
                ? <>{[settings.trustName, settings.trustRegNo && `Reg. no. ${settings.trustRegNo}`, settings.taxNote].filter(Boolean).join(' · ')}</>
                : <>{isMr ? 'ट्रस्ट नोंदणी आणि अधिकृत तपशील लवकरच प्रसिद्ध केले जातील.' : 'Trust registration and tax benefit details will be published once verified.'} <Tbc /></>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
