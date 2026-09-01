import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedBadges from '../FeaturedBadges';
import mockProps from '../__mocks__/mockData'

const createBadge = ({ id, name, ranking, count, featured = true }) => ({
  _id: id,
  count,
  featured,
  badge: {
    _id: `badge-${id}`,
    badgeName: name,
    ranking,
    imageUrl: 'https://example.com/badge.png',
    description: `${name} description`,
    type: 'Hours',
  },
});

describe('FeaturedBadges Component', () => {
  it('renders correctly with badges data', () => {
    render(<FeaturedBadges {...mockProps} />);
    expect(screen.getByTestId('badge_featured_container')).toBeInTheDocument();
  });

  it('sort the badge image correctly', () => {
    const { getAllByTestId } = render(<FeaturedBadges {...mockProps} />);
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const displayedBadges = getAllByTestId('badge_featured_count');

    expect(displayedBadges[0]).toHaveTextContent('4');
    expect(displayedBadges[1]).toHaveTextContent('11');
    expect(displayedBadges[2]).toHaveTextContent('1');
  });

  it('renders only the five highest-priority featured badges and ignores malformed records', () => {
    const badges = [
      createBadge({ id: 'six', name: 'Six', ranking: 6, count: 6 }),
      createBadge({ id: 'two', name: 'Two', ranking: 2, count: 2 }),
      createBadge({ id: 'one', name: 'One', ranking: 1, count: 1 }),
      createBadge({ id: 'five', name: 'Five', ranking: 5, count: 5 }),
      createBadge({ id: 'three', name: 'Three', ranking: 3, count: 3 }),
      createBadge({ id: 'four', name: 'Four', ranking: 4, count: 4 }),
      createBadge({ id: 'hidden', name: 'Hidden', ranking: 0, count: 99, featured: false }),
      null,
      { featured: true },
    ];

    render(<FeaturedBadges badges={badges} personalBestMaxHrs={40} />);

    expect(screen.getAllByTestId('badge_featured_count').map(badge => badge.textContent)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
    ]);
  });

  it('updates the rendered featured badges when the collection changes', () => {
    const firstBadges = [createBadge({ id: 'first', name: 'First', ranking: 1, count: 1 })];
    const secondBadges = [createBadge({ id: 'second', name: 'Second', ranking: 1, count: 2 })];
    const { rerender } = render(
      <FeaturedBadges badges={firstBadges} personalBestMaxHrs={40} />,
    );

    expect(screen.getByTestId('badge_featured_count')).toHaveTextContent('1');

    rerender(<FeaturedBadges badges={secondBadges} personalBestMaxHrs={40} />);

    expect(screen.getByTestId('badge_featured_count')).toHaveTextContent('2');
  });
});
