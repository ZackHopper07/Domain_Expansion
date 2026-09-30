import { useEffect, useRef, useState } from 'react';
import { ConeIcon, PuzzleIcon } from './Icons';
import './ExtensionButton.css';

// Placeholder until the Chrome extension exists. It explains that the
// extension is coming instead of linking anywhere.
export default function ExtensionButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onClick);
    };
  }, [open]);

  return (
    <div className="ext-btn-wrap" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="btn ext-btn"
        aria-expanded={open}
        aria-controls="ext-soon"
        onClick={() => setOpen((o) => !o)}
      >
        <PuzzleIcon size={18} />
        <span>Install Chrome extension</span>
        <span className="soon-badge">Soon</span>
      </button>

      {open && (
        <div id="ext-soon" className="ext-pop" role="status">
          <span className="ext-pop-icon" aria-hidden="true">
            <ConeIcon size={22} />
          </span>
          <div>
            <p className="ext-pop-title">Under construction</p>
            <p>
              Our Chrome extension isn’t ready yet. When it is, it’ll show PriceMyDomain price comparisons while you
              browse registrar sites.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
