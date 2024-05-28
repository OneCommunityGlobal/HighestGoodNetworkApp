import NewBadges from 'components/Badge/NewBadges';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// modifications and changes based on last pr #1783
const mockBadges = [
  {
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    count: 1,
    badge: {
      ranking: 1,
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

  {
    lastModified: new Date().toISOString(),
    count: 1,
    badge: {
      ranking: 3,
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
    render(<NewBadges badges={[]} personalBestMaxHrs={mockPersonalBestMaxHrs} darkMode={false} />);
    expect(screen.getByText(/Get yourself a herd of new badges!/)).toBeInTheDocument();
    expect(screen.queryByRole('BadgeImage')).toBeNull();
  });

  it('renders new badges correctly', () => {
    render(
      <NewBadges
        badges={mockBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );
    const badgeImages = screen.getAllByRole('img');

    expect(badgeImages).toHaveLength(mockBadges.length);

    mockBadges.forEach(async (badge, index) => {
      fireEvent.mouseEnter(badgeImages[index]);
      await waitFor(() => {
        expect(screen.getByText(badge.badge.badgeName)).toBeInTheDocument();
        expect(screen.getByText(badge.badge.description)).toBeInTheDocument();
      });
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

    render(
      <NewBadges
        badges={oldMockBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );
    expect(screen.getByText(/Get yourself a herd of new badges!/)).toBeInTheDocument();
    expect(screen.queryByTestId('badge-image')).toBeNull();
  });

  it('empty message not present when badges are present', () => {
    const presentBadges = [
      {
        lastModified: new Date().toISOString(),
        count: 1,
        badge: {
          ranking: 3,
          badgeName: 'Challenge Conqueror',
          type: 'Personal Max',
          imageUrl: 'url_for_challenge_conqueror_badge',
          description: 'description test',
        },
      },
    ];

    render(
      <NewBadges
        badges={presentBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );

    expect(screen.queryByText(/Get yourself a herd of new badges!/)).toBeNull();
  });

  it('handles invalid badge data gracefully', () => {
    const invalidMockBadges = [{ lastModified: 'invalid-date', count: 1 }];

    const errorSpy = jest.spyOn(console, 'error');
    errorSpy.mockImplementation(() => {});

    render(
      <NewBadges
        badges={invalidMockBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );

    expect(screen.getByText(/Get yourself a herd of new badges!/)).toBeInTheDocument();
    expect(screen.queryByTestId('badge-image')).toBeNull();

    errorSpy.mockRestore();
  });

  it('filters new badges correctly', async () => {
    render(
      <NewBadges
        badges={mockBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );
    const badgeImages = screen.getAllByRole('img');

    expect(badgeImages).toHaveLength(3);

    fireEvent.mouseEnter(badgeImages[0]);
    screen.findByText(/Early Bird/);
  });

  it('should filter out badges earned older than a week', async () => {
    const filterBadges = [
      {
        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        count: 1,
        badge: {
          /*empty badge details */
        },
      },
      {
        lastModified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        count: 2,
        badge: {
          /*empty badge details */
        },
      },
      {
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        count: 3,
        badge: {
          /*empty badge details */
        },
      },
    ];

    render(
      <NewBadges
        badges={filterBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );
    const badgeImages = screen.getAllByRole('img');

    expect(badgeImages).toHaveLength(2);
  });

  it('sorting functionalitiies check', () => {
    const sortBadges = [
      {
        lastModified: new Date().toISOString(),
        count: 1,
        badge: {
          ranking: 3,
          badgeName: 'Challenge Conqueror3',
          type: 'Personal Max',
          imageUrl: 'url_for_challenge_conqueror3_badge',
          description: 'description test',
        },
      },
      {
        lastModified: new Date().toISOString(),
        count: 2,
        badge: {
          ranking: 2,
          badgeName: 'Challenge Conqueror2',
          type: 'Personal Max',
          imageUrl: 'url_for_challenge_conqueror2_badge',
          description: 'description test',
        },
      },
      {
        lastModified: new Date().toISOString(),
        count: 3,
        badge: {
          ranking: 1,
          badgeName: 'Challenge Conqueror1',
          type: 'Personal Max',
          imageUrl: 'url_for_challenge_conqueror1_badge',
          description: 'description test',
        },
      },
    ];

    render(
      <NewBadges
        badges={sortBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );

    const badgeImages = screen.getAllByRole('img');

    expect(badgeImages).toHaveLength(sortBadges.length);

    const sortedBadges = [...sortBadges].sort((a, b) => {
      if (a.badge.ranking === 0) return 1;
      if (b.badge.ranking === 0) return -1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;
    });

    sortedBadges.forEach(async (badge, index) => {
      fireEvent.mouseEnter(badgeImages[index]);
      await waitFor(() => {
        expect(screen.getByText(badge.badge.badgeName)).toBeInTheDocument();
        expect(screen.getByText(badge.badge.description)).toBeInTheDocument();
      });
    });
  });

  it('should render correctly when large counts ', () => {
    const largeBadges = [
      {
        lastModified: new Date().toISOString(),
        count: 150,
        badge: {
          ranking: 1,
          badgeName: 'Badge1',
          type: 'Type1',
          imageUrl: 'url_for_badge1',
          description: 'description test',
        },
      },
    ];
    render(
      <NewBadges
        badges={largeBadges}
        personalBestMaxHrs={mockPersonalBestMaxHrs}
        darkMode={false}
      />,
    );

    expect(screen.getByText('150')).toBeInTheDocument();
  });
});
