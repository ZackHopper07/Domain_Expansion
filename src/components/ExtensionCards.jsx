import './ExtensionCards.css';

const EXTENSIONS = [
  { tld: 'com', title: 'The one people type by default', body: 'Most trusted and most remembered. Worth checking first for any business.' },
  { tld: 'io', title: 'Popular with tech startups', body: 'Short, modern, and easier to find free names. Usually costs more to renew.' },
  { tld: 'ai', title: 'For AI products', body: 'In demand, so prices run high. Compare renewals before you commit.' },
  { tld: 'co', title: 'Short for company', body: 'A clean alternative when the .com is taken.' },
  { tld: 'app', title: 'Built for apps', body: 'Requires HTTPS, so your site is secure by default.' },
  { tld: 'net', title: 'The classic backup', body: 'Widely recognized and usually priced close to .com.' },
];

export default function ExtensionCards({ onPick }) {
  return (
    <section className="section" id="extensions" aria-labelledby="ext-title">
      <div className="container">
        <div className="section-head">
          <h2 id="ext-title">Pick an extension, then compare</h2>
          <p>The same name can cost very different amounts depending on its ending. Choose one to check it now.</p>
        </div>

        <ul className="ext-grid">
          {EXTENSIONS.map((e) => (
            <li key={e.tld} className="ext-card">
              <p className="ext-tld">.{e.tld}</p>
              <h3>{e.title}</h3>
              <p className="ext-body">{e.body}</p>
              <button type="button" className="btn btn-secondary" onClick={() => onPick(e.tld)}>
                Search .{e.tld}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
