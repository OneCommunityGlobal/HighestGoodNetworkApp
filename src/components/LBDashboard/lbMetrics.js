export const METRIC_OPTIONS = {
  DEMAND: [
    { key: 'pageVisits', label: 'Page Visits', biddingOnly: false },
    { key: 'numBids', label: 'Number of Bids', biddingOnly: true },
    { key: 'avgRating', label: 'Average Rating', biddingOnly: false },
  ],
  REVENUE: [
    { key: 'avgBid', label: 'Average Bid', biddingOnly: true },
    { key: 'finalPrice', label: 'Final Price / Income', biddingOnly: true },
  ],
  VACANCY: [
    { key: 'occupancyRate', label: 'Occupancy Rate (% days not vacant)', biddingOnly: false },
    { key: 'avgStay', label: 'Average Duration of Stay', biddingOnly: false },
  ],
};

export const BIDDING_ONLY_METRICS = new Set(
  Object.values(METRIC_OPTIONS)
    .flat()
    .filter(m => m.biddingOnly)
    .map(m => m.key),
);
