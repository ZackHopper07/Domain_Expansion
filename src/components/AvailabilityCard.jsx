import { CheckCircleIcon, XCircleIcon, LockIcon, ClockIcon } from './Icons';
import { cheapestOffer, formatPrice, timeAgo, fullTimestamp } from '../utils/pricing';
import './AvailabilityCard.css';

const STATUS = {
  available: {
    pill: 'pill-available',
    Icon: CheckCircleIcon,
    label: 'Available',
    message: (d) => `Good news: ${d} is available to register.`,
  },
  registered: {
    pill: 'pill-taken',
    Icon: XCircleIcon,
    label: 'Taken',
    message: (d) => `${d} is already registered by someone else.`,
  },
  reserved: {
    pill: 'pill-reserved',
    Icon: LockIcon,
    label: 'Reserved',
    message: (d) => `${d} is reserved by the registry and can’t be registered.`,
  },
  unavailable: {
    pill: 'pill-taken',
    Icon: XCircleIcon,
    label: 'Unavailable',
    message: (d) => `${d} can’t be registered right now.`,
  },
};

const UNKNOWN = {
  pill: 'pill-neutral',
  Icon: ClockIcon,
  label: 'Unknown',
  message: (d) => `We couldn’t confirm whether ${d} is available. Try again shortly.`,
};

export default function AvailabilityCard({ result }) {
  const s = STATUS[result.status] || UNKNOWN;
  const best = result.status === 'available' ? cheapestOffer(result.offers, 'registration', 1) : null;

  return (
    <article className="card availability">
      <div className="availability-main">
        <span className={`pill ${s.pill}`}>
          <s.Icon size={18} />
          {s.label}
        </span>
        <p className="availability-domain">{result.domain}</p>
        <p className="availability-msg" role="status">
          {s.message(result.domain)}
        </p>
      </div>

      <div className="availability-side">
        {best && (
          <div className="best-price">
            <p className="best-label">Lowest first-year price</p>
            <p className="best-amount tabular">{formatPrice(best.registration_price, best.currency)}</p>
            <p className="best-source">
              at {best.registrar}
              {best.is_promotional && best.renewal_price != null && (
                <>, then {formatPrice(best.renewal_price, best.currency)}/yr</>
              )}
            </p>
          </div>
        )}
        {result.checked_at && (
          <p className="checked-at">
            <ClockIcon size={16} />
            <span>
              Checked <time dateTime={result.checked_at} title={fullTimestamp(result.checked_at)}>{timeAgo(result.checked_at)}</time>
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
