import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OldBadges from '../OldBadges';
import userEvent from '@testing-library/user-event';

const badges = [
  {
    badge: {
      type: 'Most Hrs in Week',
      _id: 'abc123',
      badgeName: 'Most Hours in A Week',
      ranking: 2,
      imageUrl: 'http://www.image.com/image1',
    },
    count: 1,
    earnedDate: ['2023-11-06'],
    featured: false,
    lastModified: '2023-11-06T22:08:30.000Z',
    _id: '1',
  },
  {
    badge: {
      type: 'X Hours for X Week Streak',
      _id: 'def123',
      badgeName: '40-Hours Streak 200 Weeks in a Row',
      ranking: 1,
      imageUrl: 'http://www.image.com/image2',
    },
    count: 2,
    earnedDate: ['2023-11-01', '2023-11-23'],
    featured: true,
    lastModified: '2023-11-23T22:08:30.000Z',
    _id: '2',
  },
];

describe('Old Badges component', () => {
  it('renders without crashing', () => {
    render(<OldBadges personalBestMaxHrs={25} badges={badges} />);
  });

  it('shows and hides tooltip correctly', async () => {
    render(<OldBadges personalBestMaxHrs={25} badges={badges} darkMode={true} />);

    // Find the tooltip trigger element (info icon)
    const toolTipElement = screen.getByTestId('old-badge-info-icon');

    // Hover over the tooltip trigger
    await userEvent.hover(toolTipElement);

    // Wait for tooltip content to appear
    await screen.findByText(
      'Holy Awesome, these are all the badges you earned before last week!!! Click "Full View" to bask in the glory of your COMPLETE LIST!',
    );
    expect(
      screen.getByText(
        'Have a number bigger than "1" in the bottom righthand corner of a badge? That\'s how many times you\'ve earned the same badge! Do your Happy Dance you Champion!!',
      ),
    ).toBeInTheDocument();

    // Unhover to hide tooltip
    await userEvent.unhover(toolTipElement);

    // Wait for tooltip content to disappear
    await waitFor(() =>
      expect(
        screen.queryByText(
          'Holy Awesome, these are all the badges you earned before last week!!! Click "Full View" to bask in the glory of your COMPLETE LIST!',
        ),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.queryByText(
          'Have a number bigger than "1" in the bottom righthand corner of a badge? That\'s how many times you\'ve earned the same badge! Do your Happy Dance you Champion!!',
        ),
      ).not.toBeInTheDocument(),
    );
  });

  it('check Badges Earned Before Last Week heading', () => {
    render(<OldBadges personalBestMaxHrs={10} badges={badges} darkMode={true} />);
    expect(screen.getByText('Badges Earned Before Last Week')).toBeInTheDocument();
  });
});
