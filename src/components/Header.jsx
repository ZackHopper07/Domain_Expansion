import { useEffect, useState } from 'react';
import Logo from './Logo';
import ExtensionButton from './ExtensionButton';
import { MenuIcon, CloseIcon } from './Icons';
import './Header.css';

const LINKS = [
  { href: '#extensions', label: 'Extensions' },
  { href: '#how-we-work', label: 'How we work' },
  { href: '#registrars', label: 'Registrars' },
  { href: '#faq', label: 'FAQ' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#top" className="header-logo" aria-label="PriceMyDomain home">
          <Logo />
        </a>

        <nav aria-label="Main" className={`header-nav ${open ? 'is-open' : ''}`} id="main-nav">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="header-actions">
            <ExtensionButton />
            <a href="#search" className="btn btn-primary header-cta" onClick={() => setOpen(false)}>
              Search domains
            </a>
          </div>
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>
    </header>
  );
}
