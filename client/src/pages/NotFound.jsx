import { Link } from 'react-router-dom';
import { useSite } from '../SiteContext.jsx';

export default function NotFound() {
  const { lang } = useSite();
  const isMr = lang === 'mr';

  return (
    <section className="sec page-top">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">{isMr ? 'पृष्ठ आढळले नाही' : 'Page not found'}</span>
          <h2>{isMr ? 'हे पृष्ठ अस्तित्वात नाही' : "This page doesn't exist"}</h2>
          <p>{isMr ? 'आपण शोधत असलेला दुवा जुना किंवा चुकीचा असू शकतो.' : 'The link may be old or mistyped.'}</p>
        </div>
        <div className="btns">
          <Link className="btn primary" to="/">
            {isMr ? 'मुख्य पृष्ठावर जा' : 'Go to the home page'}
          </Link>
        </div>
      </div>
    </section>
  );
}
