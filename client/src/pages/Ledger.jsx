import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { api, inr, fmtDate } from '../api.js';
import { SectionHead } from '../components/Decor.jsx';
import Bars from '../components/Bars.jsx';

export default function Ledger() {
  const { summary } = useSite();
  const [tab, setTab] = useState('donations');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null); setError('');
    api(`/public/${tab}?page=${page}&limit=25`).then(setData).catch((e) => setError(e.message));
  }, [tab, page]);

  const switchTab = (t) => { setTab(t); setPage(1); };
  const hasExamples = data?.items?.some((x) => x.example);
  const r = summary?.received, s = summary?.spent;

  return (
    <section className="sec alt page-top" id="ledger">
      <div className="wrap">
        <SectionHead eyebrow="Daan Pustak · public ledger" title="Every rupee received, every rupee spent">
          <p>The trust records each offering and each expense here. Donors are named only with their permission; everyone else appears as an anonymous devotee.</p>
          {summary?.lastUpdated && <p className="small muted">Last updated {new Date(summary.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>}
        </SectionHead>

        <div className="ledger-top">
          <div className="tile in"><span>Total daan received</span><strong>{r ? inr(r.total) : '—'}</strong><em>{r ? `${r.count} offerings` : ''}</em></div>
          <div className="tile out"><span>Spent on seva</span><strong>{s ? inr(s.total) : '—'}</strong><em>{s ? `${s.count} expenses` : ''}</em></div>
          <div className="tile bal"><span>Balance with trust</span><strong>{summary ? inr(summary.balance) : '—'}</strong><em>{r?.total ? `${Math.round((s.total / r.total) * 100)}% of daan used so far` : 'Received minus spent'}</em></div>
        </div>

        <div className="split">
          <div className="panel"><div className="panel-head"><h3>Where daan was used</h3><span className="small muted">By purpose</span></div><Bars rows={s?.byPurpose} total={s?.total} /></div>
          <div className="panel"><div className="panel-head"><h3>What devotees gave for</h3><span className="small muted">By purpose chosen</span></div><Bars rows={r?.byPurpose} total={r?.total} /></div>
        </div>

        {hasExamples && <div className="note">Entries marked <span className="chip ex">Example</span> are samples to show how the ledger works. The trust will remove them before the site goes public.</div>}

        <div className="panel">
          <div className="panel-head">
            <h3>{tab === 'donations' ? 'Daan received' : 'Daan spent'}</h3>
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'donations'} onClick={() => switchTab('donations')}>Received</button>
              <button role="tab" aria-selected={tab === 'expenses'} onClick={() => switchTab('expenses')}>Spent</button>
            </div>
          </div>
          <div className="tablebox">
            {error ? <div className="empty">{error}</div>
              : !data ? <div className="empty">Loading…</div>
              : !data.items.length ? <div className="empty">{tab === 'donations' ? 'No daan recorded yet.' : 'No expenses recorded yet.'}</div>
              : tab === 'donations' ? (
                <table>
                  <thead><tr><th>Date</th><th>Devotee</th><th>Purpose</th><th>Receipt</th><th className="amt">Amount</th></tr></thead>
                  <tbody>{data.items.map((d) => (
                    <tr key={d.id}>
                      <td>{fmtDate(d.date)}</td>
                      <td>{d.donor || <span className="muted">Anonymous devotee</span>}{' '}
                        {d.source === 'razorpay' && <span className="chip online">Online</span>}{' '}
                        {d.example && <span className="chip ex">Example</span>}</td>
                      <td>{d.purpose}</td>
                      <td className="muted">{d.receiptNo || '—'}</td>
                      <td className="amt">{inr(d.amount)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : (
                <table>
                  <thead><tr><th>Date</th><th>Expense</th><th>Purpose</th><th>Bill no.</th><th className="amt">Amount</th></tr></thead>
                  <tbody>{data.items.map((e) => (
                    <tr key={e.id}>
                      <td>{fmtDate(e.date)}</td>
                      <td>{e.item}{e.paidTo && <span className="muted small"> · {e.paidTo}</span>} {e.example && <span className="chip ex">Example</span>}</td>
                      <td>{e.purpose}</td>
                      <td className="muted">{e.billNo || '—'}</td>
                      <td className="amt">{inr(e.amount)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
          </div>
          {data && data.pages > 1 && (
            <div className="pager">
              <button className="btn small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="small muted">Page {page} of {data.pages}</span>
              <button className="btn small" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
