import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OldBadges from '../OldBadges';

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
  it('check tool tip of Badges Earned Before Last Week', async () => {
    const { container } = render(<OldBadges personalBestMaxHrs={25} badges={badges} />);
    const toolTipElement = container.querySelector('.fa.fa-info-circle');
    fireEvent.mouseEnter(toolTipElement);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Holy Awesome, these are all the badges you earned before last week!!! Click "Full View" to bask in the glory of your COMPLETE LIST!',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          'Have a number bigger than "1" in the bottom righthand corner of a badge? That\'s how many times you\'ve earned the same badge! Do your Happy Dance you Champion!!',
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "No badges in this area? Uh, in that case, everything said above is a bit premature. Sorry about that... Everyone must start somewhere, and in your case, that somewhere is with the big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB badge, you'd earn it, but we don't, so this area is blank.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "No worries though, we're sure there are other areas of your life where you are a Champion already. Stick with us long enough and this will be another one.",
        ),
      ).toBeInTheDocument();
    });
    fireEvent.mouseLeave(toolTipElement);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Holy Awesome, these are all the badges you earned before last week!!! Click "Full View" to bask in the glory of your COMPLETE LIST!',
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'Have a number bigger than "1" in the bottom righthand corner of a badge? That\'s how many times you\'ve earned the same badge! Do your Happy Dance you Champion!!',
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "No badges in this area? Uh, in that case, everything said above is a bit premature. Sorry about that... Everyone must start somewhere, and in your case, that somewhere is with the big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB badge, you'd earn it, but we don't, so this area is blank.",
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "No worries though, we're sure there are other areas of your life where you are a Champion already. Stick with us long enough and this will be another one.",
        ),
      ).not.toBeInTheDocument();
    });
  });
  it('check Badges Earned Before Last Week heading', () => {
    render(<OldBadges personalBestMaxHrs={10} badges={badges} />);
    expect(screen.queryByText('Badges Earned Before Last Week')).toBeInTheDocument();
  });
  it('check if image src is correct', () => {
    const { container } = render(<OldBadges personalBestMaxHrs={10} badges={badges} />);
    const firstImageElement = container.querySelector('[id="popover_old0"]');
    const secondImageElement = container.querySelector('[id="popover_old1"]');
    expect(firstImageElement.getAttribute('src')).toEqual('http://www.image.com/image2');
    expect(secondImageElement.getAttribute('src')).toEqual('http://www.image.com/image1');
  });
});
