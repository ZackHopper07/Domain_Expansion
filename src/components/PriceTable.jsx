import { useMemo, useState } from 'react';
import { cheapestOffer, formatPrice, metricValue, sortOffers, timeAgo, fullTimestamp } from '../utils/pricing';
import { AlertIcon, ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, CheckIcon, InfoIcon } from './Icons';
import './PriceTable.css';

const YEAR_OPTIONS = [1, 2, 3, 5];

const CHEAPEST_LABEL = {
  registration: 'Cheapest first year',
  renewal: 'Cheapest renewal',
  transfer: 'Cheapest transfer',
  total: 'Cheapest overall',
};

export default function PriceTable({ result }) {
  const canRegister = result.status === 'available';
  const [years, setYears] = useState(3);
  const [sort, setSort] = useState({ metric: canRegister ? 'total' : 'renewal', dir: 'asc' });

  const columns = useMemo(() => {
    const cols = [];
    if (canRegister) cols.push({ metric: 'registration', label: 'First year' });
    cols.push({ metric: 'renewal', label: 'Renewal / yr' });
    cols.push({ metric: 'transfer', label: 'Transfer' });
    if (canRegister) cols.push({ metric: 'total', label: `${years}-year total` });
    return cols;
  }, [canRegister, years]);

  const rows = useMemo(() => sortOffers(result.offers, sort.metric, years, sort.dir), [result.offers, sort, years]);
  const cheapest = useMemo(() => cheapestOffer(result.offers, sort.metric, years), [result.offers, sort.metric, years]);

  const toggleSort = (metric) =>
    setSort((s) => (s.metric === metric ? { metric, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { metric, dir: 'asc' }));

  const sortLabel = columns.find((c) => c.metric === sort.metric)?.label;

  return (
    <article className="card price-card" aria-labelledby="price-title">
      <div className="price-head">
        <div>
          <h3 id="price-title" className="card-title">
            Compare registrar prices
          </h3>
          <p className="card-sub">
            {result.offers.length} registrar{result.offers.length === 1 ? '' : 's'} checked. Sorted by{' '}
            {sortLabel?.toLowerCase()}, {sort.dir === 'asc' ? 'lowest' : 'highest'} first.
          </p>
        </div>

        <div className="price-controls">
          {canRegister && (
            <label className="control">
              <span>Total cost over</span>
              <select value={years} onChange={(e) => setYears(Number(e.target.value))}>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y} year{y > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="control control-sort">
            <span>Sort by</span>
            <select value={sort.metric} onChange={(e) => setSort({ metric: e.target.value, dir: 'asc' })}>
              {columns.map((c) => (
                <option key={c.metric} value={c.metric}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!canRegister && (
        <p className="note note-info">
          <InfoIcon size={18} />
          <span>
            This name can’t be registered, so first-year prices aren’t shown. If you already own it, compare renewal
            and transfer prices below.
          </span>
        </p>
      )}

      {rows.length > 0 ? (
        <div className="table-wrap">
          <table className="price-table">
            <caption className="sr-only">
              Prices for {result.domain} by registrar, in US dollars. Sorted by {sortLabel}.
            </caption>
            <thead>
              <tr>
                <th scope="col">Registrar</th>
                {columns.map((c) => {
                  const active = sort.metric === c.metric;
                  const SortIcon = !active ? ArrowUpDownIcon : sort.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
                  return (
                    <th
                      key={c.metric}
                      scope="col"
                      className="num"
                      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <button type="button" className={`sort-btn ${active ? 'is-active' : ''}`} onClick={() => toggleSort(c.metric)}>
                        {c.label}
                        <SortIcon size={16} />
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="num">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const isBest = cheapest && o.registrar === cheapest.registrar;
                return (
                  <tr key={o.registrar} className={isBest ? 'is-best' : undefined}>
                    <th scope="row" className="registrar-cell">
                      <span className="registrar-name">{o.registrar}</span>
                      {isBest && (
                        <span className="tag-cheapest">
                          <span>
                            <CheckIcon size={13} strokeWidth={3} />
                            {CHEAPEST_LABEL[sort.metric]}
                          </span>
                        </span>
                      )}
                    </th>
                    {columns.map((c) => (
                      <td key={c.metric} className="num" data-label={c.label}>
                        <PriceCell offer={o} metric={c.metric} years={years} />
                      </td>
                    ))}
                    <td className="num updated" data-label="Updated">
                      {o.updated_at ? (
                        <time dateTime={o.updated_at} title={fullTimestamp(o.updated_at)}>
                          {timeAgo(o.updated_at)}
                        </time>
                      ) : (
                        <span className="missing">Unknown</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="note note-warn">
          <AlertIcon size={18} />
          <span>No registrar returned prices for this domain. Try again in a few minutes.</span>
        </p>
      )}

      {result.errors?.length > 0 && (
        <div className="note note-warn provider-errors" role="status">
          <AlertIcon size={18} />
          <div>
            <p>
              <strong>Some registrars didn’t respond,</strong> so their prices are missing. We don’t guess prices we
              couldn’t check.
            </p>
            <ul>
              {result.errors.map((e) => (
                <li key={e.registrar}>
                  {e.registrar}: {e.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="price-foot">
        Prices in US dollars, before tax. Confirm the final price on the registrar’s site before you buy.
        {result.source === 'demo' && ' Source: sample demo data.'}
      </p>
    </article>
  );
}

function PriceCell({ offer, metric, years }) {
  const value = metricValue(offer, metric, years);
  if (value == null) {
    const reason = metric === 'total' ? 'Needs renewal price' : 'Not offered';
    return <span className="missing">{reason}</span>;
  }
  return (
    <span className="price">
      <span className="tabular">{formatPrice(value, offer.currency)}</span>
      {metric === 'registration' && offer.is_promotional && (
        <span className="intro" title="Introductory price. Renewals cost more.">
          Intro price
        </span>
      )}
      {metric === 'total' && years > 1 && <span className="per-yr tabular">{formatPrice(value / years, offer.currency)}/yr avg</span>}
    </span>
  );
}
