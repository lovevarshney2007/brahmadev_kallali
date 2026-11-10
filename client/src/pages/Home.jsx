import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSite } from '../SiteContext.jsx';
import { inr, api } from '../api.js';
import { Toran, Shrine, SectionHead, Tbc } from '../components/Decor.jsx';

const MAPS = 'https://www.google.com/maps/search/?api=1&query=Kallali%2C%20Mukhed%2C%20Nanded%2C%20Maharashtra';

export default function Home() {
  const { settings, summary } = useSite();
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
            <div className="mr-name" lang="mr">श्री क्षेत्र ब्रह्मदेव देवस्थान</div>
            <h1>Shri Kshetra Brahmadev Devasthan, Kallali</h1>
            <p className="lede">A sacred place of faith, devotion and spiritual heritage in Kallali village, Mukhed Taluka, Nanded District, Maharashtra.</p>
            <div className="btns">
              <Link className="btn primary" to="/donate">Offer daan</Link>
              <Link className="btn light" to="/ledger">See where daan goes</Link>
            </div>
            <div className="hero-stats" aria-live="polite">
              <div><strong>{summary ? inr(summary.received.total) : '—'}</strong><span>Daan received</span></div>
              <div><strong>{summary ? summary.received.count : '—'}</strong><span>Offerings</span></div>
              <div><strong>{summary ? inr(summary.spent.total) : '—'}</strong><span>Spent on seva</span></div>
            </div>
          </div>
          <Shrine />
        </div>
      </section>

      <section className="sec" id="about">
        <div className="wrap">
          <SectionHead eyebrow="About the temple" title="A place of devotion and spiritual connection" rule />
          <div className="split">
            <div className="prose">
              <p>Shri Kshetra Brahmadev Devasthan, in Kallali village of Mukhed Taluka, Nanded District, holds a special place in the faith of its devotees. It is a spiritual centre where people gather for worship, prayer, religious observances and community celebrations.</p>
              <p>Beyond its religious significance, the Devasthan carries the cultural heritage and collective devotion of the village. Our aim is to preserve its traditions, encourage spiritual life and give devotees reliable, official information.</p>
              <p style={{ fontFamily: 'var(--display)', fontSize: '1.15rem', color: 'var(--heading)' }}>May the blessings of Lord Brahmadev bring peace, prosperity, happiness and well-being to everyone.</p>
            </div>
            <div className="cols">
              <div className="card"><h3>Preserve tradition</h3><p>Keep the temple's rituals, stories and customs alive for future generations.</p></div>
              <div className="card"><h3>Connect devotees</h3><p>Bring devotees in India and abroad closer to the temple's daily life.</p></div>
              <div className="card"><h3>Open accounts</h3><p>Every rupee of daan, and every rupee spent, is shown openly on this site.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="history">
        <div className="wrap">
          <SectionHead eyebrow="History and heritage" title="Preserving our sacred heritage">
            <p>The history of the Devasthan is part of Kallali's identity. Its origin, traditions and stories deserve to be recorded carefully and passed on.</p>
          </SectionHead>
          <div className="split">
            <ol className="timeline">
              <li><strong>Origin of the temple</strong><span>Founding story and establishment year</span> <Tbc /></li>
              <li><strong>Significance of Lord Brahmadev</strong><span>The deity, the shrine and its place in local faith</span> <Tbc /></li>
              <li><strong>Milestones</strong><span>Renovations and important events over the years</span> <Tbc /></li>
              <li><strong>Traditional practices</strong><span>Customs and rituals handed down in the village</span> <Tbc /></li>
              <li><strong>Devotees and community</strong><span>Families who built and cared for the temple</span> <Tbc /></li>
            </ol>
            <div className="note"><strong>Note for the trust:</strong> historical details will be published only after they are checked with the trustees, village elders and local sources. If you hold old records, photographs or family accounts, please share them with the temple office.</div>
          </div>
        </div>
      </section>

      <section className="sec" id="worship">
        <div className="wrap">
          <SectionHead eyebrow="Religious activities" title="Daily seva and aarti">
            <p>The temple offers a sacred setting for daily worship, aarti, special rituals and community prayer.</p>
          </SectionHead>
          <div className="tablebox">
            <table className="info">
              <thead><tr><th>Seva</th><th>Time</th><th>Details</th></tr></thead>
              <tbody>
                {timings.length ? timings.map((t) => (
                  <tr key={t.seva}><td>{t.seva}</td><td>{/confirm/i.test(t.time) || !t.time ? <Tbc /> : t.time}</td><td>{t.details}</td></tr>
                )) : <tr><td colSpan="3" className="empty">Timings will be published by the trust soon.</td></tr>}
                <tr><td>Special puja</td><td>On request</td><td>Contact the temple office to book</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec alt" id="festivals">
        <div className="wrap">
          <SectionHead eyebrow="Festivals and celebrations" title="Faith, tradition and togetherness" />
          <div className="fest">
            {festivals.map((f) => (
              <div className="card" key={f.name}>
                <span className="month">{f.when}</span>
                <h3>{f.name}</h3>
                <p>{f.details}</p>
              </div>
            ))}
            {!festivals.length && <p className="muted">The festival calendar will be published by the trust soon.</p>}
          </div>
        </div>
      </section>

      <section className="sec" id="visit">
        <div className="wrap">
          <SectionHead eyebrow="Darshan information" title="Plan your visit" />
          <div className="split">
            <div className="tablebox">
              <table className="info"><tbody>
                <tr><td>Temple</td><td>Shri Kshetra Brahmadev Devasthan</td></tr>
                <tr><td>Village</td><td>Kallali</td></tr>
                <tr><td>Taluka</td><td>Mukhed</td></tr>
                <tr><td>District</td><td>Nanded</td></tr>
                <tr><td>State</td><td>Maharashtra, India</td></tr>
              </tbody></table>
            </div>
            <div className="prose">
              <h3>How to reach</h3>
              <p><strong>By road:</strong> reach Mukhed by state transport bus or private vehicle, then continue to Kallali by local transport.</p>
              <p><strong>By rail and air:</strong> Nanded has the nearest major railway station and airport. Travel on from Nanded to Mukhed by road.</p>
              <div className="btns"><a className="btn primary" href={MAPS} target="_blank" rel="noopener noreferrer">Get directions on Google Maps</a></div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec alt" id="gallery">
        <div className="wrap">
          <SectionHead eyebrow="Photo and video gallery" title="Moments of faith and devotion">
            <p>Devotees share their darshan memories from the temple. <Link to="/gallery">Upload your photo</Link> and it will appear here after approval.</p>
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
            <Link to="/gallery" className="btn primary">View all photos</Link>
            <Link to="/gallery" className="btn">Share your photo</Link>
          </div>
        </div>
      </section>


      <section className="sec contact" id="contact">
        <div className="wrap">
          <SectionHead eyebrow="Contact us" title="Connect with the temple office">
            <p>For darshan, ceremonies, festivals, daan receipts and other temple matters.</p>
          </SectionHead>
          <div className="split">
            <dl>
              <dt>Contact person</dt><dd>{c.person || <Tbc>Trustee / administrator</Tbc>}</dd>
              <dt>Phone / WhatsApp</dt><dd>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : <Tbc>Official number</Tbc>}</dd>
              <dt>Email</dt><dd>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Tbc>Official email</Tbc>}</dd>
              <dt>Address</dt><dd>Shri Kshetra Brahmadev Devasthan<br />Village Kallali, Taluka Mukhed<br />District Nanded, Maharashtra, India</dd>
            </dl>
            <div className="cols">
              <div className="card"><h3>Offer daan</h3><p>Give by UPI QR or online payment and see it in the public ledger.</p><Link to="/donate">Go to donations</Link></div>
              <div className="card"><h3>Volunteer with us</h3><p>Registration for sevekari and volunteers will open soon.</p></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
