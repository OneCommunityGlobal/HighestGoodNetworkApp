// data.js
// API endpoints for listings and biddings
export const ENDPOINTS = {
  LB_LISTINGS: '/api/listings',
  LB_BIDDINGS: '/api/biddings',
};

// Village locations (these would be fetched from a backend API in a real implementation)
export const VILLAGE_LOCATIONS = {
  Earthbag: [37.7749, -122.4194],
  'Straw Bale': [37.7755, -122.418],
  'Recycle Materials': [37.776, -122.417],
  Cob: [37.777, -122.416],
  'Tree House': [37.778, -122.415],
  Strawberry: [37.779, -122.414],
  'Sustainable Living': [37.78, -122.413],
  'City Center': [37.781, -122.412],
  // Adding many more villages to simulate a large dataset
  ...Array.from({ length: 92 }, (_, i) => {
    const villageNum = i + 9; // Start at 9 since we already have 8 villages defined above
    return [
      `Village ${villageNum}`,
      [37.7749 + (Math.random() - 0.5) * 0.02, -122.4194 + (Math.random() - 0.5) * 0.02],
    ];
  }).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {}),
};

// Mock data generator - would be replaced by API calls in production
export const generateSampleData = () => {
  const villages = Object.keys(VILLAGE_LOCATIONS);
  return Array.from({ length: 40 }, (_, idx) => {
    const village = villages[idx % villages.length];
    // Add small random offset to coordinates so units in the same village appear nearby but not on top of each other
    const baseCoords = VILLAGE_LOCATIONS[village];
    const randomLat = (Math.random() - 0.5) * 0.005; // Random offset ±0.0025 degrees (about 250-300 meters)
    const randomLng = (Math.random() - 0.5) * 0.005;

    return {
      id: idx + 1,
      title: `Unit ${idx + 1}`,
      village,
      price: 20 + (idx % 10) * 5,
      perUnit: 'day',
      images: ['https://via.placeholder.com/300x200?text=Unit'],
      availableFrom: new Date(2025, 3, 1),
      availableTo: new Date(2025, 5, 30),
      coordinates: [baseCoords[0] + randomLat, baseCoords[1] + randomLng],
      description: `This is a ${village} style unit available for rent. Located in a beautiful area with amazing views and access to community amenities.`,
    };
  });
};

// Generate mock data for listings and biddings
export const mockListings = generateSampleData();
export const mockBiddings = mockListings.slice(10, 30).map((d, i) => ({
  ...d,
  id: 1000 + i,
  price: d.price * 0.8, // Biddings at 80% of listing price
}));
