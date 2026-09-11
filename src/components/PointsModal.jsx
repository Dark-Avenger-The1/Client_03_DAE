import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { PESOS_PER_POINT, rulesFor, rewardsFor } from '../data/points';
import './PointsModal.css';

/*
 * The pop-up behind the points chip in the navbar. Both sides of the market
 * open the same panel; only the rules and rewards differ.
 *
 * role: 'buyer' | 'seller'
 */
export default function PointsModal({ role = 'buyer', points = 0, onClose }) {
  const closeRef = useRef(null);

  // Escape closes it, and the page behind must not scroll while it is open.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const rules = rulesFor(role);
  const rewards = rewardsFor(role);
  const isSeller = role === 'seller';

  return (
    <div
      className="points-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="points-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="points-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="points-close"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close"
        >
          ×
        </button>

        <header className="points-modal-head">
          <p className="points-modal-eyebrow">
            {isSeller ? 'Farm rewards' : 'UmaLink rewards'}
          </p>
          <h2 id="points-modal-title">
            {points} <span>{points === 1 ? 'point' : 'points'}</span>
          </h2>
          <p className="points-modal-sub">
            {isSeller
              ? 'Points measure how well you serve an order. They never expire.'
              : `You earn 1 point for every ₱${PESOS_PER_POINT} you spend. They never expire.`}
          </p>
        </header>

        <section className="points-section">
          <h3>How to earn more</h3>
          <ul className="points-rules">
            {rules.map((rule) => (
              <li className="points-rule" key={rule.title}>
                <span className="points-rule-value">{rule.points}</span>
                <div className="points-rule-body">
                  <p className="points-rule-title">
                    {rule.title}
                    {rule.live && <span className="points-rule-live">Live now</span>}
                  </p>
                  <p className="points-rule-detail">{rule.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="points-section">
          <h3>What points are worth</h3>
          <ul className="points-rewards">
            {rewards.map((reward) => (
              <li key={reward}>{reward}</li>
            ))}
          </ul>
        </section>

        {!isSeller && (
          <Link to="/combos" className="points-cta" onClick={onClose}>
            See the combos earning bonus points
          </Link>
        )}
      </div>
    </div>
  );
}
