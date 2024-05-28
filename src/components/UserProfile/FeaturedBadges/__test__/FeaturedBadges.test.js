import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedBadges from '../FeaturedBadges';
import mockProps from './mockData'

describe('FeaturedBadges Component', () => {
  it('renders correctly with badges data', () => {
    render(<FeaturedBadges {...mockProps} />);
    expect(screen.getByTestId('badge_featured_container')).toBeInTheDocument();
  });

  it('sort the badge image correctly', () => {
    const { getAllByTestId } = render(<FeaturedBadges {...mockProps} />);
    const displayedBadges = getAllByTestId('badge_featured_count');

    expect(displayedBadges[0]).toHaveTextContent('4');
    expect(displayedBadges[1]).toHaveTextContent('11');
    expect(displayedBadges[2]).toHaveTextContent('1');
  });
});
