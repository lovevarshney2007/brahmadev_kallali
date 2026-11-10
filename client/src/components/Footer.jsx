import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="prose">
          <h3>Shri Kshetra Brahmadev Devasthan, Kallali</h3>
          <p>A sacred destination of faith, devotion and tradition.</p>
          <p lang="mr" style={{ fontFamily: 'var(--display)', color: 'var(--gold-bright)' }}>॥ श्री ब्रह्मदेव प्रसन्न ॥</p>
        </div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/#about">About Us</Link></li>
          <li><Link to="/#history">Temple History</Link></li>
          <li><Link to="/#worship">Religious Activities</Link></li>
          <li><Link to="/#festivals">Festivals</Link></li>
          <li><Link to="/#gallery">Gallery</Link></li>
          <li><Link to="/donate">Donate</Link></li>
          <li><Link to="/ledger">Daan Ledger</Link></li>
          <li><Link to="/#contact">Contact Us</Link></li>
          <li><Link to="/admin">Trust login</Link></li>
        </ul>
        <p className="copyline">© {new Date().getFullYear()} Shri Kshetra Brahmadev Devasthan, Kallali. All rights reserved.</p>
      </div>
    </footer>
  );
}
