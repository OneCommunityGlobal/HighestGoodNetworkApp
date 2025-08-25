import React from 'react';
import './booking.css';

const money = n => `$${(n || 0).toFixed(2)}`;

export default function PriceBreakdown({ nightly, nights, subtotal, tax, fees, total }) {
  return (
    <div className="booking-card">
      <h3 className="booking-h3">Price</h3>
      <div className="price-row">
        <span>
          {money(nightly)} × {nights} night{nights === 1 ? '' : 's'}
        </span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="price-row">
        <span>Taxes</span>
        <span>{money(tax)}</span>
      </div>
      <div className="price-row">
        <span>Fees</span>
        <span>{money(fees)}</span>
      </div>
      <div className="price-total">
        <span>Total</span>
        <span>{money(total)}</span>
      </div>
    </div>
  );
}
