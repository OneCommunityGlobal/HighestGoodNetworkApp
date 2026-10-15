import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import BadgeImage from '../BadgeImage';
import styles from '../Badge.module.css';

describe('BadgeImage Component', () => {
  const mockBadgeData = {
    imageUrl: 'test_image_url',
    badgeName: 'Test Badge',
    description: 'This is a test description.',
    type: 'Personal Max',
  };
  const mockProps = {
    badgeData: mockBadgeData,
    time: '123',
    index: 1,
    personalBestMaxHrs: 50,
    count: 10,
  };

  test('renders badge image with correct source', () => {
    render(<BadgeImage {...mockProps} />);
    const imageElement = screen.getByRole('img');
    expect(imageElement).toHaveAttribute('src', mockBadgeData.imageUrl);
  });

  test('displays the correct badge count', () => {
    render(<BadgeImage {...mockProps} />);
    const badgeCount = screen.getByText('50');
    expect(badgeCount).toBeInTheDocument();
    expect(badgeCount).toHaveClass(styles.badge_count_personalmax);
  });

  test('uses the standard style for counts below 100', () => {
    render(
      <BadgeImage {...mockProps} badgeData={{ ...mockBadgeData, type: 'Hours' }} count={99} />,
    );

    expect(screen.getByText('99')).toHaveClass(styles.badge_count);
  });

  test('uses the compact style for counts of 100 or more', () => {
    render(
      <BadgeImage {...mockProps} badgeData={{ ...mockBadgeData, type: 'Hours' }} count={100} />,
    );

    expect(screen.getByText('100')).toHaveClass(styles.badge_count_3_digit);
  });
});
