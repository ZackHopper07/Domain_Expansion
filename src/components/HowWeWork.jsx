import { ClockIcon, ScaleIcon, ShieldIcon } from './Icons';
import './HowWeWork.css';

const STEPS = [
  { title: 'You search for a name', body: 'Type the domain you want. We tidy it up, so pasting a full web address works too.' },
  { title: 'We check if it’s free', body: 'We ask the registry and registrars whether the name is available, taken or reserved.' },
  { title: 'We line up the prices', body: 'First-year, renewal and transfer prices from each registrar, converted into one format and sorted.' },
  { title: 'We suggest alternatives', body: 'If your name is taken, we suggest close variations and check each one before showing it.' },
];

const PROMISES = [
  {
    Icon: ShieldIcon,
    title: 'We never make up a price',
    body: 'If a registrar doesn’t answer, we say so. We don’t fill the gap with a guess.',
  },
  {
    Icon: ClockIcon,
    title: 'Every price shows its age',
    body: 'Each price shows when it was last checked, so you know how fresh it is.',
  },
  {
    Icon: ScaleIcon,
    title: 'We don’t sell domains',
    body: 'We compare and you buy directly from the registrar you choose. No markup from us.',
  },
];

export default function HowWeWork() {
  return (
    <section className="section how" id="how-we-work" aria-labelledby="how-title">
      <div className="container">
        <div className="section-head">
          <h2 id="how-title">How we work</h2>
          <p>Registrars show a low first-year price and a higher renewal price. We put all of it on one page.</p>
        </div>

        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-num" aria-hidden="true">
                <span>{i + 1}</span>
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>

        <ul className="promises">
          {PROMISES.map(({ Icon, title, body }) => (
            <li key={title}>
              <span className="promise-icon">
                <Icon size={22} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
