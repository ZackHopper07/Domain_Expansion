import Logo from './Logo';
import './Footer.css';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo size="sm" />
          <p>Compare domain prices across registrars before you buy.</p>
        </div>

        <nav aria-label="Footer">
          <ul>
            <li>
              <a href="#search">Search domains</a>
            </li>
            <li>
              <a href="#how-we-work">How we work</a>
            </li>
            <li>
              <a href="#registrars">Registrars</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="container footer-legal">
        <p>© {YEAR} PriceMyDomain. We compare prices and don’t sell domains.</p>
        <p>Prices can change at any time. Always confirm with the registrar before you buy.</p>
      </div>
    </footer>
  );
}
