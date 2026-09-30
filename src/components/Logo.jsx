import logo from '../assets/logo.png';
import './Logo.css';

// The logo file has lots of empty space around the artwork, so we show it
// through a window that crops to just the mark and wordmark.
export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo-${size}`}>
      <img src={logo} alt="PriceMyDomain" width="615" height="405" />
    </span>
  );
}
