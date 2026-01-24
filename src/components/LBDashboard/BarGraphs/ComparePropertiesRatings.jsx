import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { CompareBarGraph } from './CompareGraphs';

function randomInt(min, max) {
  const range = max - min + 1;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    if (range <= 256) {
      const arr = new Uint8Array(1);
      const limit = 256 - (256 % range);
      let r;
      do {
        crypto.getRandomValues(arr);
        r = arr[0];
      } while (r >= limit);
      return min + (r % range);
    } else {
      const arr = new Uint32Array(1);
      const MAX = 0x100000000;
      const limit = MAX - (MAX % range);
      let r;
      do {
        crypto.getRandomValues(arr);
        r = arr[0];
      } while (r >= limit);
      return min + (r % range);
    }
  }
  return Math.floor(Math.random() * range) + min;
}

export function ComparePropertiesRatings({
  fromDate,
  toDate,
  listingBiddingFilter,
  selectedMetricKey,
}) {
  const [propertiesData, setPropertiesData] = useState([]);

  useEffect(() => {
    // Generate mock properties data based on filters
    const generateMockProperties = () => {
      const properties = [
        'House AB',
        'Room A',
        'Room C',
        'Room A34',
        'Room 5',
        'Studio B12',
        'Apartment D',
      ];

      // Calculate a seed based on date range
      const daysDiff = moment(toDate).diff(moment(fromDate), 'days');
      const dateSeed = daysDiff > 0 ? daysDiff / 365 : 0.1;

      // Different ranges based on listing/bidding filter
      const multiplier =
        listingBiddingFilter === 'bidding' ? 0.85 : listingBiddingFilter === 'listing' ? 1.1 : 1;

      return properties
        .map(p => {
          let value = 0;

          // Generate different data based on metric
          switch (selectedMetricKey) {
            case 'avgRating':
              // Generate ratings between 2.5 and 5.0, affected by filters
              const baseRating = randomInt(250, 500) / 100;
              value = Math.min(5.0, Math.max(1.0, baseRating * multiplier * dateSeed));
              break;
            case 'pageVisits':
              value = Math.floor(randomInt(20, 150) * multiplier * dateSeed);
              break;
            case 'numBids':
              value = Math.floor(randomInt(5, 50) * multiplier * dateSeed);
              break;
            case 'avgBid':
            case 'finalPrice':
              value = randomInt(30000, 120000);
              break;
            case 'occupancyRate':
              value = randomInt(60, 98);
              break;
            case 'avgStay':
              value = randomInt(5, 40);
              break;
            default:
              value = randomInt(10, 100);
          }

          return {
            property: p,
            value: ['avgRating'].includes(selectedMetricKey)
              ? Number(value.toFixed(2))
              : Math.floor(value),
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };

    setTimeout(() => {
      setPropertiesData(generateMockProperties());
    }, 300);
  }, [fromDate, toDate, listingBiddingFilter, selectedMetricKey]);

  // Determine labels and formatting based on metric
  const getMetricConfig = () => {
    switch (selectedMetricKey) {
      case 'avgRating':
        return {
          yLabel: 'Average Rating',
          yDomain: [0, 5],
          yTicks: [0, 1, 2, 3, 4, 5],
          valueFormatter: v => Number(v).toFixed(2),
          tooltipLabel: 'Average Rating',
        };
      case 'pageVisits':
        return {
          yLabel: 'Page Visits',
          yDomain: undefined,
          yTicks: undefined,
          valueFormatter: v => Number(v),
          tooltipLabel: 'Page Visits',
        };
      case 'numBids':
        return {
          yLabel: 'Number of Bids',
          yDomain: undefined,
          yTicks: undefined,
          valueFormatter: v => Number(v),
          tooltipLabel: 'Number of Bids',
        };
      case 'avgBid':
      case 'finalPrice':
        return {
          yLabel: selectedMetricKey === 'avgBid' ? 'Average Bid (₹)' : 'Final Price (₹)',
          yDomain: undefined,
          yTicks: undefined,
          valueFormatter: v => `₹${Number(v).toLocaleString()}`,
          tooltipLabel: selectedMetricKey === 'avgBid' ? 'Average Bid' : 'Final Price',
        };
      case 'occupancyRate':
        return {
          yLabel: 'Occupancy Rate (%)',
          yDomain: [0, 100],
          yTicks: [0, 25, 50, 75, 100],
          valueFormatter: v => `${v}%`,
          tooltipLabel: 'Occupancy Rate',
        };
      case 'avgStay':
        return {
          yLabel: 'Average Stay (days)',
          yDomain: undefined,
          yTicks: undefined,
          valueFormatter: v => `${v} days`,
          tooltipLabel: 'Average Stay',
        };
      default:
        return {
          yLabel: 'Value',
          yDomain: undefined,
          yTicks: undefined,
          valueFormatter: v => Number(v),
          tooltipLabel: 'Value',
        };
    }
  };

  const metricConfig = getMetricConfig();

  return (
    <CompareBarGraph
      title="Comparing Ratings of Properties"
      orientation="vertical"
      data={propertiesData}
      nameKey="property"
      valueKey="value"
      xLabel="Property Name"
      yLabel={metricConfig.yLabel}
      yDomain={metricConfig.yDomain}
      yTicks={metricConfig.yTicks}
      barSize={50}
      barColor="#f2b233"
      height={360}
      margins={{ top: 20, right: 40, bottom: 60, left: 60 }}
      valueFormatter={metricConfig.valueFormatter}
      tooltipLabel={metricConfig.tooltipLabel}
      headerChips={[
        { label: 'List/Bid', value: 'ALL' },
        { label: 'Dates', value: 'ALL' },
        { label: 'Metric', value: 'ALL' },
        { label: 'Properties', value: 'ALL' },
      ]}
    />
  );
}

ComparePropertiesRatings.propTypes = {
  fromDate: PropTypes.instanceOf(Date).isRequired,
  toDate: PropTypes.instanceOf(Date).isRequired,
  listingBiddingFilter: PropTypes.string.isRequired,
  selectedMetricKey: PropTypes.string.isRequired,
};
