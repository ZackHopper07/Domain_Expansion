import { useEffect, useMemo, useRef, useState } from 'react';
import { getPriceHistory } from '../api/client';
import { formatPrice } from '../utils/pricing';
import { AlertIcon, ChartIcon, RefreshIcon, TableIcon } from './Icons';
import './PriceHistory.css';

const W = 720;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 32, left: 56 };

const monthLabel = (iso, opts = { month: 'short' }) => new Date(iso).toLocaleDateString('en-US', opts);

function niceTicks(min, max, count = 4) {
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
  const start = Math.floor(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + step * 0.5; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

export default function PriceHistory({ domain, tld }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState('chart');

  useEffect(() => {
    let active = true;
    getPriceHistory(domain)
      .then((data) => active && setState({ status: 'success', data, error: null }))
      .catch((err) => active && setState({ status: 'error', data: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [domain, attempt]);

  const points = useMemo(() => state.data?.points ?? [], [state.data]);
  const currency = state.data?.currency ?? 'USD';

  const summary = useMemo(() => {
    if (points.length < 2) return null;
    const prices = points.map((p) => p.price);
    const first = prices[0];
    const last = prices[prices.length - 1];
    return {
      last,
      low: Math.min(...prices),
      high: Math.max(...prices),
      change: ((last - first) / first) * 100,
    };
  }, [points]);

  return (
    <article className="card history" aria-labelledby="history-title" aria-busy={state.status === 'loading'}>
      <div className="history-head">
        <div>
          <h3 id="history-title" className="card-title">
            Price history for .{tld}
          </h3>
          <p className="card-sub">Lowest first-year price across registrars, by month, over the last 12 months.</p>
        </div>
        {state.status === 'success' && points.length > 1 && (
          <div className="view-toggle" role="group" aria-label="Show price history as">
            <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
              <ChartIcon size={16} /> Chart
            </button>
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
              <TableIcon size={16} /> Table
            </button>
          </div>
        )}
      </div>

      {state.status === 'loading' && <div className="skeleton" style={{ height: 260 }} aria-hidden="true" />}

      {state.status === 'error' && (
        <div className="note note-warn">
          <AlertIcon size={18} />
          <span>
            We couldn’t load price history. {state.error}{' '}
            <button type="button" className="link-btn" onClick={() => {
                setState({ status: 'loading', data: null, error: null });
                setAttempt((a) => a + 1);
              }}>
              <RefreshIcon size={15} /> Try again
            </button>
          </span>
        </div>
      )}

      {state.status === 'success' && points.length < 2 && (
        <p className="note note-info">
          <AlertIcon size={18} />
          <span>We don’t have enough saved prices for .{tld} yet. History builds up as people search.</span>
        </p>
      )}

      {summary && (
        <dl className="history-stats">
          <div>
            <dt>This month</dt>
            <dd className="tabular">{formatPrice(summary.last, currency)}</dd>
          </div>
          <div>
            <dt>12-month low</dt>
            <dd className="tabular">{formatPrice(summary.low, currency)}</dd>
          </div>
          <div>
            <dt>12-month high</dt>
            <dd className="tabular">{formatPrice(summary.high, currency)}</dd>
          </div>
          <div>
            <dt>Change over the year</dt>
            <dd className="tabular">
              {summary.change > 0 ? '+' : ''}
              {summary.change.toFixed(1)}%
            </dd>
          </div>
        </dl>
      )}

      {summary && view === 'chart' && <LineChart points={points} currency={currency} tld={tld} summary={summary} />}

      {summary && view === 'table' && (
        <div className="history-table-wrap">
          <table className="history-table">
            <caption className="sr-only">Lowest monthly first-year price for .{tld}</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="num">
                  Lowest first-year price
                </th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date}>
                  <th scope="row">{monthLabel(p.date, { month: 'long', year: 'numeric' })}</th>
                  <td className="num tabular">{formatPrice(p.price, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.data?.source === 'demo' && <p className="price-foot">Source: sample demo data.</p>}
    </article>
  );
}

function LineChart({ points, currency, tld, summary }) {
  const [active, setActive] = useState(null);
  const svgRef = useRef(null);

  const { coords, ticks, y } = useMemo(() => {
    const prices = points.map((p) => p.price);
    const ticks = niceTicks(Math.min(...prices) * 0.92, Math.max(...prices) * 1.04);
    const lo = ticks[0];
    const hi = ticks[ticks.length - 1];
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const y = (v) => PAD.top + innerH - ((v - lo) / (hi - lo)) * innerH;
    const coords = points.map((p, i) => ({
      x: PAD.left + (i / (points.length - 1)) * innerW,
      y: y(p.price),
      ...p,
    }));
    return { coords, ticks, y };
  }, [points]);

  const path = coords.map((c, i) => `${i ? 'L' : 'M'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

  const pickFromPointer = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    coords.forEach((c, i) => {
      if (Math.abs(c.x - x) < Math.abs(coords[nearest].x - x)) nearest = i;
    });
    setActive(nearest);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      setActive((a) => Math.min(coords.length - 1, Math.max(0, (a ?? (dir > 0 ? -1 : coords.length)) + dir)));
    } else if (e.key === 'Escape') {
      setActive(null);
    }
  };

  const point = active != null ? coords[active] : null;
  const summaryText = `Line chart. The lowest .${tld} first-year price ranged from ${formatPrice(summary.low, currency)} to ${formatPrice(summary.high, currency)} over 12 months and is ${formatPrice(summary.last, currency)} this month. Use the left and right arrow keys to read each month.`;

  return (
    <div className="chart-wrap">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="chart"
        role="img"
        aria-label={summaryText}
        tabIndex={0}
        onPointerMove={pickFromPointer}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PAD.left - 10} y={y(t)} className="axis-label" textAnchor="end" dominantBaseline="middle">
              {formatPrice(t, currency).replace(/\.00$/, '')}
            </text>
          </g>
        ))}

        {coords.map((c, i) => (
          <text
            key={c.date}
            x={c.x}
            y={H - 8}
            className={`axis-label ${i % 2 ? 'odd' : ''}`}
            textAnchor={i === 0 ? 'start' : i === coords.length - 1 ? 'end' : 'middle'}
          >
            {monthLabel(c.date)}
          </text>
        ))}

        <path d={path} className="line" />

        {point && (
          <g>
            <line x1={point.x} x2={point.x} y1={PAD.top} y2={H - PAD.bottom} className="crosshair" />
            <circle cx={point.x} cy={point.y} r="6" className="marker" />
          </g>
        )}
      </svg>

      {point && (
        <div
          className={`chart-tip ${point.x > W * 0.7 ? 'flip' : ''}`}
          style={{ left: `${(point.x / W) * 100}%`, top: `${(point.y / H) * 100}%` }}
          aria-live="polite"
        >
          <span className="tip-month">{monthLabel(point.date, { month: 'long', year: 'numeric' })}</span>
          <span className="tip-price tabular">{formatPrice(point.price, currency)}</span>
        </div>
      )}
    </div>
  );
}
