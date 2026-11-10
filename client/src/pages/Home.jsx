import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { inr, api } from '../api.js';
import { Toran, Shrine, SectionHead, Tbc } from '../components/Decor.jsx';

const MAPS = 'https://www.google.com/maps/search/?api=1&query=Kallali%2C%20Mukhed%2C%20Nanded%2C%20Maharashtra';

export default function Home() {
  const { settings, summary, t } = useSite();
  const timings = settings?.darshanTimings || [];
  const festivals = settings?.festivals || [];
  const c = {
    person: settings?.contact?.person || 'Maruti kunjatwad',
    phone: settings?.contact?.phone || '9503131031',
    email: settings?.contact?.email || '',
  };

  // Fetch latest 6 approved photos for the home gallery preview
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  useEffect(() => {
    api('/gallery/public/photos?limit=6').then((data) => {
      if (data?.items) setGalleryPhotos(data.items);
    }).catch(() => {});
  }, []);

  return (
    <>
      <Toran />
      <section className="hero" id="home">
        <div className="wrap">
          <div className="hero-text">
            <div className="mr-name" lang="mr">{t.hero.deity}</div>
            <h1>{t.hero.title}</h1>
            <p className="lede">{t.hero.lede}</p>
            <div className="btns">
              <Link className="btn primary" to="/donate">{t.hero.offerDaan}</Link>
              <Link className="btn light" to="/ledger">{t.hero.seeLedger}</Link>
            </div>
            <div className="hero-stats" aria-live="polite">
              <div><strong>{summary ? inr(summary.received.total) : '—'}</strong><span>{t.hero.daanReceived}</span></div>
              <div><strong>{summary ? summary.received.count : '—'}</strong><span>{t.hero.offerings}</span></div>
              <div><strong>{summary ? inr(summary.spent.total) : '—'}</strong><span>{t.hero.spentOnSeva}</span></div>
            </div>
          </div>
          <Shrine />
        </div>
      </section>

      <section className="sec" id="about">
        <div className="wrap">
          <SectionHead eyebrow={t.about.eyebrow} title={t.about.title} rule />
          <div className="split">
            <div className="prose">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', color: 'var(--saffron)' }}>{t.about.blessing}</p>
            </div>
            <div className="cols">
              <div className="card"><h3>{t.about.c1Title}</h3><p>{t.about.c1Text}</p></div>
              <div className="card"><h3>{t.about.c2Title}</h3><p>{t.about.c2Text}</p></div>
              <div className="card"><h3>{t.about.c3Title}</h3><p>{t.about.c3Text}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="history">
        <div className="wrap">
          <SectionHead eyebrow={t.history.eyebrow} title={t.history.title}>
            <p>{t.history.desc}</p>
          </SectionHead>
          <div className="split">
            <ol className="timeline">
              <li><strong>{t.history.t1Title}</strong><span>{t.history.t1Sub}</span> <Tbc /></li>
              <li><strong>{t.history.t2Title}</strong><span>{t.history.t2Sub}</span> <Tbc /></li>
              <li><strong>{t.history.t3Title}</strong><span>{t.history.t3Sub}</span> <Tbc /></li>
              <li><strong>{t.history.t4Title}</strong><span>{t.history.t4Sub}</span> <Tbc /></li>
              <li><strong>{t.history.t5Title}</strong><span>{t.history.t5Sub}</span> <Tbc /></li>
            </ol>
            <div className="note">
              <strong>{t.history.trustNoteTitle}</strong>{t.history.trustNoteText}
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="worship">
        <div className="wrap">
          <SectionHead eyebrow={t.worship.eyebrow} title={t.worship.title}>
            <p>{t.worship.desc}</p>
          </SectionHead>
          <div className="tablebox">
            <table className="info">
              <thead><tr><th>{t.worship.colSeva}</th><th>{t.worship.colTime}</th><th>{t.worship.colDetails}</th></tr></thead>
              <tbody>
                {timings.length ? timings.map((tRow) => (
                  <tr key={tRow.seva}><td>{tRow.seva}</td><td>{/confirm/i.test(tRow.time) || !tRow.time ? <Tbc /> : tRow.time}</td><td>{tRow.details}</td></tr>
                )) : <tr><td colSpan="3" className="empty">{t.worship.emptyTimings}</td></tr>}
                <tr><td>{t.worship.specialPuja}</td><td>{t.worship.onRequest}</td><td>{t.worship.bookContact}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec alt" id="festivals">
        <div className="wrap">
          <SectionHead eyebrow={t.festivals.eyebrow} title={t.festivals.title} />
          <div className="fest">
            {festivals.map((f) => (
              <div className="card" key={f.name}>
                <span className="month">{f.when}</span>
                <h3>{f.name}</h3>
                <p>{f.details}</p>
              </div>
            ))}
            {!festivals.length && <p className="muted">{t.festivals.empty}</p>}
          </div>
        </div>
      </section>

      <section className="sec" id="visit">
        <div className="wrap">
          <SectionHead eyebrow={t.visit.eyebrow} title={t.visit.title} />
          <div className="split">
            <div className="tablebox">
              <table className="info"><tbody>
                <tr><td>{t.visit.templeLabel}</td><td>{t.visit.templeVal}</td></tr>
                <tr><td>{t.visit.villageLabel}</td><td>{t.visit.villageVal}</td></tr>
                <tr><td>{t.visit.talukaLabel}</td><td>{t.visit.talukaVal}</td></tr>
                <tr><td>{t.visit.districtLabel}</td><td>{t.visit.districtVal}</td></tr>
                <tr><td>{t.visit.stateLabel}</td><td>{t.visit.stateVal}</td></tr>
              </tbody></table>
            </div>
            <div className="prose">
              <h3>{t.visit.reachTitle}</h3>
              <p><strong>{t.visit.byRoad}</strong>{t.visit.roadDesc}</p>
              <p><strong>{t.visit.byRailAir}</strong>{t.visit.railAirDesc}</p>
              <div className="btns"><a className="btn primary" href={MAPS} target="_blank" rel="noopener noreferrer">{t.visit.mapsBtn}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="gallery">
        <div className="wrap">
          <SectionHead eyebrow={t.gallery.eyebrow} title={t.gallery.title}>
            <p>{t.gallery.desc1}<Link to="/gallery">{t.gallery.descLink}</Link>{t.gallery.desc2}</p>
          </SectionHead>
          <div className="gallery">
            {galleryPhotos.length > 0
              ? galleryPhotos.map((photo) => (
                  <Link to="/gallery" key={photo.id} className="ph-real" aria-label={photo.caption || `Photo by ${photo.uploaderName}`}>
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || `Temple photo by ${photo.uploaderName}`}
                      loading="lazy"
                    />
                    {photo.caption && <span className="ph-real-cap">{photo.caption}</span>}
                  </Link>
                ))
              : ['Temple exterior', 'Deity darshan', 'Morning aarti', 'Annual yatra', 'Festival decorations', 'Annadan seva'].map((p) => (
                  <div className="ph" key={p}>{p}</div>
                ))
            }
          </div>
          <div className="btns">
            <Link to="/gallery" className="btn primary">{t.gallery.viewAll}</Link>
            <Link to="/gallery" className="btn">{t.gallery.sharePhoto}</Link>
          </div>
        </div>
      </section>

      <section className="sec contact" id="contact">
        <div className="wrap">
          <SectionHead eyebrow={t.contact.eyebrow} title={t.contact.title}>
            <p>{t.contact.desc}</p>
          </SectionHead>
          <div className="split">
            <dl>
              <dt>{t.contact.person}</dt><dd>{c.person || <Tbc>Trustee / administrator</Tbc>}</dd>
              <dt>{t.contact.phone}</dt><dd>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : <Tbc>Official number</Tbc>}</dd>
              <dt>{t.contact.email}</dt><dd>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Tbc>Official email</Tbc>}</dd>
              <dt>{t.contact.address}</dt><dd style={{ whiteSpace: 'pre-line' }}>{t.contact.addressVal}</dd>
            </dl>
            <div className="cols">
              <div className="card">
                <h3>{t.contact.card1Title}</h3>
                <p>{t.contact.card1Text}</p>
                <Link to="/donate">{t.contact.card1Link}</Link>
              </div>
              <div className="card">
                <h3>{t.contact.card2Title}</h3>
                <p>{t.contact.card2Text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
