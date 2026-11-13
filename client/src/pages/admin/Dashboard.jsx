import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, inr, fmtDate, today, UPI_RE } from '../../api.js';
import { useSite } from '../../SiteContext.jsx';

const SOURCES = [['upi', 'UPI / QR'], ['cash', 'Cash'], ['bank', 'Bank transfer'], ['cheque', 'Cheque']];

function Status({ s }) {
  if (!s) return null;
  return <div className={`status ${s.kind}`} role="status">{s.text}</div>;
}

function ConfirmDeleteButton({ onConfirm }) {
  const [asking, setAsking] = useState(false);
  if (!asking) return <button className="btn small danger" onClick={() => setAsking(true)}>Delete</button>;
  return (
    <span style={{ display: 'inline-flex', gap: '.3rem', alignItems: 'center' }}>
      <button className="btn small danger" onClick={() => { setAsking(false); onConfirm(); }}>Confirm Delete</button>
      <button className="btn small" onClick={() => setAsking(false)}>Cancel</button>
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

function Donations({ purposes, onChange }) {
  const blank = { date: today(), donorName: '', showName: false, phone: '', amount: '', purpose: 'General daan', source: 'upi', ref: '', note: '' };
  const [f, setF] = useState(blank);
  const [list, setList] = useState(null);
  const [showVoided, setShowVoided] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const load = useCallback(() => api(`/admin/donations?limit=100&showVoided=${showVoided}`).then(setList).catch((e) => setStatus({ kind: 'error', text: e.message })), [showVoided]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    try {
      const d = await api('/admin/donations', { method: 'POST', body: f });
      const msg = `Recorded ${inr(d.amount)} — receipt no. ${d.receiptNo}.`;
      setStatus({ kind: 'ok', text: msg });
      setF({ ...blank, date: f.date, source: f.source });
      load(); onChange();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }
  async function voidIt(id, reason) {
    try {
      await api(`/admin/donations/${id}/void`, { method: 'PATCH', body: { reason } });
      setStatus({ kind: 'ok', text: 'Donation entry cancelled.' });
      load(); onChange();
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    }
  }

  return (
    <div className="prose">
      <form className="panel form" onSubmit={submit}>
        <h3 className="wide">Record daan received</h3>
        <label>Date<input type="date" id="dDate" required value={f.date} max={today()} onChange={set('date')} /></label>
        <label>Amount (₹)<input type="number" id="dAmt" min="1" step="1" required value={f.amount} onChange={set('amount')} /></label>
        <label>Purpose<select id="dPurpose" value={f.purpose} onChange={set('purpose')}>{purposes.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>Received by<select id="dSource" value={f.source} onChange={set('source')}>{SOURCES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label>Donor name<input id="dName" value={f.donorName} onChange={set('donorName')} placeholder="e.g. Patil family" /></label>
        <label>Phone (private)<input id="dPhone" value={f.phone} onChange={set('phone')} inputMode="tel" /></label>
        <label>UPI / bank reference<input id="dRef" value={f.ref} onChange={set('ref')} placeholder="Only last 4 are shown" /></label>
        <label>Private note<input id="dNote" value={f.note} onChange={set('note')} /></label>
        <label className="check wide"><input type="checkbox" id="dShow" checked={f.showName} onChange={set('showName')} /> Donor agreed to show their name publicly</label>
        <div className="btns wide"><button className="btn primary" type="submit">Add daan and issue receipt</button></div>
      </form>
      <Status s={status} />
      <div className="panel">
        <div className="panel-head">
          <h3>Recent daan</h3>
          <div className="btns">
            <label className="check small"><input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} /> Show cancelled</label>
            <a className="btn small" href="/api/admin/export/donations.csv">Download CSV</a>
          </div>
        </div>
        <div className="tablebox">
          {!list ? <div className="empty">Loading…</div> : !list.items.length ? <div className="empty">No daan recorded yet.</div> : (
            <table>
              <thead><tr><th>Date</th><th>Receipt</th><th>Donor</th><th>Purpose</th><th>Via</th><th className="amt">Amount</th><th>Added by</th><th></th></tr></thead>
              <tbody>{list.items.map((d) => (
                <tr key={d._id} className={d.voided ? 'voided' : ''}>
                  <td>{fmtDate(d.date)}</td><td>{d.receiptNo}</td>
                  <td>{d.donorName || <span className="muted">—</span>}{d.donorName && !d.showName && <span className="muted small"> (hidden)</span>}</td>
                  <td>{d.purpose}</td><td>{d.source}</td><td className="amt">{inr(d.amount)}</td>
                  <td className="muted small">{d.createdBy?.name || (d.source === 'razorpay' ? 'Automatic' : '—')}</td>
                  <td>{d.voided ? <span className="small muted" title={d.voidReason}>Cancelled</span> : <VoidButton onVoid={(r) => voidIt(d._id, r)} />}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Expenses({ purposes, onChange }) {
  const blank = { date: today(), item: '', amount: '', purpose: 'Temple upkeep', paidTo: '', billNo: '' };
  const [f, setF] = useState(blank);
  const [list, setList] = useState(null);
  const [showVoided, setShowVoided] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = useCallback(() => api(`/admin/expenses?limit=100&showVoided=${showVoided}`).then(setList).catch((e) => setStatus({ kind: 'error', text: e.message })), [showVoided]);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    try {
      const x = await api('/admin/expenses', { method: 'POST', body: f });
      setStatus({ kind: 'ok', text: `Recorded expense of ${inr(x.amount)}.` });
      setF({ ...blank, date: f.date }); load(); onChange();
    } catch (err) { setStatus({ kind: 'error', text: err.message }); }
  }
  async function voidIt(id, reason) {
    try { await api(`/admin/expenses/${id}/void`, { method: 'PATCH', body: { reason } }); load(); onChange(); }
    catch (err) { setStatus({ kind: 'error', text: err.message }); }
  }

  return (
    <div className="prose">
      <form className="panel form" onSubmit={submit}>
        <h3 className="wide">Record an expense</h3>
        <label className="wide">What was it for?<input id="eItem" required value={f.item} onChange={set('item')} placeholder="e.g. Flowers and oil for Kartik utsav" /></label>
        <label>Date<input type="date" id="eDate" required value={f.date} max={today()} onChange={set('date')} /></label>
        <label>Amount (₹)<input type="number" id="eAmt" min="1" step="1" required value={f.amount} onChange={set('amount')} /></label>
        <label>Purpose<select id="ePurpose" value={f.purpose} onChange={set('purpose')}>{purposes.filter((p) => p !== 'General daan').map((p) => <option key={p}>{p}</option>)}</select></label>
        <label>Paid to<input id="ePaidTo" value={f.paidTo} onChange={set('paidTo')} placeholder="Shop or person" /></label>
        <label>Bill / voucher no.<input id="eBill" value={f.billNo} onChange={set('billNo')} /></label>
        <div className="btns wide"><button className="btn primary" type="submit">Add expense</button></div>
      </form>
      <Status s={status} />
      <div className="panel">
        <div className="panel-head">
          <h3>Recent expenses</h3>
          <div className="btns">
            <label className="check small"><input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} /> Show cancelled</label>
            <a className="btn small" href="/api/admin/export/expenses.csv">Download CSV</a>
          </div>
        </div>
        <div className="tablebox">
          {!list ? <div className="empty">Loading…</div> : !list.items.length ? <div className="empty">No expenses recorded yet.</div> : (
            <table>
              <thead><tr><th>Date</th><th>Expense</th><th>Purpose</th><th>Bill</th><th className="amt">Amount</th><th>Added by</th><th></th></tr></thead>
              <tbody>{list.items.map((x) => (
                <tr key={x._id} className={x.voided ? 'voided' : ''}>
                  <td>{fmtDate(x.date)}</td><td>{x.item}{x.paidTo && <span className="muted small"> · {x.paidTo}</span>}</td>
                  <td>{x.purpose}</td><td>{x.billNo || '—'}</td><td className="amt">{inr(x.amount)}</td>
                  <td className="muted small">{x.createdBy?.name || '—'}</td>
                  <td>{x.voided ? <span className="small muted" title={x.voidReason}>Cancelled</span> : <VoidButton onVoid={(r) => voidIt(x._id, r)} />}</td>
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
      {rows.map((r, i) => (
        <div className="row-edit" key={i}>
          {fields.map(([k, label]) => (
            <input key={k} aria-label={label} placeholder={label} value={r[k] || ''} onChange={(e) => update(i, k, e.target.value)}
              style={{ font: 'inherit', padding: '.45rem .6rem', border: '1px solid var(--line)', borderRadius: 8, background: 'var(--bg)', color: 'var(--fg)', minWidth: 0 }} />
          ))}
          <button type="button" className="btn small" onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <div><button type="button" className="btn small" onClick={() => setRows([...rows, {}])}>Add row</button></div>
    </div>
  );
}

function SiteSettings({ onChange }) {
  const [s, setS] = useState(null);
  const [status, setStatus] = useState(null);
  useEffect(() => { api('/admin/settings').then(setS).catch((e) => setStatus({ kind: 'error', text: e.message })); }, []);
  if (!s) return <Status s={status} />;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const setC = (k) => (e) => setS({ ...s, contact: { ...s.contact, [k]: e.target.value } });

  async function save(e) {
    e.preventDefault();
    if (s.upiId && !UPI_RE.test(s.upiId)) { setStatus({ kind: 'error', text: 'UPI ID should look like name@bank, with no spaces.' }); return; }
    try {
      setS(await api('/admin/settings', { method: 'PUT', body: s }));
      setStatus({ kind: 'ok', text: 'Saved. The website now shows these details.' });
      onChange();
    } catch (err) { setStatus({ kind: 'error', text: err.message }); }
  }

  return (
    <form className="prose" onSubmit={save}>
      <div className="panel form">
        <h3 className="wide">Donation details</h3>
        <label>Official UPI ID<input id="sUpi" value={s.upiId} onChange={set('upiId')} placeholder="templename@bank" /></label>
        <label>Payee name on UPI<input id="sPayee" value={s.payeeName} onChange={set('payeeName')} /></label>
        <label>Trust name<input id="sTrust" value={s.trustName} onChange={set('trustName')} /></label>
        <label>Trust registration no.<input id="sReg" value={s.trustRegNo} onChange={set('trustRegNo')} /></label>
        <label className="wide">Tax note<input id="sTax" value={s.taxNote} onChange={set('taxNote')} placeholder="e.g. Donations eligible under Section 80G, approval no. …" /></label>
      </div>
      <div className="panel form">
        <h3 className="wide">Contact and announcement</h3>
        <label>Contact person<input id="sPerson" value={s.contact?.person || ''} onChange={setC('person')} /></label>
        <label>Phone / WhatsApp<input id="sPhone" value={s.contact?.phone || ''} onChange={setC('phone')} /></label>
        <label>Email<input id="sEmail" type="email" value={s.contact?.email || ''} onChange={setC('email')} /></label>
        <label className="wide">Announcement banner (leave empty to hide)<input id="sAnn" value={s.announcement} onChange={set('announcement')} placeholder="e.g. Brahmadev Yatra on … — all devotees welcome" /></label>
      </div>
      <div className="panel">
        <h3>Darshan and aarti timings</h3>
        <RowsEditor rows={s.darshanTimings || []} setRows={(r) => setS({ ...s, darshanTimings: r })} fields={[['seva', 'Seva'], ['time', 'Time'], ['details', 'Details']]} />
      </div>
      <div className="panel">
        <h3>Festivals</h3>
        <RowsEditor rows={s.festivals || []} setRows={(r) => setS({ ...s, festivals: r })} fields={[['name', 'Festival'], ['when', 'Month or date'], ['details', 'Details']]} />
      </div>
      <Status s={status} />
      <div className="btns"><button className="btn primary" type="submit">Save site details</button></div>
    </form>
  );
}

function GalleryModeration({ onChange }) {
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
      setStatus({ kind: 'ok', text: 'Photo approved successfully.' });
      loadPhotos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  async function removePhoto(id) {
    try {
      await api(`/admin/photos/${id}`, { method: 'DELETE' });
      setStatus({ kind: 'ok', text: 'Photo deleted permanently.' });
      loadPhotos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  async function approveVideo(id) {
    try {
      await api(`/gallery/admin/videos/${id}/approve`, { method: 'PATCH' });
      setStatus({ kind: 'ok', text: 'Video approved successfully.' });
      loadVideos(); onChange();
    } catch (e) { setStatus({ kind: 'error', text: e.message }); }
  }

  async function removeVideo(id) {
    try {
      await api(`/gallery/admin/videos/${id}`, { method: 'DELETE' });
      setStatus({ kind: 'ok', text: 'Video deleted permanently.' });
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
          🖼️ Photos {photoPendingCount > 0 && <span className="gal-count">{photoPendingCount}</span>}
        </button>
        <button
          className={`btn small${mediaTab === 'videos' ? ' primary' : ''}`}
          onClick={() => setMediaTab('videos')}
        >
          🎬 Videos {videoPendingCount > 0 && <span className="gal-count">{videoPendingCount}</span>}
        </button>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>{mediaTab === 'photos' ? 'Photo' : 'Video'} Moderation</h3>
          <div className="btns">
            <label className="check small"><input type="radio" name="gf" checked={statusFilter === 'pending'} onChange={() => setStatusFilter('pending')} /> Pending</label>
            <label className="check small"><input type="radio" name="gf" checked={statusFilter === 'approved'} onChange={() => setStatusFilter('approved')} /> Approved</label>
            <label className="check small"><input type="radio" name="gf" checked={statusFilter === 'all'} onChange={() => setStatusFilter('all')} /> All</label>
          </div>
        </div>
        <Status s={status} />

        {/* PHOTOS TABLE */}
        {mediaTab === 'photos' && (
          <div className="tablebox">
            {!photoItems ? <div className="empty">Loading…</div> : !photoItems.length ? <div className="empty">No photos in this category.</div> : (
              <table>
                <thead><tr><th>Preview</th><th>Uploader</th><th>Event</th><th>Caption</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{photoItems.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.imageUrl} alt={p.caption || `Uploaded by ${p.uploaderName}`} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} /></td>
                    <td>{p.uploaderName}{p.uploaderPhone && <span className="muted small"> · {p.uploaderPhone}</span>}</td>
                    <td>{p.event}</td>
                    <td className="small muted" style={{ maxWidth: 200 }}>{p.caption || '—'}</td>
                    <td>{fmtDate(p.createdAt)}</td>
                    <td>{p.approved ? <span className="chip approved">Approved</span> : <span className="chip pending">Pending</span>}</td>
                    <td style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
                      {!p.approved && <button className="btn small" onClick={() => approvePhoto(p._id)}>Approve</button>}
                      <ConfirmDeleteButton onConfirm={() => removePhoto(p._id)} />
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
            {!videoItems ? <div className="empty">Loading…</div> : !videoItems.length ? <div className="empty">No videos in this category.</div> : (
              <table>
                <thead><tr><th>Preview</th><th>Uploader</th><th>Event</th><th>Caption</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
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
                    <td>{v.approved ? <span className="chip approved">Approved</span> : <span className="chip pending">Pending</span>}</td>
                    <td style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
                      {!v.approved && <button className="btn small" onClick={() => approveVideo(v._id)}>Approve</button>}
                      <ConfirmDeleteButton onConfirm={() => removeVideo(v._id)} />
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

function Account() {
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const [status, setStatus] = useState(null);
  async function submit(e) {
    e.preventDefault();
    try { await api('/auth/change-password', { method: 'POST', body: f }); setStatus({ kind: 'ok', text: 'Password changed.' }); setF({ currentPassword: '', newPassword: '' }); }
    catch (err) { setStatus({ kind: 'error', text: err.message }); }
  }
  return (
    <form className="panel form" onSubmit={submit} style={{ maxWidth: 560 }}>
      <h3 className="wide">Change password</h3>
      <label>Current password<input type="password" id="pCur" autoComplete="current-password" required value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></label>
      <label>New password (10+ characters)<input type="password" id="pNew" autoComplete="new-password" minLength={10} required value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></label>
      <div className="btns wide"><button className="btn primary" type="submit">Change password</button></div>
      <div className="wide"><Status s={status} /></div>
    </form>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { settings, summary, refresh } = useSite();
  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState('donations');
  // Use 'gal' internally for gallery tab to avoid confusion with 'tab' in other components

  useEffect(() => {
    api('/auth/me').then((r) => setAdmin(r.admin)).catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => {});
    navigate('/');
  }

  if (!admin) return <section className="sec page-top"><div className="wrap"><p className="muted">Checking sign-in…</p></div></section>;
  const purposes = settings?.purposes || ['General daan'];
  const tabs = [['donations', 'Daan received'], ['expenses', 'Expenses'], ['gallery', 'Gallery'], ['settings', 'Site details'], ['account', 'Account']];

  return (
    <section className="sec page-top">
      <div className="wrap">
        <div className="panel-head">
          <div className="head">
            <span className="eyebrow">Trust admin</span>
            <h2>Namaskar, {admin.name}</h2>
          </div>
          <button className="btn small" onClick={logout}>Sign out</button>
        </div>
        <div className="ledger-top">
          <div className="tile in"><span>Received</span><strong>{summary ? inr(summary.received.total) : '—'}</strong><em>{summary?.received.count ?? 0} offerings</em></div>
          <div className="tile out"><span>Spent</span><strong>{summary ? inr(summary.spent.total) : '—'}</strong><em>{summary?.spent.count ?? 0} expenses</em></div>
          <div className="tile bal"><span>Balance</span><strong>{summary ? inr(summary.balance) : '—'}</strong><em>Should match the trust's bank balance</em></div>
        </div>
        <div className="tabs" role="tablist" style={{ justifySelf: 'start' }}>
          {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        {tab === 'donations' && <Donations purposes={purposes} onChange={refresh} />}
        {tab === 'expenses' && <Expenses purposes={purposes} onChange={refresh} />}
        {tab === 'gallery' && <GalleryModeration onChange={refresh} />}
        {tab === 'settings' && <SiteSettings onChange={refresh} />}
        {tab === 'account' && <Account />}
      </div>
    </section>
  );
}
