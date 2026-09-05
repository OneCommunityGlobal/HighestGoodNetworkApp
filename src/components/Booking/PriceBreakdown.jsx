import React from 'react';
import styles from './booking.module.css';

const money = n => `$${(n || 0).toFixed(2)}`;

export default function PriceBreakdown({ nightly, nights, subtotal, tax, fees, total }) {
  return (
    <div className={styles.bookingCard}>
      <h3 className={styles.bookingH3}>Price</h3>
      <div className={styles.priceRow}>
        <span>
          {money(nightly)} × {nights} night{nights === 1 ? '' : 's'}
        </span>
        <span>{money(subtotal)}</span>
      </div>
      <div className={styles.priceRow}>
        <span>Taxes</span>
        <span>{money(tax)}</span>
      </div>
      <div className={styles.priceRow}>
        <span>Fees</span>
        <span>{money(fees)}</span>
      </div>
      <div className={styles.priceTotal}>
        <span>Total</span>
        <span>{money(total)}</span>
      </div>
    </div>
  );
}
