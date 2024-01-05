import NewBadges from 'components/Badge/NewBadges';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockBadges = [
  {
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    count: 1,
    badge: {
      ranking: 3,
      badgeName: 'Early Bird',
      type: 'Regular',
      imageUrl: 'url_for_early_bird_badge',
      description: 'test description',
    },
  },
  {
    lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    count: 5,
    badge: {
      ranking: 2,
      badgeName: 'Challenge Conqueror',
      type: 'Personal Max',
      imageUrl: 'url_for_challenge_conqueror_badge',
      description: 'description test',
    },
  },
];

const mockPersonalBestMaxHrs = 10;

// Test cases
describe('NewBadges component', () => {
  it('renders empty message when no new badges earned', () => {
    render(<NewBadges badges={[]} personalBestMaxHrs={mockPersonalBestMaxHrs} />);
    expect(screen.getByText(/Get yourself a herd of new badges!/)).toBeInTheDocument();
    expect(screen.queryByRole('BadgeImage')).toBeNull();
  });

  it('renders new badges correctly', () => {
    render(<NewBadges badges={mockBadges} personalBestMaxHrs={mockPersonalBestMaxHrs} />);
    expect(screen.getAllByRole('img')).toHaveLength(mockBadges.length);
  });

  it('renders BadgeImage components with correct props', async () => {
    render(<NewBadges badges={mockBadges} personalBestMaxHrs={mockPersonalBestMaxHrs} />);

    const badgeImages = screen.getAllByRole('img');

    expect(badgeImages).toHaveLength(mockBadges.length);

    fireEvent.mouseEnter(badgeImages[0]);

    await waitFor(() => {
      expect(screen.getByText(/Challenge Conqueror/)).toBeInTheDocument();
    });
  });

  it('renders empty message when no new badges are earned', () => {
    const oldMockBadges = [
      {
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        count: 1,
        badge: {
          /*empty badge details */
        },
      },
    ];

    render(<NewBadges badges={oldMockBadges} personalBestMaxHrs={mockPersonalBestMaxHrs} />);
    expect(screen.getByText(/Get yourself a herd of new badges!/)).toBeInTheDocument();
    expect(screen.queryByTestId('badge-image')).toBeNull();
  });

  it('handles invalid badge data gracefully', () => {
    const invalidMockBadges = [{ lastModified: 'invalid-date', count: 1 }];

    const errorSpy = jest.spyOn(console, 'error');
    errorSpy.mockImplementation(() => {});

    render(<NewBadges badges={invalidMockBadges} personalBestMaxHrs={mockPersonalBestMaxHrs} />);

    expect(screen.getByText(/Get yourself a herd of new badges!/)).toBeInTheDocument();
    expect(screen.queryByTestId('badge-image')).toBeNull();

    errorSpy.mockRestore();
  });

  it('filters new badges correctly', async () => {
    render(<NewBadges badges={mockBadges} personalBestMaxHrs={mockPersonalBestMaxHrs} />);
    const badgeImages = screen.getAllByRole('img');

    expect(badgeImages).toHaveLength(2);

    fireEvent.mouseEnter(badgeImages[0]);
    await screen.findByText(/Challenge Conqueror/);
  });
});
