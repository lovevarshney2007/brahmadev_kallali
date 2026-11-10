import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="sec page-top">
      <div className="wrap">
        <div className="head">
          <span className="eyebrow">Page not found</span>
          <h2>This page doesn't exist</h2>
          <p>The link may be old or mistyped.</p>
        </div>
        <div className="btns"><Link className="btn primary" to="/">Go to the home page</Link></div>
      </div>
    </section>
  );
}
