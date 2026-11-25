import useServiceInfo from '../api/useServiceInfo';
import './RegistrarsStrip.css';

export default function RegistrarsStrip() {
  const { demo_mode: demoMode, providers, loaded, failed } = useServiceInfo();

  return (
    <section className="section registrars" id="registrars" aria-labelledby="reg-title">
      <div className="container registrars-inner">
        <div>
          <h2 id="reg-title">Registrars we compare</h2>
          <p>
            {demoMode
              ? 'These are sample registrars for the demo. Real registrars appear here once our live connections are ready.'
              : 'We add registrars as we connect to their official price and availability services.'}
          </p>
        </div>

        {failed ? (
          <p className="registrar-list-empty">We couldn’t load the list of registrars. Refresh the page to try again.</p>
        ) : loaded ? (
          <ul className="registrar-list">
            {providers.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="registrar-list-empty">Loading the list of registrars…</p>
        )}
      </div>
    </section>
  );
}
