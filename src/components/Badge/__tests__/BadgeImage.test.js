import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BadgeImage from '../BadgeImage';

describe('BadgeImage Component', () => {
  const mockBadgeData = {
    imageUrl: 'test_image_url',
    badgeName: 'Test Badge',
    description: 'This is a test description.',
    type: 'Personal Max'
  };
  const mockProps = {
    badgeData: mockBadgeData,
    time: '123',
    index: 1,
    personalBestMaxHrs: 50,
    count: 10
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
  });

});
