import './PromiseTicker.css';

// Short reasons to use the site, pulled from the promises in "How we work".
// The headline line repeats between them, like a chorus.
const HEADLINE = 'Why PriceMyDomain?';
const PHRASES = [
  ['Every registrar, one search', 'Renewal prices up front'],
  ['We never make up a price', 'No markup from us'],
  ['Every price shows its age', 'Buy direct from the registrar'],
];

// One pass of the loop. Repeated twice inside each group so the band
// stays full on very wide screens.
const ITEMS = [...PHRASES, ...PHRASES].flatMap((pair) => [HEADLINE, ...pair]);

function Group() {
  return (
    <ul className="ticker-group">
      {ITEMS.map((text, i) => (
        <li key={i} className={text === HEADLINE ? 'ticker-item is-headline' : 'ticker-item'}>
          {text}
        </li>
      ))}
    </ul>
  );
}

export default function PromiseTicker() {
  return (
    <section className="ticker" aria-label="Why use PriceMyDomain">
      {/* Screen readers get the list once, without the repeats. */}
      <ul className="sr-only">
        {PHRASES.flat().map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>

      <div className="ticker-track" aria-hidden="true">
        <Group />
        <Group />
      </div>
    </section>
  );
}
