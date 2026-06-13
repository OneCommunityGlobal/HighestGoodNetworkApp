import React from 'react';
// eslint-disable-next-line testing-library/no-manual-cleanup
import { render, fireEvent, screen, cleanup, waitFor } from '@testing-library/react';
import BadgeImage from '../BadgeImage';

describe('BadgeImage Component Tests', () => {
    afterEach(cleanup);

    const props = {
      "personalBestMaxHrs": 13.033333333333333,
      "count": 1,
      "badgeData": {
        "type": "Total Hrs in Category",
        "_id": "6104aabf6e7d90822c266932",
        "badgeName": "200 HOURS TOTAL IN ECONOMICS CATEGORY",
        "imageUrl": "https://www.dropbox.com/s/c8j7b4mwjn3uff2/Economics%20200%20hrs%20icon%20200px.png?raw=1",
        "ranking": 103,
        "description": "You have achieved the rare milestone of 200 hours contributed to the economics category. Our project would not be possible without people like you. Thank you!",
        "showReport": null
      },
      "index": 1
    }

    it('receives props correctly', () => {
        const { getByTestId } = render(<BadgeImage {...props} />);
        // eslint-disable-next-line testing-library/prefer-screen-queries
        const imageElement = getByTestId(`badge-image-${props.index}`)
        expect(imageElement.src).toContain(props.badgeData.imageUrl);
    });

    it('renders correct count', () => {
      const { getByTestId, rerender } = render(<BadgeImage { ...props } />);
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect(getByTestId('badge_featured_count')).toHaveTextContent('1');

      props.count = 101;
      rerender(<BadgeImage {...props} />);
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect(getByTestId('badge_featured_count_3_digit')).toHaveTextContent('101');

      props.badgeData.type = 'Personal Max';
      rerender(<BadgeImage {...props} />);
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect(getByTestId('badge_featured_count_personalmax')).toHaveTextContent('101 hrs');

      props.personalBestMaxHrs = 1;
      rerender(<BadgeImage {...props} />);
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect(getByTestId('badge_featured_count_personalmax')).toHaveTextContent('1 hr');
    })

    it('toggles popover on hover', async () => {
        render(<BadgeImage {...props} />);
        const triggerEl = await screen.findByTestId(`badge-image-${props.index}`)
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        fireEvent.mouseOver(triggerEl);
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
    });
});
