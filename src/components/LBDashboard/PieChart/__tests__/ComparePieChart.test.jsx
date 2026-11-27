import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ComparePieChart } from '../ComparePieChart';

const typeSelect = () => screen.getByLabelText('Select listing type filter');
const option = name => screen.getByRole('option', { name });

const renderPie = (props = {}) =>
  render(<ComparePieChart selectedMetricKey="pageVisits" listingType="all" {...props} />);

describe('ComparePieChart Type filter sync', () => {
  it('starts from the parent listingType', () => {
    renderPie({ listingType: 'bidding' });
    expect(typeSelect()).toHaveValue('bidding');
  });

  it('lets the user override locally, then the parent takes over again when it changes', () => {
    const { rerender } = renderPie();
    fireEvent.change(typeSelect(), { target: { value: 'listing' } });
    expect(typeSelect()).toHaveValue('listing');

    rerender(<ComparePieChart selectedMetricKey="pageVisits" listingType="bidding" />);
    expect(typeSelect()).toHaveValue('bidding');
  });

  it('disables Listing for bidding-only metrics', () => {
    renderPie({ selectedMetricKey: 'numBids' });
    expect(option('Listing')).toBeDisabled();
    expect(option('Bidding')).not.toBeDisabled();
  });

  it('falls back to the parent value when a bidding-only metric is picked while on Listing', () => {
    const { rerender } = renderPie();
    fireEvent.change(typeSelect(), { target: { value: 'listing' } });

    rerender(<ComparePieChart selectedMetricKey="avgBid" listingType="all" />);
    expect(typeSelect()).toHaveValue('all');
  });

  it('disables Bidding when the parent filter is Listing', () => {
    renderPie({ listingType: 'listing' });
    expect(option('Bidding')).toBeDisabled();
  });
});
