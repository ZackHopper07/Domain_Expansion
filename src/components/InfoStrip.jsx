import { USE_MOCK } from '../api/client';
import { InfoIcon } from './Icons';
import './InfoStrip.css';

export default function InfoStrip() {
  if (USE_MOCK) {
    return (
      <div className="info-strip is-demo" role="note">
        <div className="container info-strip-inner">
          <InfoIcon size={18} />
          <p>
            <strong>Demo mode.</strong> Registrars, prices and availability on this site are sample data, not real
            quotes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="info-strip">
      <div className="container info-strip-inner">
        <p>
          <strong>One search, every registrar.</strong> See first-year, renewal and transfer prices side by side.
        </p>
      </div>
    </div>
  );
}
