import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { api, inr, fmtDate } from '../api.js';
import { SectionHead } from '../components/Decor.jsx';
import Bars from '../components/Bars.jsx';

export default function Ledger() {
  const { summary, lang, t } = useSite();
  const [tab, setTab] = useState('donations');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const isMr = lang === 'mr';

  useEffect(() => {
    setData(null); setError('');
    api(`/public/${tab}?page=${page}&limit=25`).then(setData).catch((e) => setError(e.message));
  }, [tab, page]);

  const switchTab = (tTab) => { setTab(tTab); setPage(1); };
  const hasExamples = data?.items?.some((x) => x.example);
  const r = summary?.received, s = summary?.spent;

  return (
    <section className="sec alt page-top" id="ledger">
      <div className="wrap">
        <SectionHead eyebrow={t.ledgerPage.eyebrow} title={t.ledgerPage.title}>
          <p>{t.ledgerPage.desc}</p>
          {summary?.lastUpdated && (
            <p className="small muted">
              {isMr ? 'शेवटचे अद्यतन' : 'Last updated'} {new Date(summary.lastUpdated).toLocaleString(isMr ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </SectionHead>

        <div className="ledger-top">
          <div className="tile in">
            <span>{t.ledgerPage.totalReceived}</span>
            <strong>{r ? inr(r.total) : '—'}</strong>
            <em>{r ? (isMr ? `${r.count} देणग्या` : `${r.count} offerings`) : ''}</em>
          </div>
          <div className="tile out">
            <span>{t.ledgerPage.spentOnSeva}</span>
            <strong>{s ? inr(s.total) : '—'}</strong>
            <em>{s ? (isMr ? `${s.count} खर्च नोंदी` : `${s.count} expenses`) : ''}</em>
          </div>
          <div className="tile bal">
            <span>{t.ledgerPage.balance}</span>
            <strong>{summary ? inr(summary.balance) : '—'}</strong>
            <em>{r?.total ? `${Math.round((s.total / r.total) * 100)}% ${t.ledgerPage.usedSoFar}` : (isMr ? 'जमा वजा खर्च' : 'Received minus spent')}</em>
          </div>
        </div>

        <div className="split">
          <div className="panel">
            <div className="panel-head">
              <h3>{t.ledgerPage.whereUsed}</h3>
              <span className="small muted">{t.ledgerPage.byPurpose}</span>
            </div>
            <Bars rows={s?.byPurpose} total={s?.total} />
          </div>
          <div className="panel">
            <div className="panel-head">
              <h3>{t.ledgerPage.whatDevoteesGave}</h3>
              <span className="small muted">{t.ledgerPage.byPurpose}</span>
            </div>
            <Bars rows={r?.byPurpose} total={r?.total} />
          </div>
        </div>

        {hasExamples && (
          <div className="note">
            {isMr ? 'नोंदी ज्यावर ' : 'Entries marked '}
            <span className="chip ex">{isMr ? 'नमुना' : 'Example'}</span>
            {isMr ? ' चिन्ह आहे त्या हिशोब वहीचे कामकाज समजण्यासाठी दिलेल्या नमुना नोंदी आहेत. वेबसाइट खुली करण्यापूर्वी ट्रस्ट त्या काढून टाकेल.' : ' are samples to show how the ledger works. The trust will remove them before the site goes public.'}
          </div>
        )}

        <div className="panel">
          <div className="panel-head">
            <h3>{tab === 'donations' ? t.ledgerPage.tabReceived : t.ledgerPage.tabSpent}</h3>
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === 'donations'} onClick={() => switchTab('donations')}>
                {isMr ? 'जमा दान' : 'Received'}
              </button>
              <button role="tab" aria-selected={tab === 'expenses'} onClick={() => switchTab('expenses')}>
                {isMr ? 'खर्च' : 'Spent'}
              </button>
            </div>
          </div>
          <div className="tablebox">
            {error ? <div className="empty">{error}</div>
              : !data ? <div className="empty">{isMr ? 'माहिती लोड होत आहे…' : 'Loading…'}</div>
              : !data.items.length ? <div className="empty">{tab === 'donations' ? t.ledgerPage.noDonations : t.ledgerPage.noExpenses}</div>
              : tab === 'donations' ? (
                <table>
                  <thead>
                    <tr>
                      <th>{t.ledgerPage.colDate}</th>
                      <th>{t.ledgerPage.colDevotee}</th>
                      <th>{t.ledgerPage.colPurpose}</th>
                      <th>{t.ledgerPage.colReceipt}</th>
                      <th className="amt">{t.ledgerPage.colAmount}</th>
                    </tr>
                  </thead>
                  <tbody>{data.items.map((d) => (
                    <tr key={d.id}>
                      <td>{fmtDate(d.date)}</td>
                      <td>{d.donor || <span className="muted">{t.ledgerPage.anonymous}</span>}{' '}
                        {d.source === 'razorpay' && <span className="chip online">{t.ledgerPage.onlineChip}</span>}{' '}
                        {d.example && <span className="chip ex">{isMr ? 'नमुना' : 'Example'}</span>}</td>
                      <td>{d.purpose}</td>
                      <td className="muted">{d.receiptNo || '—'}</td>
                      <td className="amt">{inr(d.amount)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>{t.ledgerPage.colDate}</th>
                      <th>{t.ledgerPage.colExpense}</th>
                      <th>{t.ledgerPage.colPurpose}</th>
                      <th>{t.ledgerPage.colBill}</th>
                      <th className="amt">{t.ledgerPage.colAmount}</th>
                    </tr>
                  </thead>
                  <tbody>{data.items.map((e) => (
                    <tr key={e.id}>
                      <td>{fmtDate(e.date)}</td>
                      <td>{e.item}{e.paidTo && <span className="muted small"> · {e.paidTo}</span>} {e.example && <span className="chip ex">{isMr ? 'नमुना' : 'Example'}</span>}</td>
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
              <button className="btn small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                {isMr ? 'मागील' : 'Previous'}
              </button>
              <span className="small muted">
                {isMr ? `पृष्ठ ${page} / ${data.pages}` : `Page ${page} of ${data.pages}`}
              </span>
              <button className="btn small" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
                {isMr ? 'पुढील' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
