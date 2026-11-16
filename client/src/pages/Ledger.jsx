import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { api, inr, fmtDate } from '../api.js';
import { SectionHead } from '../components/Decor.jsx';
import Bars from '../components/Bars.jsx';
import PhotoGrid from '../components/PhotoGrid.jsx';

export default function Ledger() {
  const { summary, settings, lang, t } = useSite();
  const [tab, setTab] = useState('donations');
  const [page, setPage] = useState(1);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [visitPhotos, setVisitPhotos] = useState([]);

  const isMr = lang === 'mr';

  useEffect(() => {
    setData(null);
    setError('');
    const pQuery = selectedPurpose ? `&purpose=${encodeURIComponent(selectedPurpose)}` : '';
    api(`/public/${tab}?page=${page}&limit=25${pQuery}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [tab, page, selectedPurpose]);

  useEffect(() => {
    api('/gallery/public/photos?limit=8')
      .then((res) => {
        if (res?.items) setVisitPhotos(res.items);
      })
      .catch(() => {});
  }, []);

  const switchTab = (tTab) => {
    setTab(tTab);
    setPage(1);
    setSelectedPurpose('');
    setSearchQuery('');
  };

  const hasExamples = data?.items?.some((x) => x.example);
  const r = summary?.received, s = summary?.spent;

  const displayedItems = (data?.items || []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const donorOrItem = (item.donor || item.item || '').toLowerCase();
    const purpose = (item.purpose || '').toLowerCase();
    const receiptOrBill = (item.receiptNo || item.billNo || '').toLowerCase();
    return donorOrItem.includes(q) || purpose.includes(q) || receiptOrBill.includes(q);
  });

  const purposesList = settings?.purposes || [
    'General daan',
    'Annadan seva',
    'Utsav and festivals',
    'Nitya puja',
    'Temple upkeep',
  ];

  return (
    <section className="sec alt page-top" id="ledger">
      <div className="wrap">
        <SectionHead eyebrow={t.ledgerPage.eyebrow} title={t.ledgerPage.title}>
          <p>{t.ledgerPage.desc}</p>
          {summary?.lastUpdated && (
            <p className="small muted">
              {isMr ? 'शेवटचे अद्यतन' : 'Last updated'}{' '}
              {new Date(summary.lastUpdated).toLocaleString(isMr ? 'mr-IN' : 'en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </SectionHead>

        {/* ── 4 Financial Summary Tiles ── */}
        <div className="ledger-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
            <strong>{summary?.balance !== undefined ? inr(summary.balance) : '—'}</strong>
            <em>
              {r?.total && s?.total !== undefined
                ? `${Math.round((s.total / r.total) * 100)}% ${t.ledgerPage.usedSoFar}`
                : isMr
                ? 'जमा वजा खर्च'
                : 'Received minus spent'}
            </em>
          </div>
          <div className="tile in" style={{ borderLeftColor: 'var(--saffron)' }}>
            <span>{t.ledgerPage.contributors}</span>
            <strong>{r?.contributors ?? r?.count ?? '—'}</strong>
            <em>{isMr ? 'नोंदणीकृत देणगीदार' : 'Unique contributors'}</em>
          </div>
        </div>

        {/* ── Where Daan was Used & What Devotees Gave ── */}
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
            {isMr
              ? ' चिन्ह आहे त्या हिशोब वहीचे कामकाज समजण्यासाठी दिलेल्या नमुना नोंदी आहेत. वेबसाइट खुली करण्यापूर्वी ट्रस्ट त्या काढून टाकेल.'
              : ' are samples to show how the ledger works. The trust will remove them before the site goes public.'}
          </div>
        )}

        {/* ── Detailed Ledger Table with Filters ── */}
        <div className="panel">
          <div className="panel-head" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3>{tab === 'donations' ? t.ledgerPage.tabReceived : t.ledgerPage.tabSpent}</h3>
            <div className="tabs" role="tablist">
              <button
                role="tab"
                aria-selected={tab === 'donations'}
                onClick={() => switchTab('donations')}
              >
                {isMr ? 'जमा दान' : 'Received'}
              </button>
              <button
                role="tab"
                aria-selected={tab === 'expenses'}
                onClick={() => switchTab('expenses')}
              >
                {isMr ? 'खर्च' : 'Spent'}
              </button>
            </div>
          </div>

          {/* Search & Purpose Filters */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'var(--band)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <select
              value={selectedPurpose}
              onChange={(e) => {
                setSelectedPurpose(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--fg)',
                font: 'inherit',
                fontSize: '0.9rem',
              }}
            >
              <option value="">{t.ledgerPage.allPurposes}</option>
              {purposesList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder={t.ledgerPage.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.45rem 0.8rem',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--fg)',
                font: 'inherit',
                fontSize: '0.9rem',
                flex: 1,
                minWidth: '200px',
              }}
            />
          </div>

          <div className="tablebox">
            {error ? (
              <div className="empty">{error}</div>
            ) : !data ? (
              <div className="empty">{isMr ? 'माहिती लोड होत आहे…' : 'Loading…'}</div>
            ) : !displayedItems.length ? (
              <div className="empty">
                {tab === 'donations' ? t.ledgerPage.noDonations : t.ledgerPage.noExpenses}
              </div>
            ) : tab === 'donations' ? (
              <table>
                <thead>
                  <tr>
                    <th>{t.ledgerPage.colDate}</th>
                    <th>{t.ledgerPage.colDevotee}</th>
                    <th>{t.ledgerPage.colPurpose}</th>
                    <th>{t.ledgerPage.colReceipt}</th>
                    <th>{t.ledgerPage.colStatus}</th>
                    <th className="amt">{t.ledgerPage.colAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.map((d) => (
                    <tr key={d.id}>
                      <td>{fmtDate(d.date)}</td>
                      <td>
                        {d.donor || <span className="muted">{t.ledgerPage.anonymous}</span>}{' '}
                        {d.source === 'razorpay' && (
                          <span className="chip online">{t.ledgerPage.onlineChip}</span>
                        )}{' '}
                        {d.example && <span className="chip ex">{isMr ? 'नमुना' : 'Example'}</span>}
                      </td>
                      <td>{d.purpose}</td>
                      <td className="muted">{d.receiptNo || '—'}</td>
                      <td>
                        <span className="chip approved">{t.ledgerPage.verifiedBadge}</span>
                      </td>
                      <td className="amt">{inr(d.amount)}</td>
                    </tr>
                  ))}
                </tbody>
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
                <tbody>
                  {displayedItems.map((e) => (
                    <tr key={e.id}>
                      <td>{fmtDate(e.date)}</td>
                      <td>
                        {e.item}
                        {e.paidTo && <span className="muted small"> · {e.paidTo}</span>}{' '}
                        {e.example && <span className="chip ex">{isMr ? 'नमुना' : 'Example'}</span>}
                      </td>
                      <td>{e.purpose}</td>
                      <td className="muted">{e.billNo || '—'}</td>
                      <td className="amt">{inr(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {data && data.pages > 1 && (
            <div className="pager" style={{ padding: '1rem' }}>
              <button
                className="btn small"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                {isMr ? 'मागील' : 'Previous'}
              </button>
              <span className="small muted">
                {isMr ? `पृष्ठ ${page} / ${data.pages}` : `Page ${page} of ${data.pages}`}
              </span>
              <button
                className="btn small"
                disabled={page >= data.pages}
                onClick={() => setPage(page + 1)}
              >
                {isMr ? 'पुढील' : 'Next'}
              </button>
            </div>
          )}
        </div>

        {/* ── Annual Financial Statements Section (Docs Requirement) ── */}
        <div className="panel" style={{ marginTop: '2.5rem' }}>
          <div className="panel-head" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>{t.ledgerPage.annualReportsTitle}</h3>
              <p className="small muted" style={{ margin: '0.2rem 0 0' }}>
                {t.ledgerPage.annualReportsDesc}
              </p>
            </div>
            <a href="/donate" className="btn small primary">
              {t.nav.donate}
            </a>
          </div>
          <div className="tablebox">
            <table>
              <thead>
                <tr>
                  <th>{t.ledgerPage.colFY}</th>
                  <th className="amt">{t.ledgerPage.colOpening}</th>
                  <th className="amt">{t.ledgerPage.colReceivedFY}</th>
                  <th className="amt">{t.ledgerPage.colSpentFY}</th>
                  <th className="amt">{t.ledgerPage.colClosing}</th>
                  <th>{t.ledgerPage.colReportStatus}</th>
                  <th>{t.ledgerPage.downloadPdf}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>FY 2025–26</strong>
                  </td>
                  <td className="amt">₹0</td>
                  <td className="amt">{inr(r?.total || 0)}</td>
                  <td className="amt">{inr(s?.total || 0)}</td>
                  <td className="amt">
                    <strong>{inr(summary?.balance || 0)}</strong>
                  </td>
                  <td>
                    <span className="chip pending">{t.ledgerPage.statusProvisional}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => alert(t.ledgerPage.pdfPendingNote)}
                    >
                      📄 {t.ledgerPage.downloadPdf}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>FY 2024–25</strong>
                  </td>
                  <td className="amt">—</td>
                  <td className="amt">—</td>
                  <td className="amt">—</td>
                  <td className="amt">—</td>
                  <td>
                    <span className="small muted">
                      {isMr ? 'माहिती संकलन चालू' : 'Records under verification'}
                    </span>
                  </td>
                  <td>
                    <span className="small muted">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ padding: '0.75rem 1.25rem', margin: 0 }}>
            ℹ️ {t.ledgerPage.pdfPendingNote}
          </p>
        </div>

        {/* Distinguished Visits Gallery */}
        <section
          className="sec alt"
          id="visits-gallery"
          style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--line)' }}
        >
          <div className="wrap">
            <SectionHead
              eyebrow={isMr ? 'दर्शन व भेट' : 'Visits & Darshan'}
              title={isMr ? 'माननीयांची भेटी व विशेष क्षण' : 'Distinguished Visits & Special Moments'}
            />
            <PhotoGrid
              photos={visitPhotos}
              title={isMr ? 'भेटी दालन' : 'Visits Gallery'}
              subtitle={
                isMr
                  ? 'माननीय महानुभावांकडून केलेल्या भेटीची झलक'
                  : 'Glimpses of visits by distinguished guests'
              }
              emptyMessage={
                isMr ? 'अद्याप कोणतीही भेटीचे छायाचित्र उपलब्ध नाहीत.' : 'No visit photos available yet.'
              }
            />
          </div>
        </section>
      </div>
    </section>
  );
}
