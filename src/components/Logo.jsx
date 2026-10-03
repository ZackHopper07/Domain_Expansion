import logo from '../assets/logo.png';
import logoDark from '../assets/logo-dark.png';
import './Logo.css';

// The logo file has lots of empty space around the artwork, so we show it
// through a window that crops to just the mark and wordmark. The dark theme
// swaps in a copy with a light wordmark.
export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo-${size}`}>
      <img className="logo-light" src={logo} alt="PriceMyDomain" width="615" height="405" />
      <img className="logo-dark" src={logoDark} alt="PriceMyDomain" width="615" height="405" />
    </span>
  );
}
