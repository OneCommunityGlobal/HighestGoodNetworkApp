import React from 'react';

// Default placeholder for test mode (Jest)
const MockClusterGroup = ({ children }) => <div>{children}</div>;

let MarkerClusterGroup;

// Vite's way to check the current mode
const isTestMode =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test';

// If running in Jest tests → use mock component
if (isTestMode) {
  MarkerClusterGroup = MockClusterGroup;
} else {
  // In dev/prod → dynamically import the real library
  MarkerClusterGroup = React.lazy(() =>
    import('@changey/react-leaflet-markercluster').then(module => ({
      default: module.default,
    })),
  );
}

export default MarkerClusterGroup;
