import useServiceInfo from '../api/useServiceInfo';
import { InfoIcon } from './Icons';
import './InfoStrip.css';

export default function InfoStrip() {
  const { demo_mode: demoMode, availability_source: availabilitySource } = useServiceInfo();
  const liveAvailability = availabilitySource === 'rdap';

  if (demoMode) {
    return (
      <div className="info-strip is-demo" role="note">
        <div className="container info-strip-inner">
          <InfoIcon size={18} />
          <p>
            {liveAvailability ? (
              <>
                <strong>Sample prices.</strong> Availability is checked live with the domain registries, but registrar
                names and prices are sample data, not real quotes.
              </>
            ) : (
              <>
                <strong>Demo mode.</strong> Registrars, prices and availability on this site are sample data, not real
                quotes.
              </>
            )}
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
