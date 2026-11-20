import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, inr, fmtDate, today, UPI_RE } from '../../api.js';
import { useSite } from '../../SiteContext.jsx';

const SOURCES = [['upi', 'UPI / QR'], ['cash', 'Cash'], ['bank', 'Bank transfer'], ['cheque', 'Cheque']];

function Status({ s }) {
  if (!s) return null;
  return <div className={`status ${s.kind}`} role="status">{s.text}</div>;
}

function ConfirmDeleteButton({ onConfirm, isMr = false }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <button className="btn small danger" onClick={() => setAsking(true)}>{isMr ? 'काढा' : 'Delete'}</button>;
  return (
    <span style={{ display: 'inline-flex', gap: '.3rem', alignItems: 'center' }}>
      <button className="btn small danger" onClick={() => { setAsking(false); onConfirm(); }}>{isMr ? 'खात्री करा' : 'Confirm Delete'}</button>
      <button className="btn small" onClick={() => setAsking(false)}>{isMr ? 'रद्द' : 'Cancel'}</button>
    </span>
  );
}

// Cancel an entry with a reason. Entries are never deleted, so the ledger keeps an audit trail.
function VoidButton({ onVoid }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  if (!open) return <button className="btn small danger" onClick={() => setOpen(true)}>Cancel entry</button>;
  return (
    <div style={{ display: 'grid', gap: '.35rem', minWidth: '12rem' }}>
      <input placeholder="Reason, e.g. entered twice" value={reason} onChange={(e) => setReason(e.target.value)} style={{ font: 'inherit', padding: '.3rem .5rem', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)' }} />
      <div style={{ display: 'flex', gap: '.35rem' }}>
        <button className="btn small danger" disabled={!reason.trim()} onClick={() => onVoid(reason)}>Confirm</button>
        <button className="btn small" onClick={() => setOpen(false)}>Keep</button>
      </div>
    </div>
  );
}

function Donations({ purposes = [], onChange }) {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const blank = { date: today(), donorName: '', showName: false, phone: '', amount: '', purpose: 'General daan', source: 'upi', ref: '', note: '' };
  const [f, setF] = useState(blank);
  const [list, setList] = useState(null);
  const [showVoided, setShowVoided] = useState(false);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const load = useCallback(() => api(`/admin/donations?limit=100&showVoided=${showVoided}`).then(setList).catch((e) => setStatus({ kind: 'error', text: e.message })), [showVoided]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const d = await api('/admin/donations', { method: 'POST', body: f });
      const msg = isMr
        ? `नोंद झाली: ${inr(d.amount)} — पावती क्र. ${d.receiptNo}.`
        : `Recorded ${inr(d.amount)} — receipt no. ${d.receiptNo}.`;
      setStatus({ kind: 'ok', text: msg });
      setF({ ...blank, date: f.date, source: f.source });
      load(); onChange();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }
  async function voidIt(id, reason) {
    try {
      await api(`/admin/donations/${id}/void`, { method: 'PATCH', body: { reason } });
      setStatus({ kind: 'ok', text: isMr ? 'दान नोंद रद्द करण्यात आली.' : 'Donation entry cancelled.' });
      load(); onChange();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }

  return (
    <div className="prose">
      <form className="panel form" onSubmit={submit}>
        <h3 className="wide">{isMr ? 'प्राप्त दानाची नोंद करा' : 'Record daan received'}</h3>
        <label>{isMr ? 'दिनांक' : 'Date'}<input type="date" id="dDate" required value={f.date} max={today()} onChange={set('date')} /></label>
        <label>{isMr ? 'रक्कम (₹)' : 'Amount (₹)'}<input type="number" id="dAmt" min="1" step="1" required value={f.amount} onChange={set('amount')} /></label>
        <label>{isMr ? 'हेतू' : 'Purpose'}<select id="dPurpose" value={f.purpose} onChange={set('purpose')}>{purposes.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>{isMr ? 'माध्यम' : 'Received by'}<select id="dSource" value={f.source} onChange={set('source')}>{SOURCES.map(([v, l]) => <option key={v} value={v}>{isMr ? (v === 'upi' ? 'UPI / QR' : v === 'cash' ? 'रोख' : v === 'bank' ? 'बँक ट्रान्सफर' : 'धनादेश') : l}</option>)}</select></label>
        <label>{isMr ? 'देणगीदाराचे नाव' : 'Donor name'}<input id="dName" value={f.donorName} onChange={set('donorName')} placeholder={isMr ? 'उदा. पाटील परिवार' : 'e.g. Patil family'} /></label>
        <label>{isMr ? 'फोन (खाजगी)' : 'Phone (private)'}<input id="dPhone" value={f.phone} onChange={set('phone')} inputMode="tel" /></label>
        <label>{isMr ? 'UPI / बँक संदर्भ क्रमांक' : 'UPI / bank reference'}<input id="dRef" value={f.ref} onChange={set('ref')} placeholder={isMr ? 'फक्त शेवटचे ४ अंक दिसतील' : 'Only last 4 are shown'} /></label>
        <label>{isMr ? 'खाजगी नोंद' : 'Private note'}<input id="dNote" value={f.note} onChange={set('note')} /></label>
        <label className="check wide"><input type="checkbox" id="dShow" checked={f.showName} onChange={set('showName')} /> {isMr ? 'देणगीदाराने त्यांचे नाव सार्वजनिक दाखवण्यास संमती दिली आहे' : 'Donor agreed to show their name publicly'}</label>
        <div className="btns wide"><button className="btn primary" type="submit" disabled={busy}>{busy ? (isMr ? 'नोंद होत आहे…' : 'Recording…') : (isMr ? 'दान नोंदवा व पावती जारी करा' : 'Add daan and issue receipt')}</button></div>
      </form>
      <Status s={status} />
      <div className="panel">
        <div className="panel-head">
          <h3>{isMr ? 'अलिकडील दानाच्या नोंदी' : 'Recent daan'}</h3>
          <div className="btns">
            <label className="check small"><input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} /> {isMr ? 'रद्द केलेल्या नोंदी दाखवा' : 'Show cancelled'}</label>
            <a className="btn small" href="/api/admin/export/donations.csv">{isMr ? 'CSV डाउनलोड करा' : 'Download CSV'}</a>
          </div>
        </div>
        <div className="tablebox">
          {!list ? <div className="empty">{isMr ? 'लोड होत आहे…' : 'Loading…'}</div> : !list.items.length ? <div className="empty">{isMr ? 'अद्याप कोणत्याही दानाची नोंद नाही.' : 'No daan recorded yet.'}</div> : (
            <table>
              <thead><tr><th>{isMr ? 'दिनांक' : 'Date'}</th><th>{isMr ? 'पावती क्र.' : 'Receipt'}</th><th>{isMr ? 'देणगीदार' : 'Donor'}</th><th>{isMr ? 'हेतू' : 'Purpose'}</th><th>{isMr ? 'माध्यम' : 'Via'}</th><th className="amt">{isMr ? 'रक्कम' : 'Amount'}</th><th>{isMr ? 'नोंदणीकर्ता' : 'Added by'}</th><th></th></tr></thead>
              <tbody>{list.items.map((d) => (
                <tr key={d._id} className={d.voided ? 'voided' : ''}>
                  <td>{fmtDate(d.date)}</td><td>{d.receiptNo}</td>
                  <td>{d.donorName || <span className="muted">—</span>}{d.donorName && !d.showName && <span className="muted small"> ({isMr ? 'लपवले' : 'hidden'})</span>}</td>
                  <td>{d.purpose}</td><td>{d.source}</td><td className="amt">{inr(d.amount)}</td>
                  <td className="muted small">{d.createdBy?.name || (d.source === 'razorpay' ? (isMr ? 'स्वयंचलित' : 'Automatic') : '—')}</td>
                  <td>{d.voided ? <span className="small muted" title={d.voidReason}>{isMr ? 'रद्द' : 'Cancelled'}</span> : <VoidButton onVoid={(r) => voidIt(d._id, r)} />}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Expenses({ purposes = [], onChange }) {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const blank = { date: today(), item: '', amount: '', purpose: 'Temple upkeep', paidTo: '', billNo: '' };
  const [f, setF] = useState(blank);
  const [list, setList] = useState(null);
  const [showVoided, setShowVoided] = useState(false);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = useCallback(() => api(`/admin/expenses?limit=100&showVoided=${showVoided}`).then(setList).catch((e) => setStatus({ kind: 'error', text: e.message })), [showVoided]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const x = await api('/admin/expenses', { method: 'POST', body: f });
      setStatus({ kind: 'ok', text: isMr ? `${inr(x.amount)} च्या खर्चाची नोंद झाली.` : `Recorded expense of ${inr(x.amount)}.` });
      setF({ ...blank, date: f.date }); load(); onChange();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }
  async function voidIt(id, reason) {
    try { await api(`/admin/expenses/${id}/void`, { method: 'PATCH', body: { reason } }); load(); onChange(); }
    catch (err) { setStatus({ kind: 'error', text: err.message }); }
  }

  return (
    <div className="prose">
      <form className="panel form" onSubmit={submit}>
        <h3 className="wide">{isMr ? 'खर्चाची नोंद करा' : 'Record an expense'}</h3>
        <label className="wide">{isMr ? 'खर्च कशासाठी केला?' : 'What was it for?'}<input id="eItem" required value={f.item} onChange={set('item')} placeholder={isMr ? 'उदा. उत्सव साहित्य व फुले' : 'e.g. Flowers and oil for Kartik utsav'} /></label>
        <label>{isMr ? 'दिनांक' : 'Date'}<input type="date" id="eDate" required value={f.date} max={today()} onChange={set('date')} /></label>
        <label>{isMr ? 'रक्कम (₹)' : 'Amount (₹)'}<input type="number" id="eAmt" min="1" step="1" required value={f.amount} onChange={set('amount')} /></label>
        <label>{isMr ? 'हेतू' : 'Purpose'}<select id="ePurpose" value={f.purpose} onChange={set('purpose')}>{purposes.filter((p) => p !== 'General daan').map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>{isMr ? 'कोणाला दिले' : 'Paid to'}<input id="ePaidTo" value={f.paidTo} onChange={set('paidTo')} placeholder={isMr ? 'दुकान किंवा व्यक्तीचे नाव' : 'Shop or person'} /></label>
        <label>{isMr ? 'बिल / व्हाउचर क्र.' : 'Bill / voucher no.'}<input id="eBill" value={f.billNo} onChange={set('billNo')} /></label>
        <div className="btns wide"><button className="btn primary" type="submit" disabled={busy}>{busy ? (isMr ? 'नोंद होत आहे…' : 'Recording…') : (isMr ? 'खर्च नोंदवा' : 'Add expense')}</button></div>
      </form>
      <Status s={status} />
      <div className="panel">
        <div className="panel-head">
          <h3>{isMr ? 'अलिकडील खर्च' : 'Recent expenses'}</h3>
          <div className="btns">
            <label className="check small"><input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} /> {isMr ? 'रद्द केलेले खर्च दाखवा' : 'Show cancelled'}</label>
            <a className="btn small" href="/api/admin/export/expenses.csv">{isMr ? 'CSV डाउनलोड करा' : 'Download CSV'}</a>
          </div>
        </div>
        <div className="tablebox">
          {!list ? <div className="empty">{isMr ? 'लोड होत आहे…' : 'Loading…'}</div> : !list.items.length ? <div className="empty">{isMr ? 'अद्याप कोणत्याही खर्चाची नोंद नाही.' : 'No expenses recorded yet.'}</div> : (
            <table>
              <thead><tr><th>{isMr ? 'दिनांक' : 'Date'}</th><th>{isMr ? 'तपशील' : 'Expense'}</th><th>{isMr ? 'हेतू' : 'Purpose'}</th><th>{isMr ? 'बिल क्र.' : 'Bill'}</th><th className="amt">{isMr ? 'रक्कम' : 'Amount'}</th><th>{isMr ? 'नोंदणीकर्ता' : 'Added by'}</th><th></th></tr></thead>
              <tbody>{list.items.map((x) => (
                <tr key={x._id} className={x.voided ? 'voided' : ''}>
                  <td>{fmtDate(x.date)}</td><td>{x.item}{x.paidTo && <span className="muted small"> · {x.paidTo}</span>}</td>
                  <td>{x.purpose}</td><td>{x.billNo || '—'}</td><td className="amt">{inr(x.amount)}</td>
                  <td className="muted small">{x.createdBy?.name || '—'}</td>
                  <td>{x.voided ? <span className="small muted" title={x.voidReason}>{isMr ? 'रद्द' : 'Cancelled'}</span> : <VoidButton onVoid={(r) => voidIt(x._id, r)} />}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function RowsEditor({ rows, setRows, fields }) {
  const update = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="rows">
      {rows.map((r, i) => {
        const rowKey = r._id || r.id || r._key || (r._key = `row_${i}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
        return (
          <div className="row-edit" key={rowKey}>
            {fields.map(([k, label]) => (
              <input key={k} aria-label={label} placeholder={label} value={r[k] || ''} onChange={(e) => update(i, k, e.target.value)}
                style={{ font: 'inherit', padding: '.45rem .6rem', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg)', color: 'var(--fg)', minWidth: 0 }} />
            ))}
            <button type="button" className="btn small" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button>
          </div>
        );
      })}
      <div><button type="button" className="btn small" onClick={() => setRows([...rows, {}])}>Add row</button></div>
    </div>
  );
}

function SiteSettings({ onChange }) {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const [s, setS] = useState(null);
  const [status, setStatus] = useState(null);
  useEffect(() => { api('/admin/settings').then(setS).catch((e) => setStatus({ kind: 'error', text: e.message })); }, []);
  if (!s) return <Status s={status} />;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setC = (k) => (e) => setS({ ...s, contact: { ...s.contact, [k]: e.target.value } });

  async function save(e) {
    e.preventDefault();
    if (s.upiId && !UPI_RE.test(s.upiId)) {
      setStatus({ kind: 'error', text: isMr ? 'UPI आयडी templename@bank या स्वरूपात असावा.' : 'UPI ID should look like name@bank, with no spaces.' });
      return;
    }
    try {
      setS(await api('/admin/settings', { method: 'PUT', body: s }));
      setStatus({ kind: 'ok', text: isMr ? 'तपशील साठवले गेले. आता संकेतस्थळावर ही माहिती दिसेल.' : 'Saved. The website now shows these details.' });
      onChange();
    } catch (err) { setStatus({ kind: 'error', text: err.message }); }
  }

  return (
    <form className="prose" onSubmit={save}>
      <div className="panel form">
        <h3 className="wide">{isMr ? 'देणगी तपशील' : 'Donation details'}</h3>
        <label>{isMr ? 'अधिकृत UPI आयडी' : 'Official UPI ID'}<input id="sUpi" value={s.upiId} onChange={set('upiId')} placeholder="templename@bank" /></label>
        <label>{isMr ? 'UPI वरील नाव' : 'Payee name on UPI'}<input id="sPayee" value={s.payeeName} onChange={set('payeeName')} /></label>
        <label>{isMr ? 'विश्वस्त मंडळाचे नाव' : 'Trust name'}<input id="sTrust" value={s.trustName} onChange={set('trustName')} /></label>
        <label>{isMr ? 'नोंदणी क्रमांक' : 'Trust registration no.'}<input id="sReg" value={s.trustRegNo} onChange={set('trustRegNo')} /></label>
        <label className="wide">{isMr ? 'कर सवलत नोंद' : 'Tax note'}<input id="sTax" value={s.taxNote} onChange={set('taxNote')} placeholder={isMr ? 'उदा. ८०जी अंतर्गत देणगी कर सवलतीस पात्र…' : 'e.g. Donations eligible under Section 80G, approval no. …'} /></label>
      </div>
      <div className="panel form">
        <h3 className="wide">{isMr ? 'संपर्क व घोषणा' : 'Contact and announcement'}</h3>
        <label>{isMr ? 'संपर्क व्यक्ती' : 'Contact person'}<input id="sPerson" value={s.contact?.person || ''} onChange={setC('person')} /></label>
        <label>{isMr ? 'फोन / व्हॉट्सॲप' : 'Phone / WhatsApp'}<input id="sPhone" value={s.contact?.phone || ''} onChange={setC('phone')} /></label>
        <label>{isMr ? 'ईमेल' : 'Email'}<input id="sEmail" type="email" value={s.contact?.email || ''} onChange={setC('email')} /></label>
        <label className="wide">{isMr ? 'घोषणा फलक (लपवण्यासाठी रिकामे ठेवा)' : 'Announcement banner (leave empty to hide)'}<input id="sAnn" value={s.announcement} onChange={set('announcement')} placeholder={isMr ? 'उदा. श्री क्षेत्र ब्रह्मदेव यात्रा महोत्सवास सर्व भाविकांचे स्वागत' : 'e.g. Brahmadev Yatra on … — all devotees welcome'} /></label>
      </div>
      <div className="panel">
        <h3>{isMr ? 'दर्शन व आरती वेळा' : 'Darshan and aarti timings'}</h3>
        <RowsEditor rows={s.darshanTimings || []} setRows={(r) => setS({ ...s, darshanTimings: r })} fields={[[ 'seva', isMr ? 'सेवा' : 'Seva'], ['time', isMr ? 'वेळ' : 'Time'], ['details', isMr ? 'तपशील' : 'Details']]} />
      </div>
      <div className="panel">
        <h3>{isMr ? 'उत्सव व सण' : 'Festivals'}</h3>
        <RowsEditor rows={s.festivals || []} setRows={(r) => setS({ ...s, festivals: r })} fields={[['name', isMr ? 'उत्सव' : 'Festival'], ['when', isMr ? 'महिना किंवा दिनांक' : 'Month or date'], ['details', isMr ? 'तपशील' : 'Details']]} />
      </div>
      <Status s={status} />
      <div className="btns"><button className="btn primary" type="submit">{isMr ? 'संकेतस्थळ तपशील साठवा' : 'Save site details'}</button></div>
    </form>
  );
}

function GalleryModeration({ onChange }) {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const [status, setStatus] = useState(null);
  const [mediaTab, setMediaTab] = useState('photos'); // 'photos' | 'videos'
  const [photoItems, setPhotoItems] = useState(null);
  const [videoItems, setVideoItems] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [photoPendingCount, setPhotoPendingCount] = useState(0);
  const [videoPendingCount, setVideoPendingCount] = useState(0);

  const loadPhotos = useCallback(async () => {
    try {
      const data = await api(`/admin/photos?status=${statusFilter === 'all' ? '' : statusFilter}`);
      setPhotoItems(data.items);
      if (data.pendingCount !== undefined) setPhotoPendingCount(data.pendingCount);
    } catch (e) {
      setStatus({ kind: 'error', text: e.message });
    }
  }, [statusFilter]);

  const loadVideos = useCallback(async () => {
    try {
      const data = await api(`/gallery/admin/videos?status=${statusFilter === 'all' ? '' : statusFilter}`);
      setVideoItems(data.items);
      if (data.pendingCount !== undefined) setVideoPendingCount(data.pendingCount);
    } catch (e) {
      setStatus({ kind: 'error', text: e.message });
    }
  }, [statusFilter]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);
  useEffect(() => { loadVideos(); }, [loadVideos]);

  async function approvePhoto(id) {
    try {
      await api(`/admin/photos/${id}/approve`, { method: 'PATCH' });
      setStatus({ kind: 'ok', text: isMr ? 'छायाचित्र मंजूर केले गेले.' : 'Photo approved successfully.' });
      loadPhotos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  async function removePhoto(id) {
    try {
      await api(`/admin/photos/${id}`, { method: 'DELETE' });
      setStatus({ kind: 'ok', text: isMr ? 'छायाचित्र कायमस्वरूपी हटवले.' : 'Photo deleted permanently.' });
      loadPhotos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  async function approveVideo(id) {
    try {
      await api(`/gallery/admin/videos/${id}/approve`, { method: 'PATCH' });
      setStatus({ kind: 'ok', text: isMr ? 'व्हिडिओ मंजूर केला गेला.' : 'Video approved successfully.' });
      loadVideos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  async function removeVideo(id) {
    try {
      await api(`/gallery/admin/videos/${id}`, { method: 'DELETE' });
      setStatus({ kind: 'ok', text: isMr ? 'व्हिडिओ कायमस्वरूपी हटवला.' : 'Video deleted permanently.' });
      loadVideos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  return (
    <div className="prose">
      {/* Media sub-tabs */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className={`btn small${mediaTab === 'photos' ? ' primary' : ''}`}
          onClick={() => setMediaTab('photos')}
        >
          {isMr ? '🖼️ छायाचित्रे' : '🖼️ Photos'} {photoPendingCount > 0 && <span className="gal-count">{photoPendingCount}</span>}
        </button>
        <button
          className={`btn small${mediaTab === 'videos' ? ' primary' : ''}`}
          onClick={() => setMediaTab('videos')}
        >
          {isMr ? '🎬 व्हिडिओ' : '🎬 Videos'} {videoPendingCount > 0 && <span className="gal-count">{videoPendingCount}</span>}
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>{mediaTab === 'photos' ? (isMr ? 'छायाचित्र पडताळणी' : 'Photo Moderation') : (isMr ? 'व्हिडिओ पडताळणी' : 'Video Moderation')}</h3>
          <div className="btns">
            <label className="check small"><input type="radio" name="gf" checked={statusFilter === 'pending'} onChange={() => setStatusFilter('pending')} /> {isMr ? 'प्रलंबित' : 'Pending'}</label>
            <label className="check small"><input type="radio" name="gf" checked={statusFilter === 'approved'} onChange={() => setStatusFilter('approved')} /> {isMr ? 'मंजूर' : 'Approved'}</label>
            <label className="check small"><input type="radio" name="gf" checked={statusFilter === 'all'} onChange={() => setStatusFilter('all')} /> {isMr ? 'सर्व' : 'All'}</label>
          </div>
        </div>
        <Status s={status} />

        {/* PHOTOS TABLE */}
        {mediaTab === 'photos' && (
          <div className="tablebox">
            {!photoItems ? <div className="empty">{isMr ? 'लोड होत आहे…' : 'Loading…'}</div> : !photoItems.length ? <div className="empty">{isMr ? 'या श्रेणीत कोणतीही छायाचित्रे नाहीत.' : 'No photos in this category.'}</div> : (
              <table>
                <thead><tr><th>{isMr ? 'पूर्वावलोकन' : 'Preview'}</th><th>{isMr ? 'अपलोडकर्ता' : 'Uploader'}</th><th>{isMr ? 'प्रसंग' : 'Event'}</th><th>{isMr ? 'वर्णन' : 'Caption'}</th><th>{isMr ? 'दिनांक' : 'Date'}</th><th>{isMr ? 'स्थिती' : 'Status'}</th><th>{isMr ? 'कृती' : 'Actions'}</th></tr></thead>
                <tbody>{photoItems.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.imageUrl} alt={p.caption || `Uploaded by ${p.uploaderName}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} /></td>
                    <td>{p.uploaderName}{p.uploaderPhone && <span className="muted small"> · {p.uploaderPhone}</span>}</td>
                    <td>{p.event}</td>
                    <td className="small muted" style={{ maxWidth: 200 }}>{p.caption || '—'}</td>
                    <td>{fmtDate(p.createdAt)}</td>
                    <td>{p.approved ? <span className="chip approved">{isMr ? 'मंजूर' : 'Approved'}</span> : <span className="chip pending">{isMr ? 'प्रलंबित' : 'Pending'}</span>}</td>
                    <td style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
                      {!p.approved && <button className="btn small" onClick={() => approvePhoto(p._id)}>{isMr ? 'मंजूर करा' : 'Approve'}</button>}
                      <ConfirmDeleteButton onConfirm={() => removePhoto(p._id)} isMr={isMr} />
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        )}

        {/* VIDEOS TABLE */}
        {mediaTab === 'videos' && (
          <div className="tablebox">
            {!videoItems ? <div className="empty">{isMr ? 'लोड होत आहे…' : 'Loading…'}</div> : !videoItems.length ? <div className="empty">{isMr ? 'या श्रेणीत कोणतेही व्हिडिओ नाहीत.' : 'No videos in this category.'}</div> : (
              <table>
                <thead><tr><th>{isMr ? 'पूर्वावलोकन' : 'Preview'}</th><th>{isMr ? 'अपलोडकर्ता' : 'Uploader'}</th><th>{isMr ? 'प्रसंग' : 'Event'}</th><th>{isMr ? 'वर्णन' : 'Caption'}</th><th>{isMr ? 'दिनांक' : 'Date'}</th><th>{isMr ? 'स्थिती' : 'Status'}</th><th>{isMr ? 'कृती' : 'Actions'}</th></tr></thead>
                <tbody>{videoItems.map((v) => (
                  <tr key={v._id}>
                    <td>
                      {v.thumbnailUrl
                        ? <img src={v.thumbnailUrl} alt="video thumbnail" style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                        : <video src={v.videoUrl} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} muted playsInline />
                      }
                    </td>
                    <td>{v.uploaderName}{v.uploaderPhone && <span className="muted small"> · {v.uploaderPhone}</span>}</td>
                    <td>{v.event}</td>
                    <td className="small muted" style={{ maxWidth: 200 }}>{v.caption || '—'}</td>
                    <td>{fmtDate(v.createdAt)}</td>
                    <td>{v.approved ? <span className="chip approved">{isMr ? 'मंजूर' : 'Approved'}</span> : <span className="chip pending">{isMr ? 'प्रलंबित' : 'Pending'}</span>}</td>
                    <td style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
                      {!v.approved && <button className="btn small" onClick={() => approveVideo(v._id)}>{isMr ? 'मंजूर करा' : 'Approve'}</button>}
                      <ConfirmDeleteButton onConfirm={() => removeVideo(v._id)} isMr={isMr} />
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HeroSliderManager() {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const [slides, setSlides] = useState(null);
  const [status, setStatus] = useState(null);

  // Add Slide Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFile, setAddFile] = useState(null);
  const [addPreview, setAddPreview] = useState(null);
  const [addForm, setAddForm] = useState({ alt: '', title: '', caption: '' });
  const [busy, setBusy] = useState(false);

  // Edit Slide Modal state
  const [editModalSlide, setEditModalSlide] = useState(null);
  const [replaceFile, setReplaceFile] = useState(null);
  const [replacePreview, setReplacePreview] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  // Full Banner Preview Modal state
  const [previewData, setPreviewData] = useState(null);

  const load = useCallback(async () => {
    try {
      const s = await api('/admin/settings');
      setSlides(s.heroSlides || []);
    } catch (e) {
      setStatus({ kind: 'error', text: e.message });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Keyboard navigation & modal closure (ESC closes top-most modal, arrows flip preview)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (previewData) {
          setPreviewData(null);
        } else if (editModalSlide) {
          handleCloseEdit();
        } else if (showAddModal) {
          handleCloseAdd();
        }
      } else if (previewData && !previewData.isUpload && slides && slides.length > 1) {
        if (e.key === 'ArrowLeft') {
          setPreviewData((prev) => {
            if (!prev) return null;
            const nextIdx = (prev.index - 1 + slides.length) % slides.length;
            return { slide: slides[nextIdx], index: nextIdx, total: slides.length, isUpload: false };
          });
        } else if (e.key === 'ArrowRight') {
          setPreviewData((prev) => {
            if (!prev) return null;
            const nextIdx = (prev.index + 1) % slides.length;
            return { slide: slides[nextIdx], index: nextIdx, total: slides.length, isUpload: false };
          });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewData, editModalSlide, showAddModal, slides]);

  // Clean-up object URLs on unmount
  useEffect(() => {
    return () => {
      if (addPreview) URL.revokeObjectURL(addPreview);
      if (replacePreview) URL.revokeObjectURL(replacePreview);
    };
  }, [addPreview, replacePreview]);

  // --- Add Modal Handlers ---
  function handleOpenAdd() {
    clearAddFile();
    setAddForm({ alt: '', title: '', caption: '' });
    setShowAddModal(true);
  }

  function handleCloseAdd() {
    clearAddFile();
    setShowAddModal(false);
  }

  function clearAddFile() {
    if (addPreview) URL.revokeObjectURL(addPreview);
    setAddFile(null);
    setAddPreview(null);
  }

  function onAddFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setStatus({
        kind: 'error',
        text: isMr
          ? 'फाइलचा आकार १० MB पेक्षा जास्त आहे. कृपया १० MB पेक्षा लहान फाइल निवडा.'
          : 'File size exceeds 10 MB limit. Please select a file smaller than 10 MB.',
      });
      return;
    }
    if (addPreview) URL.revokeObjectURL(addPreview);
    setAddFile(f);
    setAddPreview(URL.createObjectURL(f));
  }

  function openAddModalPreview() {
    if (!addPreview) return;
    setPreviewData({
      slide: {
        imageUrl: addPreview,
        title: addForm.title,
        caption: addForm.caption,
        alt: addForm.alt,
      },
      index: 0,
      total: 1,
      isUpload: true,
    });
  }

  async function handleUploadSlide(e) {
    e.preventDefault();
    if (!addFile) {
      setStatus({
        kind: 'error',
        text: isMr ? 'कृपया आधी प्रतिमा निवडा.' : 'Please select an image file first.',
      });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.append('image', addFile);
      fd.append('alt', addForm.alt);
      fd.append('title', addForm.title);
      fd.append('caption', addForm.caption);
      const res = await api('/admin/slider/upload', { method: 'POST', body: fd, timeout: 180000 });
      setSlides(res.slides || []);
      setStatus({
        kind: 'ok',
        text: isMr ? 'स्लायडर प्रतिमा यशस्वीरित्या जोडली गेली!' : 'Slider image added successfully!',
      });
      handleCloseAdd();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  // --- Edit Modal Handlers ---
  function handleOpenEdit(idx) {
    if (!slides || !slides[idx]) return;
    const s = slides[idx];
    clearReplaceFile();
    setEditModalSlide({
      index: idx,
      title: s.title || '',
      alt: s.alt || '',
      caption: s.caption || '',
      imageUrl: s.imageUrl || '',
      publicId: s.publicId || '',
    });
  }

  function handleCloseEdit() {
    clearReplaceFile();
    setEditModalSlide(null);
  }

  function clearReplaceFile() {
    if (replacePreview) URL.revokeObjectURL(replacePreview);
    setReplaceFile(null);
    setReplacePreview(null);
  }

  function onReplaceFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setStatus({
        kind: 'error',
        text: isMr
          ? 'फाइलचा आकार १० MB पेक्षा जास्त आहे. कृपया १० MB पेक्षा लहान फाइल निवडा.'
          : 'File size exceeds 10 MB limit. Please select a file smaller than 10 MB.',
      });
      return;
    }
    if (replacePreview) URL.revokeObjectURL(replacePreview);
    setReplaceFile(f);
    setReplacePreview(URL.createObjectURL(f));
  }

  function openEditModalPreview() {
    if (!editModalSlide) return;
    setPreviewData({
      slide: {
        imageUrl: replacePreview || editModalSlide.imageUrl,
        title: editModalSlide.title,
        caption: editModalSlide.caption,
        alt: editModalSlide.alt,
      },
      index: editModalSlide.index,
      total: slides ? slides.length : 1,
      isUpload: false,
    });
  }

  async function handleSaveEdit() {
    if (!editModalSlide || !slides) return;
    const idx = editModalSlide.index;
    setEditBusy(true);
    setStatus(null);
    try {
      if (replaceFile) {
        // Upload new image and replace current slide
        const fd = new FormData();
        fd.append('image', replaceFile);
        fd.append('title', editModalSlide.title || '');
        fd.append('alt', editModalSlide.alt || '');
        fd.append('caption', editModalSlide.caption || '');
        const res = await api(`/admin/slider/${idx}`, { method: 'PUT', body: fd, timeout: 180000 });
        setSlides(res.slides || []);
        setStatus({
          kind: 'ok',
          text: isMr
            ? 'स्लायडर तपशील व प्रतिमा यशस्वीरित्या अद्यतनित केले गेले!'
            : 'Slide details and image updated successfully!',
        });
      } else {
        // Only text metadata was updated
        const updatedSlides = slides.map((s, i) =>
          i === idx
            ? { ...s, title: editModalSlide.title, alt: editModalSlide.alt, caption: editModalSlide.caption }
            : s
        );
        const res = await api('/admin/slider/reorder', { method: 'PUT', body: { slides: updatedSlides } });
        setSlides(res.slides || []);
        setStatus({
          kind: 'ok',
          text: isMr ? 'स्लायडर तपशील यशस्वीरित्या अद्यतनित केले गेले.' : 'Slide details updated successfully.',
        });
      }
      handleCloseEdit();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setEditBusy(false);
    }
  }

  // --- List Actions ---
  function openSlidePreview(idx) {
    if (!slides || !slides[idx]) return;
    setPreviewData({
      slide: slides[idx],
      index: idx,
      total: slides.length,
      isUpload: false,
    });
  }

  async function deleteSlide(idx) {
    try {
      const res = await api(`/admin/slider/${idx}`, { method: 'DELETE' });
      setSlides(res.slides || []);
      setStatus({
        kind: 'ok',
        text: isMr ? 'स्लायडर प्रतिमा काढली गेली.' : 'Slide deleted successfully.',
      });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }

  async function moveSlide(idx, dir) {
    if (!slides) return;
    const newSlides = [...slides];
    const target = idx + dir;
    if (target < 0 || target >= newSlides.length) return;
    [newSlides[idx], newSlides[target]] = [newSlides[target], newSlides[idx]];
    setSlides(newSlides);
    try {
      const res = await api('/admin/slider/reorder', { method: 'PUT', body: { slides: newSlides } });
      setSlides(res.slides || []);
      setStatus({
        kind: 'ok',
        text: isMr ? 'क्रम यशस्वीरित्या बदलला.' : 'Slide order updated.',
      });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }

  async function restoreDefaults() {
    if (!window.confirm(isMr ? 'मूळ देवस्थान बॅनर परत आणायचे का?' : 'Restore default temple banners?')) return;
    try {
      const defaultSlides = [
        {
          imageUrl: '/banners/banner2.png',
          publicId: '',
          alt: 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी - श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम',
          title: 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी',
          caption: 'श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम • कल्लाळी',
          order: 0,
        },
        {
          imageUrl: '/banners/banner1.png',
          publicId: '',
          alt: 'श्री क्षेत्र ब्रह्मदेव देवस्थान, कल्लाळी - भव्य प्रवेशद्वार व मंदिर परिसर',
          title: 'श्री क्षेत्र ब्रह्मदेव देवस्थान',
          caption: 'भव्य प्रवेशद्वार, दीपमाळ व मंदिर परिसर',
          order: 1,
        },
      ];
      const res = await api('/admin/slider/reorder', { method: 'PUT', body: { slides: defaultSlides } });
      setSlides(res.slides || []);
      setStatus({ kind: 'ok', text: isMr ? 'मूळ बॅनर पुनर्संचयित केले गेले.' : 'Default temple banners restored successfully.' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%' }}>
      <Status s={status} />

      {/* Current Slides List Panel - Prominently Displayed First */}
      <div className="panel" style={{ padding: '1.75rem', display: 'grid', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span>🖼️</span> {isMr ? 'सध्याच्या स्लायडर प्रतिमा' : 'Current Slider Images'}
              </h3>
              {slides && (
                <span className="chip approved" style={{ fontSize: '.78rem' }}>
                  {slides.length} {slides.length === 1 ? (isMr ? 'प्रतिमा सक्रिय' : 'slide active') : (isMr ? 'प्रतिमा सक्रिय' : 'slides active')}
                </span>
              )}
            </div>
            <p className="muted small" style={{ margin: '.35rem 0 0' }}>
              {isMr
                ? 'मुख्यपृष्ठावरील फिरणाऱ्या बॅनर प्रतिमा व्यवस्थापित करा. क्रम बदलण्यासाठी वर-खाली बाण वापरा.'
                : 'Manage hero carousel banners. Use up/down arrows to change banner display order.'}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn primary"
              onClick={handleOpenAdd}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.55rem 1.1rem' }}
            >
              <span>➕</span> {isMr ? 'नवीन स्लायडर जोडा' : 'Add New Slide'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={restoreDefaults}
              title={isMr ? 'मूळ मंदिर बॅनर लोड करा' : 'Load default temple banners'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.55rem .9rem' }}
            >
              <span>🔄</span> {isMr ? 'मूळ बॅनर आणा' : 'Load Defaults'}
            </button>
          </div>
        </div>

        {!slides ? (
          <div className="empty" style={{ padding: '2.5rem' }}>{isMr ? 'डेटा लोड होत आहे…' : 'Loading slides…'}</div>
        ) : slides.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              border: '1.5px dashed var(--line)',
              borderRadius: 14,
              background: 'var(--band)',
            }}
          >
            <div style={{ fontSize: '2.8rem', marginBottom: '.6rem' }}>🕉️</div>
            <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--heading)' }}>
              {isMr ? 'कोणतीही कस्टम प्रतिमा जोडलेली नाही' : 'No custom slides added yet'}
            </h4>
            <p className="muted small" style={{ maxWidth: '48ch', margin: '.5rem auto 1.25rem' }}>
              {isMr
                ? 'सध्या मुख्यपृष्ठावर देवस्थानचे मूळ बॅनर दिसत आहेत. नवीन स्लायडर जोडण्यासाठी वरील बटणावर क्लिक करा.'
                : 'The homepage is currently displaying default temple banners. Click the button above to add a new slide.'}
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={handleOpenAdd}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}
            >
              <span>➕</span> {isMr ? 'नवीन स्लायडर जोडा' : 'Add New Slide'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {slides.map((slide, idx) => (
              <div
                key={slide.imageUrl + idx}
                className="slider-item-card"
              >
                {/* Thumbnail Preview (Click to preview full banner) */}
                <div
                  className="slider-thumb-wrap"
                  onClick={() => openSlidePreview(idx)}
                  title={isMr ? 'पूर्वावलोकन पाहण्यासाठी क्लिक करा' : 'Click to preview slide banner'}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.alt || `Slide ${idx + 1}`}
                    loading="lazy"
                  />
                  <div className="slider-order-badge">
                    #{idx + 1}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '4px 6px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,.85))',
                      color: '#FAF5EB',
                      fontSize: '.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>👁️</span> {isMr ? 'पूर्वावलोकन' : 'Preview'}
                  </div>
                </div>

                {/* Content Details */}
                <div style={{ minWidth: 0, display: 'grid', gap: '.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--heading)' }}>
                      {slide.title || (isMr ? `स्लायडर क्रमांक ${idx + 1}` : `Slide #${idx + 1}`)}
                    </strong>
                  </div>
                  {slide.caption ? (
                    <p style={{ margin: 0, fontSize: '.92rem', color: 'var(--fg)', lineHeight: 1.45 }}>
                      {slide.caption}
                    </p>
                  ) : (
                    <span className="muted small">{isMr ? 'वर्णन जोडलेले नाही' : 'No caption provided'}</span>
                  )}
                  {slide.alt && (
                    <div style={{ marginTop: '.2rem' }}>
                      <span className="chip" style={{ fontSize: '.72rem' }}>
                        Alt: {slide.alt}
                      </span>
                    </div>
                  )}
                </div>

                {/* Responsive Actions */}
                <div className="slider-actions-row">
                  <div style={{ display: 'flex', gap: '.3rem', width: '100%' }}>
                    <button
                      className="btn small"
                      title={isMr ? 'वर हलवा' : 'Move up'}
                      onClick={() => moveSlide(idx, -1)}
                      disabled={idx === 0}
                      style={{ padding: '.35rem .6rem', fontWeight: 800, flex: 1 }}
                    >
                      ↑
                    </button>
                    <button
                      className="btn small"
                      title={isMr ? 'खाली हलवा' : 'Move down'}
                      onClick={() => moveSlide(idx, 1)}
                      disabled={idx === slides.length - 1}
                      style={{ padding: '.35rem .6rem', fontWeight: 800, flex: 1 }}
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    className="btn small"
                    onClick={() => openSlidePreview(idx)}
                    title={isMr ? 'पूर्वावलोकन' : 'Preview'}
                  >
                    👁️ {isMr ? 'पूर्वावलोकन' : 'Preview'}
                  </button>
                  <button
                    className="btn small"
                    onClick={() => handleOpenEdit(idx)}
                    title={isMr ? 'संपादन' : 'Edit'}
                  >
                    ✏️ {isMr ? 'संपादित करा' : 'Edit'}
                  </button>
                  <ConfirmDeleteButton onConfirm={() => deleteSlide(idx)} isMr={isMr} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EDIT SLIDE POP-UP MODAL PAGE                                          */}
      {/* ========================================================================= */}
      {editModalSlide && (
        <div
          role="dialog"
          aria-modal="true"
          className="slider-modal-backdrop"
          onClick={handleCloseEdit}
        >
          <div
            className="slider-modal-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="slider-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✏️</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--gold-bright)' }}>
                  {isMr
                    ? `स्लायडर संपादन (क्रमांक ${editModalSlide.index + 1})`
                    : `Edit Slide (#${editModalSlide.index + 1})`}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                title={isMr ? 'बंद करा (Esc)' : 'Close (Esc)'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FAF5EB',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="slider-modal-body">
              {/* Image Preview & Change Controls */}
              <div style={{ display: 'grid', gap: '.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--heading)' }}>
                    🖼️ {isMr ? 'स्लायडर प्रतिमा' : 'Slide Image'}
                  </span>
                  <span className="muted small">
                    {replaceFile
                      ? (isMr ? '🟢 नवीन प्रतिमा निवडली' : '🟢 New image selected')
                      : (isMr ? 'सध्याची सक्रिय प्रतिमा' : 'Current active banner')}
                  </span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#120504',
                    border: replaceFile ? '2px solid var(--good)' : '2px solid var(--gold)',
                    aspectRatio: '16 / 9',
                    maxHeight: '260px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={replacePreview || editModalSlide.imageUrl}
                    alt={editModalSlide.alt || 'Slide image'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Top-Right Action Floating Bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      gap: '.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      className="btn small"
                      onClick={openEditModalPreview}
                      style={{
                        background: 'rgba(0,0,0,.75)',
                        color: 'var(--gold-bright)',
                        border: '1px solid var(--gold)',
                        cursor: 'pointer',
                      }}
                    >
                      👁️ {isMr ? 'पूर्वावलोकन' : 'Preview'}
                    </button>
                    <label
                      className="btn small"
                      style={{
                        background: 'rgba(0,0,0,.75)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,.4)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '.35rem',
                      }}
                    >
                      <span>📷</span> {isMr ? 'प्रतिमा बदला' : 'Change Image'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={onReplaceFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {replaceFile && (
                      <button
                        type="button"
                        className="btn small danger"
                        onClick={clearReplaceFile}
                        style={{ background: 'rgba(192,57,43,.85)', color: '#fff' }}
                      >
                        ✕ {isMr ? 'रद्द करा' : 'Remove'}
                      </button>
                    )}
                  </div>

                  {/* Bottom info banner */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '.45rem .85rem',
                      background: 'linear-gradient(transparent, rgba(0,0,0,.85))',
                      color: '#fff',
                      fontSize: '.82rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {replaceFile
                        ? `📄 ${replaceFile.name} (${(replaceFile.size / (1024 * 1024)).toFixed(2)} MB)`
                        : (isMr ? 'कमाल आकार: १० MB • शिफारस गुणोत्तर: ३:१ किंवा १६:९' : 'Max size: 10 MB • Recommended: 3:1 or 16:9')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Responsive Inputs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <label style={{ display: 'grid', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--fg)' }}>
                  <span>{isMr ? 'शीर्षक (पर्यायी)' : 'Slide Title (Optional)'}</span>
                  <input
                    value={editModalSlide.title}
                    onChange={e => setEditModalSlide({ ...editModalSlide, title: e.target.value })}
                    placeholder={isMr ? 'उदा. श्री क्षेत्र ब्रह्मदेव देवस्थान' : 'e.g. Shri Kshetra Brahmadev Devasthan'}
                    style={{
                      font: 'inherit',
                      padding: '.6rem .75rem',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--fg)' }}>
                  <span>{isMr ? 'Alt मजकूर (स्क्रीन रीडर व शोध साधनांसाठी)' : 'Alt Text (For accessibility & SEO)'}</span>
                  <input
                    value={editModalSlide.alt}
                    onChange={e => setEditModalSlide({ ...editModalSlide, alt: e.target.value })}
                    placeholder={isMr ? 'उदा. मंदिराचे मुख्य प्रवेशद्वार व परिसर' : 'e.g. Temple main entrance and premises'}
                    style={{
                      font: 'inherit',
                      padding: '.6rem .75rem',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                    }}
                  />
                </label>
              </div>

              {/* Caption */}
              <label style={{ display: 'grid', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--fg)' }}>
                <span>{isMr ? 'वर्णन / उपशीर्षक (पर्यायी)' : 'Caption / Subtitle (Optional)'}</span>
                <input
                  value={editModalSlide.caption}
                  onChange={e => setEditModalSlide({ ...editModalSlide, caption: e.target.value })}
                  placeholder={isMr ? 'उदा. श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम • कल्लाळी' : 'e.g. Sacred Abode of Faith, Devotion & Culture • Kallali'}
                  style={{
                    font: 'inherit',
                    padding: '.6rem .75rem',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                  }}
                />
              </label>
            </div>

            {/* Footer */}
            <div className="slider-modal-footer">
              <button
                type="button"
                className="btn small"
                onClick={openEditModalPreview}
                style={{ border: '1px solid var(--gold)', color: 'var(--fg)' }}
              >
                👁️ {isMr ? 'पूर्वावलोकन' : 'Preview'}
              </button>
              <button
                type="button"
                className="btn small"
                onClick={handleCloseEdit}
                disabled={editBusy}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn small primary"
                onClick={handleSaveEdit}
                disabled={editBusy}
                style={{ minWidth: '130px' }}
              >
                {editBusy
                  ? (isMr ? '⏳ साठवत आहे…' : '⏳ Saving…')
                  : (isMr ? '💾 बदल साठवा' : '💾 Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD NEW SLIDE POP-UP MODAL PAGE                                       */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="slider-modal-backdrop"
          onClick={handleCloseAdd}
        >
          <div
            className="slider-modal-card"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="slider-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🖼️</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--gold-bright)' }}>
                  {isMr ? 'नवीन स्लायडर प्रतिमा जोडा' : 'Add New Slider Image'}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleCloseAdd}
                title={isMr ? 'बंद करा (Esc)' : 'Close (Esc)'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FAF5EB',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSlide} style={{ margin: 0, display: 'contents' }}>
              {/* Body */}
              <div className="slider-modal-body">
                {/* File Picker / Preview Box */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '.92rem', marginBottom: '.5rem', color: 'var(--fg)' }}>
                    {isMr ? 'प्रतिमा निवडा' : 'Select Banner Image'} <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>

                  {!addPreview ? (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '.6rem',
                        padding: '2rem 1.5rem',
                        border: '2px dashed var(--gold)',
                        borderRadius: '12px',
                        background: 'var(--band)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'background .2s',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={onAddFileChange}
                        style={{ display: 'none' }}
                      />
                      <span style={{ fontSize: '2.4rem' }}>📁</span>
                      <div>
                        <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--heading)' }}>
                          {isMr ? 'येथे क्लिक करून प्रतिमा निवडा' : 'Click here to choose an image'}
                        </strong>
                        <span className="muted small" style={{ display: 'block', marginTop: '.25rem' }}>
                          {isMr
                            ? 'JPEG, PNG किंवा WebP • कमाल आकार: १० MB • शिफारस गुणोत्तर: ३:१ किंवा १६:९'
                            : 'JPEG, PNG, or WebP • Max size: 10 MB • Recommended ratio: 3:1 or 16:9'}
                        </span>
                      </div>
                    </label>
                  ) : (
                    <div
                      style={{
                        position: 'relative',
                        border: '2px solid var(--gold)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#1a0805',
                        aspectRatio: '16 / 9',
                        maxHeight: '260px',
                      }}
                    >
                      <img
                        src={addPreview}
                        alt="Selected Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          display: 'flex',
                          gap: '.5rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          className="btn small"
                          onClick={openAddModalPreview}
                          style={{
                            background: 'rgba(0,0,0,.75)',
                            color: 'var(--gold-bright)',
                            border: '1px solid var(--gold)',
                            cursor: 'pointer',
                          }}
                        >
                          👁️ {isMr ? 'पूर्वावलोकन' : 'Preview'}
                        </button>
                        <label
                          className="btn small"
                          style={{
                            background: 'rgba(0,0,0,.75)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,.4)',
                            cursor: 'pointer',
                          }}
                        >
                          {isMr ? 'बदला' : 'Change'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={onAddFileChange}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <button
                          type="button"
                          className="btn small danger"
                          onClick={clearAddFile}
                          style={{ background: 'rgba(192,57,43,.85)', color: '#fff' }}
                        >
                          {isMr ? 'काढा' : 'Remove'}
                        </button>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '.5rem 1rem',
                          background: 'linear-gradient(transparent, rgba(0,0,0,.8))',
                          color: '#fff',
                          fontSize: '.85rem',
                        }}
                      >
                        📄 {addFile?.name} ({(addFile?.size / (1024 * 1024)).toFixed(2)} MB)
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields: Title and Alt Text (2 columns) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <label style={{ display: 'grid', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--fg)' }}>
                    <span>{isMr ? 'शीर्षक (पर्यायी)' : 'Slide Title (Optional)'}</span>
                    <input
                      value={addForm.title}
                      onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                      placeholder={isMr ? 'उदा. श्री क्षेत्र ब्रह्मदेव देवस्थान' : 'e.g. Shri Kshetra Brahmadev Devasthan'}
                      style={{
                        font: 'inherit',
                        padding: '.55rem .75rem',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        background: 'var(--bg)',
                        color: 'var(--fg)',
                      }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--fg)' }}>
                    <span>{isMr ? 'Alt मजकूर (स्क्रीन रीडर व शोध साधनांसाठी)' : 'Alt Text (For accessibility & SEO)'}</span>
                    <input
                      value={addForm.alt}
                      onChange={e => setAddForm({ ...addForm, alt: e.target.value })}
                      placeholder={isMr ? 'उदा. मंदिराचे मुख्य प्रवेशद्वार व परिसर' : 'e.g. Temple main entrance and premises'}
                      style={{
                        font: 'inherit',
                        padding: '.55rem .75rem',
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        background: 'var(--bg)',
                        color: 'var(--fg)',
                      }}
                    />
                  </label>
                </div>

                {/* Caption (Full width) */}
                <label style={{ display: 'grid', gap: '.4rem', fontSize: '.9rem', fontWeight: 600, color: 'var(--fg)' }}>
                  <span>{isMr ? 'वर्णन / उपशीर्षक (पर्यायी)' : 'Caption / Subtitle (Optional)'}</span>
                  <input
                    value={addForm.caption}
                    onChange={e => setAddForm({ ...addForm, caption: e.target.value })}
                    placeholder={isMr ? 'उदा. श्रद्धा, भक्ती, सेवा व संस्कृतीचा पवित्र संगम • कल्लाळी' : 'e.g. Sacred Abode of Faith, Devotion & Culture • Kallali'}
                    style={{
                      font: 'inherit',
                      padding: '.55rem .75rem',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                    }}
                  />
                </label>
              </div>

              {/* Footer */}
              <div className="slider-modal-footer">
                {addFile && (
                  <button
                    type="button"
                    className="btn small"
                    onClick={openAddModalPreview}
                    style={{ border: '1px solid var(--gold)', color: 'var(--fg)' }}
                  >
                    👁️ {isMr ? 'पूर्वावलोकन' : 'Preview'}
                  </button>
                )}
                <button
                  type="button"
                  className="btn small"
                  onClick={handleCloseAdd}
                  disabled={busy}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  className="btn small primary"
                  type="submit"
                  disabled={busy || !addFile}
                  style={{ minWidth: '140px' }}
                >
                  {busy
                    ? (isMr ? '⏳ अपलोड होत आहे…' : '⏳ Uploading…')
                    : (isMr ? '📤 स्लायडरमध्ये जोडा' : '📤 Upload to Slider')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FULL BANNER LIVE PREVIEW MODAL DIALOG                                 */}
      {/* ========================================================================= */}
      {previewData && (
        <div
          role="dialog"
          aria-modal="true"
          className="slider-modal-backdrop"
          onClick={() => setPreviewData(null)}
        >
          <div
            className="slider-modal-card"
            style={{ maxWidth: '960px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="slider-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.3rem' }}>👁️</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--gold-bright)' }}>
                  {isMr ? 'स्लायडर बॅनर पूर्वावलोकन' : 'Slider Banner Preview'}
                </strong>
                <span
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid var(--gold)',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '.75rem',
                    fontWeight: 700,
                    color: '#FAF5EB',
                  }}
                >
                  {previewData.isUpload
                    ? (isMr ? 'नवीन स्लायडर मसुदा' : 'New Slide Draft')
                    : (isMr ? `प्रतिमा #${previewData.index + 1} / ${previewData.total}` : `Slide #${previewData.index + 1} of ${previewData.total}`)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPreviewData(null)}
                title={isMr ? 'बंद करा (Esc)' : 'Close (Esc)'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FAF5EB',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Main Banner Visual (Simulating homepage hero slider) */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '21 / 9',
                minHeight: '220px',
                maxHeight: '440px',
                background: '#120504',
                overflow: 'hidden',
              }}
            >
              <img
                src={previewData.slide.imageUrl}
                alt={previewData.slide.alt || 'Banner preview'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />

              {/* Live Title & Caption Overlay (matches homepage styling) */}
              {(previewData.slide.title || previewData.slide.caption) && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '2.5rem 1.5rem 1.25rem',
                    background: 'linear-gradient(to top, rgba(10,3,2,0.92) 0%, rgba(10,3,2,0.65) 60%, transparent 100%)',
                    color: '#FAF5EB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '.35rem',
                  }}
                >
                  {previewData.slide.title && (
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 'clamp(1.1rem, 2.4vw, 1.65rem)',
                        color: 'var(--gold-bright)',
                        fontFamily: 'var(--display)',
                        fontWeight: 600,
                        textShadow: '0 2px 10px rgba(0,0,0,0.85)',
                      }}
                    >
                      {previewData.slide.title}
                    </h3>
                  )}
                  {previewData.slide.caption && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 'clamp(.85rem, 1.6vw, 1rem)',
                        color: '#FAF5EB',
                        opacity: 0.95,
                        maxWidth: '75ch',
                        lineHeight: 1.45,
                        textShadow: '0 1px 8px rgba(0,0,0,0.8)',
                      }}
                    >
                      {previewData.slide.caption}
                    </p>
                  )}
                </div>
              )}

              {/* Navigation Arrows (if multiple slides and not draft upload) */}
              {!previewData.isUpload && slides && slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (previewData.index - 1 + slides.length) % slides.length;
                      setPreviewData({ slide: slides[nextIdx], index: nextIdx, total: slides.length, isUpload: false });
                    }}
                    title={isMr ? 'मागील प्रतिमा (←)' : 'Previous slide (←)'}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(20,8,5,0.7)',
                      backdropFilter: 'blur(4px)',
                      border: '1.5px solid var(--gold)',
                      color: 'var(--gold-bright)',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      lineHeight: 1,
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (previewData.index + 1) % slides.length;
                      setPreviewData({ slide: slides[nextIdx], index: nextIdx, total: slides.length, isUpload: false });
                    }}
                    title={isMr ? 'पुढील प्रतिमा (→)' : 'Next slide (→)'}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '12px',
                      transform: 'translateY(-50%)',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(20,8,5,0.7)',
                      backdropFilter: 'blur(4px)',
                      border: '1.5px solid var(--gold)',
                      color: 'var(--gold-bright)',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      lineHeight: 1,
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer / Info strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '.75rem',
                padding: '.85rem 1.25rem',
                background: 'var(--band)',
                borderTop: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexWrap: 'wrap', fontSize: '.84rem', color: 'var(--muted)' }}>
                {previewData.slide.alt ? (
                  <span>🏷️ <strong>Alt:</strong> {previewData.slide.alt}</span>
                ) : (
                  <span>ℹ️ <em>{isMr ? 'Alt मजकूर दिलेला नाही' : 'No alt text provided'}</em></span>
                )}
                <span style={{ opacity: 0.5 }}>•</span>
                <span>{isMr ? 'मुख्यपृष्ठावर हे बॅनर असे प्रदर्शित होईल' : 'This is how the banner appears on homepage'}</span>
              </div>

              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                {previewData.slide.imageUrl && !previewData.slide.imageUrl.startsWith('blob:') && (
                  <a
                    href={previewData.slide.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn small"
                    style={{ fontSize: '.82rem' }}
                  >
                    🔗 {isMr ? 'मूळ प्रतिमा उघडा' : 'Open Full Image'}
                  </a>
                )}
                <button
                  type="button"
                  className="btn small primary"
                  onClick={() => setPreviewData(null)}
                >
                  {isMr ? 'बंद करा' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Account() {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState(null);
  async function submit(e) {
    e.preventDefault();
    try {
      await api('/auth/change-password', { method: 'POST', body: f });
      setStatus({ kind: 'ok', text: isMr ? 'पासवर्ड यशस्वीरित्या बदलला.' : 'Password changed.' });
      setF({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }
  return (
    <form className="panel form" onSubmit={submit} style={{ maxWidth: 560 }}>
      <h3 className="wide">{isMr ? 'पासवर्ड बदला' : 'Change password'}</h3>
      <label>{isMr ? 'सध्याचा पासवर्ड' : 'Current password'}<input type="password" id="pCur" autoComplete="current-password" required value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></label>
      <label>{isMr ? 'नवीन पासवर्ड (१०+ अक्षरे)' : 'New password (10+ characters)'}<input type="password" id="pNew" autoComplete="new-password" minLength={10} required value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></label>
      <div className="btns wide"><button className="btn primary" type="submit">{isMr ? 'पासवर्ड बदला' : 'Change password'}</button></div>
      <div className="wide"><Status s={status} /></div>
    </form>
  );
}

function Enquiries() {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  const [list, setList] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [status, setStatus] = useState(null);

  const load = useCallback(() => {
    const q = statusFilter ? `?status=${statusFilter}` : '';
    api(`/admin/enquiries${q}`)
      .then(setList)
      .catch((e) => setStatus({ kind: 'error', text: e.message }));
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id, newStatus) {
    try {
      await api(`/admin/enquiries/${id}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      load();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }

  return (
    <div className="panel" style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3>{isMr ? 'चौकशी व संदेश' : 'Enquiries & Messages'}</h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--fg)', font: 'inherit' }}
        >
          <option value="">{isMr ? 'सर्व स्थिती' : 'All statuses'}</option>
          <option value="pending">{isMr ? 'प्रलंबित' : 'Pending'}</option>
          <option value="responded">{isMr ? 'उत्तर दिले' : 'Responded'}</option>
          <option value="archived">{isMr ? 'संग्रहित' : 'Archived'}</option>
        </select>
      </div>

      <Status s={status} />

      {!list ? (
        <p className="muted">{isMr ? 'चौकशी संदेश लोड होत आहेत…' : 'Loading enquiries…'}</p>
      ) : list.items?.length === 0 ? (
        <p className="muted">{isMr ? 'कोणतेही संदेश आढळले नाहीत.' : 'No enquiries found.'}</p>
      ) : (
        <div className="tablebox">
          <table className="info">
            <thead>
              <tr>
                <th>{isMr ? 'दिनांक' : 'Date'}</th>
                <th>{isMr ? 'नाव' : 'Name'}</th>
                <th>{isMr ? 'संपर्क' : 'Contact'}</th>
                <th>{isMr ? 'प्रकार' : 'Type'}</th>
                <th>{isMr ? 'संदेश' : 'Message'}</th>
                <th>{isMr ? 'स्थिती' : 'Status'}</th>
                <th>{isMr ? 'कृती' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((enq) => (
                <tr key={enq._id}>
                  <td className="small">{fmtDate(enq.createdAt)}</td>
                  <td><strong>{enq.name}</strong></td>
                  <td className="small">
                    <div><a href={`tel:${enq.phone}`}>{enq.phone}</a></div>
                    {enq.email && <div><a href={`mailto:${enq.email}`}>{enq.email}</a></div>}
                  </td>
                  <td><span className="chip">{enq.type}</span></td>
                  <td style={{ maxWidth: 300, whiteSpace: 'pre-wrap' }} className="small">{enq.message}</td>
                  <td>
                    <span className={`chip ${enq.status === 'responded' ? 'approved' : enq.status === 'pending' ? 'pending' : ''}`}>
                      {isMr ? (enq.status === 'responded' ? 'उत्तर दिले' : enq.status === 'pending' ? 'प्रलंबित' : enq.status) : enq.status}
                    </span>
                  </td>
                  <td>
                    {enq.status === 'pending' && (
                      <button className="btn small" onClick={() => updateStatus(enq._id, 'responded')}>
                        {isMr ? 'उत्तर दिले' : 'Mark Responded'}
                      </button>
                    )}
                    {enq.status === 'responded' && (
                      <button className="btn small" onClick={() => updateStatus(enq._id, 'archived')}>
                        {isMr ? 'संग्रहित करा' : 'Archive'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { settings, summary, refresh, lang } = useSite();
  const isMr = lang === 'mr';
  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState('donations');

  useEffect(() => {
    api('/auth/me').then((r) => setAdmin(r.admin)).catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    navigate('/');
  }

  if (!admin) {
    return (
      <section className="sec page-top">
        <div className="wrap">
          <p className="muted">{isMr ? 'साइन-इन तपासत आहे…' : 'Checking sign-in…'}</p>
        </div>
      </section>
    );
  }

  const purposes = settings?.purposes || ['General daan'];
  const tabs = [
    ['donations', isMr ? 'प्राप्त दान' : 'Daan received'],
    ['expenses', isMr ? 'खर्च' : 'Expenses'],
    ['gallery', isMr ? 'दालन' : 'Gallery'],
    ['enquiries', isMr ? 'चौकशी व संदेश' : 'Enquiries'],
    ['slider', isMr ? 'मुख्य स्लायडर' : 'Home Slider'],
    ['settings', isMr ? 'संकेतस्थळ तपशील' : 'Site details'],
    ['account', isMr ? 'खाते' : 'Account']
  ];

  return (
    <section className="sec page-top">
      <div className="wrap">
        <div className="panel-head">
          <div className="head">
            <span className="eyebrow">{isMr ? 'विश्वस्त प्रशासन' : 'Trust admin'}</span>
            <h2>{isMr ? `नमस्कार, ${admin.name}` : `Namaskar, ${admin.name}`}</h2>
          </div>
          <button className="btn small" onClick={logout}>
            {isMr ? 'बाहेर पडा' : 'Sign out'}
          </button>
        </div>
        <div className="ledger-top">
          <div className="tile in">
            <span>{isMr ? 'प्राप्त दान' : 'Received'}</span>
            <strong>{summary?.received ? inr(summary.received.total) : '—'}</strong>
            <em>{summary?.received?.count ?? 0} {isMr ? 'देणग्या' : 'offerings'}</em>
          </div>
          <div className="tile out">
            <span>{isMr ? 'झालेला खर्च' : 'Spent'}</span>
            <strong>{summary?.spent ? inr(summary.spent.total) : '—'}</strong>
            <em>{summary?.spent?.count ?? 0} {isMr ? 'खर्च नोंदी' : 'expenses'}</em>
          </div>
          <div className="tile bal">
            <span>{isMr ? 'शिल्लक' : 'Balance'}</span>
            <strong>{summary?.balance !== undefined ? inr(summary.balance) : '—'}</strong>
            <em>{isMr ? 'विश्वस्त मंडळाच्या बँक खात्याशी जुळले पाहिजे' : "Should match the trust's bank balance"}</em>
          </div>
        </div>
        <div className="tabs" role="tablist" style={{ justifySelf: 'start' }}>
          {tabs.map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'donations' && <Donations purposes={purposes} onChange={refresh} />}
        {tab === 'expenses' && <Expenses purposes={purposes} onChange={refresh} />}
        {tab === 'gallery' && <GalleryModeration onChange={refresh} />}
        {tab === 'enquiries' && <Enquiries />}
        {tab === 'slider' && <HeroSliderManager />}
        {tab === 'settings' && <SiteSettings onChange={refresh} />}
        {tab === 'account' && <Account />}
      </div>
    </section>
  );
}
