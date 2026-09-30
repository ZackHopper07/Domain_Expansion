import { USE_MOCK } from '../api/client';
import { DEMO_REGISTRARS } from '../api/mock';
import './RegistrarsStrip.css';

export default function RegistrarsStrip() {
  return (
    <section className="section registrars" id="registrars" aria-labelledby="reg-title">
      <div className="container registrars-inner">
        <div>
          <h2 id="reg-title">Registrars we compare</h2>
          <p>
            {USE_MOCK
              ? 'These are sample registrars for the demo. Real registrars appear here once our live connections are ready.'
              : 'We add registrars as we connect to their official price and availability services.'}
          </p>
        </div>

        <ul className="registrar-list">
          {DEMO_REGISTRARS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
