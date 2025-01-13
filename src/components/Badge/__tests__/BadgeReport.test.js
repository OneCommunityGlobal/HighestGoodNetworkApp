import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BadgeReport from '../BadgeReport';
import { UncontrolledTooltip } from 'reactstrap';
import { formatDate } from 'utils/formatDate';

jest.mock('react-redux', () => ({
  connect: () => component => component,
}));

let mockBadges = [
  {
    badge: {
      badgeName: 'test name 1',
      description: 'test desc 2',
      imageUrl: 'tes url 1',
      ranking: 1,
      showReport: null,
      type: 'test type 1',
      _id: 'test id 1',
    },
    count: 7,
    earnedDate: ['Mar-28-24', 'Apr-16-24', 'May-13-24', 'May-13-24', 'May-13-24', 'May-13-24'],
    featured: false,
    hasBadgeDeletionImpact: false,
    lastModified: '2024-04-16T16:15:49.158Z',
    _id: '664254c72adc89187008ac77',
  },
];
const mockRole = 'Owner';
const mockHasPermission = jest.fn();

describe('BadgeReport Component', () => {
  test('renders component without any errors', () => {
    render(<BadgeReport badges={mockBadges} hasPermission={mockHasPermission} role={mockRole} />);
  });

  test('renders all the core static fields proplerly', () => {
    render(<BadgeReport badges={mockBadges} hasPermission={mockHasPermission} role={mockRole} />);

    //common headers in desktop and mobile view
    const badgeHeaders = screen.getAllByText('Badge');
    const nameHeaders = screen.getAllByText('Name');
    const modifiedHeaders = screen.getAllByText('Modified');
    expect(badgeHeaders).toHaveLength(2);
    expect(nameHeaders).toHaveLength(2);
    expect(modifiedHeaders).toHaveLength(2);

    //headers only in desktop view
    expect(screen.getByText('Earned Dates')).toBeInTheDocument();
    const countHeaders = screen.getAllByText('Count');
    expect(countHeaders).toHaveLength(2);
    const featuredHeaders = screen.getAllByText('Featured');
    expect(featuredHeaders).toHaveLength(2);

  });

  test('renders all mobile view specific fields properly', () => {
    render(<BadgeReport badges={mockBadges} hasPermission={mockHasPermission} role={mockRole} />);

    const optionsField = screen.getByText('Options');
    expect(optionsField).toBeInTheDocument();

    optionsField.click();
    const countText = screen.getAllByText('Count:');
    expect(countText).toHaveLength(1);
    expect(screen.getByText('Featured:')).toBeInTheDocument();
  });

  test('renders correct message if no badges are present', () => {
    render(<BadgeReport badges={[]} hasPermission={mockHasPermission} />);

    const noBadgesPlaceHolder = screen.getAllByText('This person has no badges.');

    //length 2 for desktop view and mobile view
    expect(noBadgesPlaceHolder).toHaveLength(2);
  });

  test('renders all the badge information correctly', () => {
    render(<BadgeReport badges={mockBadges} hasPermission={mockHasPermission} />);

    mockBadges.forEach((mockBadge, index) => {
      const badgeName = mockBadge.badge.badgeName;
      const badgeModifiedDate = mockBadge.lastModified;
      const badgeCount = mockBadge.count;

      expect(screen.getAllByText(badgeName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(formatDate(badgeModifiedDate)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(badgeCount).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });
  });

  test('test for multiple badges', () => {
    mockBadges = [
      ...mockBadges,
      {
        badge: {
          badgeName: 'test name 2',
          description: 'test desc 2',
          imageUrl: 'test url 2',
          ranking: 1,
          showReport: null,
          type: 'test type 2',
          _id: 'test id',
        },
        count: 5,
        earnedDate: ['May-15-24'],
        featured: false,
        hasBadgeDeletionImpact: false,
        lastModified: '2024-04-16T16:15:49.158Z',
        _id: '664254c72adc89187008ac78',
      },
    ];

    render(<BadgeReport badges={mockBadges} hasPermission={mockHasPermission} />);

    mockBadges.forEach((mockBadge, index) => {
      const badgeName = mockBadge.badge.badgeName;
      const badgeModifiedDate = mockBadge.lastModified;
      const badgeCount = mockBadge.count;

      expect(screen.getAllByText(badgeName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(formatDate(badgeModifiedDate)).length).toBeGreaterThan(0);
      expect(screen.getAllByText(badgeCount).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    });
  });
});
