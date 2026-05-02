import React from 'react';
import PropTypes from 'prop-types';

// Default placeholder for test mode (Jest)
const MockClusterGroup = ({ children }) => <div>{children}</div>;
MockClusterGroup.propTypes = {
  children: PropTypes.node,
};

// Vite's way to check the current mode
const isTestMode = import.meta?.env?.MODE === 'test';

const MarkerClusterGroup = isTestMode
  ? MockClusterGroup
  : React.lazy(() =>
      import('@changey/react-leaflet-markercluster').then(module => ({
        default: module.default,
      })),
    );

export default MarkerClusterGroup;
