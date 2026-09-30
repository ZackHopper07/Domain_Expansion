import { ChevronIcon } from './Icons';
import './Faq.css';

const FAQS = [
  {
    q: 'Where do your prices come from?',
    a: 'From each registrar’s official services where we have access. Every price shows the registrar it came from and when we last checked it. Prices can change, so confirm on the registrar’s site before you buy.',
  },
  {
    q: 'What’s the difference between first-year, renewal and transfer prices?',
    a: 'First-year is what you pay to register a new domain. Renewal is what you pay each year after that, and it’s often higher. Transfer is what a registrar charges to move a domain you already own to them, and usually includes an extra year.',
  },
  {
    q: 'Why does the cheapest first-year price sometimes cost more over time?',
    a: 'Many registrars offer a low intro price and then charge more to renew. That’s why we show a total cost over several years. Pick the number of years that matches how long you plan to keep the domain.',
  },
  {
    q: 'Can I buy a domain on PriceMyDomain?',
    a: 'No. We only compare. When you’ve picked a registrar, you register the domain with them directly.',
  },
  {
    q: 'Are the suggested alternatives really available?',
    a: 'We only show a suggestion after our availability check confirms it’s free. Someone else could still register it before you do, so don’t wait too long.',
  },
  {
    q: 'What does “reserved” mean?',
    a: 'The registry that runs the extension has held the name back, so nobody can register it through a normal registrar.',
  },
];

export default function Faq() {
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container faq-inner">
        <div className="section-head">
          <h2 id="faq-title">Frequently asked questions</h2>
          <p>Straight answers about how PriceMyDomain works.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <span>{f.q}</span>
                <ChevronIcon size={20} className="faq-chevron" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
