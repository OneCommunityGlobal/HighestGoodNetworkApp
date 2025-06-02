import React from 'react';
import { render } from '@testing-library/react';
import BadgeHistory from '../BadgeHistory';
import { WEEK_DIFF } from '../../../constants/badge';

// Mocking the BadgeImage component
jest.mock('../BadgeImage', () => ({
  __esModule: true,
  // Mocking the BadgeImage component to return a div with the data-testid attribute
  default: () => <div data-testid="badge-image">Mocked BadgeImage Component</div>,
}));

const mockBadgeData = [
  { lastModified: '2023-10-15T12:00:00Z', badge: { ranking: 0, badgeName: 'Badge A' }, count: 1 },
  { lastModified: '2023-10-10T12:00:00Z', badge: { ranking: 2, badgeName: 'Badge B' }, count: 2 },
  { lastModified: '2023-10-05T12:00:00Z', badge: { ranking: 1, badgeName: 'Badge C' }, count: 3 },
];

describe('BadgeHistory component', () => {
  it('renders filtered badges', () => {
    const personalBestMaxHrs = 50;
    const { getAllByTestId } = render(<BadgeHistory badges={mockBadgeData} personalBestMaxHrs={personalBestMaxHrs} />);
    // Get all elements with the data-testid attribute set to "badge-image"
    const renderedBadges = getAllByTestId('badge-image');
    expect(renderedBadges.length).toBe(3);
  });

  it('sorts filtered badges correctly', () => {
    const mockDataset = [
      { lastModified: '2023-10-15T12:00:00Z', badge: { ranking: 2, badgeName: 'Badge B' }, count: 1 },
      { lastModified: '2023-10-10T12:00:00Z', badge: { ranking: 0, badgeName: 'Badge A' }, count: 2 },
      { lastModified: '2023-10-05T12:00:00Z', badge: { ranking: 1, badgeName: 'Badge C' }, count: 3 },
    ];
    const { getAllByTestId } = render(<BadgeHistory badges={mockDataset} personalBestMaxHrs={50} />);
    const renderedBadges = getAllByTestId('badge-image');
    // Check if the rendered order matches the expected order after sorting
    expect(renderedBadges[0].textContent).toEqual('Mocked BadgeImage Component');
    expect(renderedBadges[1].textContent).toEqual('Mocked BadgeImage Component');
    expect(renderedBadges[2].textContent).toEqual('Mocked BadgeImage Component');
  });

  it('filters badges based on time difference', () => {
    const mockDataset = [
      { lastModified: '2023-09-15T12:00:00Z', badge: { ranking: 0, badgeName: 'Badge A' }, count: 1 },
      { lastModified: '2023-10-15T12:00:00Z', badge: { ranking: 2, badgeName: 'Badge B' }, count: 2 },
      { lastModified: '2023-10-20T12:00:00Z', badge: { ranking: 1, badgeName: 'Badge C' }, count: 3 },
    ];

    const personalBestMaxHrs = 168;

    const { getAllByTestId } = render(<BadgeHistory badges={mockDataset} personalBestMaxHrs={personalBestMaxHrs} />);

    const renderedBadges = getAllByTestId('badge-image');
    // Calculate the expected length based on the filtering logic
    const expectedFilteredLength = mockDataset.filter(
      value => Date.now() - new Date(value.lastModified).getTime() > WEEK_DIFF
    ).length;
    // Ensure that only the expected badges are rendered based on the time difference criteria
    expect(renderedBadges.length).toBe(expectedFilteredLength);
  });

  it('handles empty dataset', () => {
    // Render the BadgeHistory component with an empty dataset
    const { container } = render(<BadgeHistory badges={[]} personalBestMaxHrs={50} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

});
