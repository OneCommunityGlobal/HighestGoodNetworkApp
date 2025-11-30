/* eslint-disable */
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

/* -----------------------------------------------------
   SHARED LEGEND COMPONENT
----------------------------------------------------- */
export function MapLegend({ position = 'bottomright', darkMode, isEmbed = false }) {
  const labels = isEmbed
    ? ['Active - Red', 'Delayed - Yellow', 'Completed - Blue']
    : ['Active', 'Delayed', 'Completed'];

  return (
    <div
      style={{
        position: 'absolute',
        [position === 'bottomleft' ? 'left' : 'right']: isEmbed ? '15px' : '20px',
        bottom: isEmbed ? '15px' : '20px',
        padding: '12px 15px',
        background: darkMode ? 'rgba(30, 42, 58, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        color: darkMode ? 'white' : '#222',
        borderRadius: '8px',
        boxShadow: darkMode ? '0 4px 15px rgba(0,0,0,0.4)' : '0 4px 15px rgba(0,0,0,0.15)',
        border: darkMode ? '1px solid #3a506b' : '1px solid #ccc',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        minWidth: '160px',
        backdropFilter: 'blur(10px)',
        fontWeight: '500',
        zIndex: 1000,
        maxWidth: '200px',
      }}
    >
      <div
        style={{
          color: darkMode ? 'white' : '#333',
          fontWeight: 'bold',
          marginBottom: '8px',
          fontSize: '16px',
        }}
      >
        Project Status
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#DE6A6A',
            marginRight: '10px',
            border: darkMode ? '1px solid rgba(255,255,255,0.3)' : '1px solid #333',
          }}
        ></div>
        <span style={{ color: darkMode ? 'white' : '#333', fontWeight: '500' }}>{labels[0]}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#E3D270',
            marginRight: '10px',
            border: darkMode ? '1px solid rgba(255,255,255,0.3)' : '1px solid #333',
          }}
        ></div>
        <span style={{ color: darkMode ? 'white' : '#333', fontWeight: '500' }}>{labels[1]}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0px' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#6ACFDE',
            marginRight: '10px',
            border: darkMode ? '1px solid rgba(255,255,255,0.3)' : '1px solid #333',
          }}
        ></div>
        <span style={{ color: darkMode ? 'white' : '#333', fontWeight: '500' }}>{labels[2]}</span>
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   SHARED PROJECT COUNTER COMPONENT  
----------------------------------------------------- */
export function ProjectCounter({
  count,
  total,
  darkMode,
  position = 'bottomleft',
  isEmbed = false,
}) {
  return (
    <div
      style={{
        position: 'absolute',
        [position.includes('left') ? 'left' : 'right']: isEmbed ? '15px' : '20px',
        [position.includes('bottom') ? 'bottom' : 'top']: isEmbed ? '15px' : '20px',
        padding: '8px 12px',
        background: darkMode ? 'rgba(30, 42, 58, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: '6px',
        fontSize: '13px',
        backdropFilter: 'blur(10px)',
        color: darkMode ? 'white' : '#222',
        border: darkMode ? '1px solid #3a506b' : '1px solid rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontWeight: '500',
      }}
    >
      Showing {count} {total ? `of ${total}` : ''} projects
    </div>
  );
}

export function MapThemeUpdater({ darkMode }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();

    const container = map.getContainer();
    container.classList.remove('dark-mode-map', 'light-mode-map');
    container.classList.add(darkMode ? 'dark-mode-map' : 'light-mode-map');

    map.eachLayer(layer => {
      if (layer.getPopup) {
        const popup = layer.getPopup();
        if (popup) {
          const popupElement = popup.getElement();
          if (popupElement) {
            popupElement.classList.remove('dark-mode-popup', 'light-mode-popup');
            popupElement.classList.add(darkMode ? 'dark-mode-popup' : 'light-mode-popup');

            const tip = popupElement.querySelector('.leaflet-popup-tip');
            if (tip) {
              tip.style.display = 'none';
            }
          }
        }
      }

      if (layer.getTooltip) {
        const tooltip = layer.getTooltip();
        if (tooltip) {
          const tooltipElement = tooltip.getElement();
          if (tooltipElement) {
            tooltipElement.classList.remove('dark-mode-tooltip', 'light-mode-tooltip');
            tooltipElement.classList.add(darkMode ? 'dark-mode-tooltip' : 'light-mode-tooltip');
          }
        }
      }
    });
  }, [darkMode, map]);
  return null;
}

/* -----------------------------------------------------
   PROJECT POPUP
----------------------------------------------------- */
export function ProjectPopup({ org, darkMode, onProjectClick }) {
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#DE6A6A';
      case 'delayed':
        return '#E3D270';
      case 'completed':
        return '#6ACFDE';
      default:
        return '#AAAAAA';
    }
  };

  return (
    <div
      style={{
        minWidth: '200px',
        color: darkMode ? 'white' : '#222',
        fontFamily: 'Arial, sans-serif',
        background: darkMode ? '#2d4059' : 'white',
        borderRadius: '8px',
        boxShadow: darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: darkMode ? '1px solid #3a506b' : '1px solid #e0e0e0',
        overflow: 'hidden',
      }}
    >
      {/* Compact Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '10px',
          padding: '12px 12px 10px 12px',
          borderBottom: darkMode ? '1px solid #3a506b' : '1px solid #e0e0e0',
          background: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(org.status),
            marginRight: '8px',
            flexShrink: 0,
          }}
        ></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              margin: '0 0 2px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: darkMode ? 'white' : '#222',
              lineHeight: '1.3',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {org.name}
          </h4>
          <span
            style={{
              fontSize: '11px',
              color: darkMode ? '#b0b8c4' : '#666',
              textTransform: 'capitalize',
            }}
          >
            {org.status} • #{org.orgId}
          </span>
        </div>
      </div>

      {/* Compact Details */}
      <div style={{ marginBottom: '12px', padding: '0 12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: darkMode ? '#b0b8c4' : '#666',
              fontWeight: '500',
            }}
          >
            Country:
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: darkMode ? 'white' : '#222',
            }}
          >
            {org.country}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              color: darkMode ? '#b0b8c4' : '#666',
              fontWeight: '500',
            }}
          >
            Start:
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: darkMode ? 'white' : '#222',
            }}
          >
            {new Date(org.startDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Compact Button */}
      <div style={{ padding: '0 12px 12px 12px' }}>
        <button
          onClick={() => onProjectClick(org)}
          style={{
            width: '100%',
            backgroundColor: darkMode ? '#6ACFDE' : '#4CAF50',
            color: 'white',
            padding: '8px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
          onMouseOver={e => {
            e.target.style.backgroundColor = darkMode ? '#5abfcc' : '#45a049';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={e => {
            e.target.style.backgroundColor = darkMode ? '#6ACFDE' : '#4CAF50';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------------------
   PROJECT MARKERS
----------------------------------------------------- */
export function ProjectMarkers({ orgs, darkMode, onProjectClick, markerRadius = 8 }) {
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#DE6A6A';
      case 'delayed':
        return '#E3D270';
      case 'completed':
        return '#6ACFDE';
      default:
        return '#AAAAAA';
    }
  };

  return orgs.map((org, index) => (
    <CircleMarker
      key={org.orgId || index}
      center={[org.latitude, org.longitude]}
      radius={markerRadius}
      pathOptions={{
        fillColor: getStatusColor(org.status),
        fillOpacity: 0.9,
        color: darkMode ? '#1e2a3a' : 'white',
        weight: markerRadius === 6 ? 1 : 2,
      }}
    >
      <Tooltip
        className={darkMode ? 'dark-mode-tooltip' : 'light-mode-tooltip'}
        direction="top"
        offset={markerRadius === 6 ? [0, -10] : [0, -8]}
        opacity={markerRadius === 6 ? 1 : 0.95}
        permanent={false}
      >
        <div style={{ fontSize: '11px', fontWeight: '500', textAlign: 'center' }}>
          Project #{org.orgId}
        </div>
      </Tooltip>

      <Popup className={darkMode ? 'dark-mode-popup' : 'light-mode-popup'}>
        <ProjectPopup org={org} darkMode={darkMode} onProjectClick={onProjectClick} />
      </Popup>
    </CircleMarker>
  ));
}

/* -----------------------------------------------------
   UTILITY FUNCTIONS
----------------------------------------------------- */
export const MapUtils = {
  getStatusColor: status => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#DE6A6A';
      case 'delayed':
        return '#E3D270';
      case 'completed':
        return '#6ACFDE';
      default:
        return '#AAAAAA';
    }
  },

  getPseudoOrgs: () => [
    {
      orgId: 9991,
      name: 'Test Project Alpha',
      status: 'active',
      country: 'United States',
      latitude: 34.1185,
      longitude: -118.0743,
      startDate: '2025-11-01',
      remark: 'This is a remark for Project Alpha.',
    },
    {
      orgId: 9992,
      name: 'Test Project Beta',
      status: 'completed',
      country: 'Germany',
      latitude: 52.52,
      longitude: 13.405,
      startDate: '2023-12-10',
      endDate: '2024-12-10',
      remark: 'Beta testing completed successfully.',
    },
    {
      orgId: 9993,
      name: 'Test Project Gamma',
      status: 'delayed',
      country: 'Japan',
      latitude: 35.6895,
      longitude: 139.6917,
      startDate: '2025-06-01',
      remark: 'Awaiting equipment shipment.',
    },
  ],

  getMapStyles: darkMode => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: darkMode ? '#0d1b2a' : 'white',
      color: darkMode ? 'white' : '#222',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      gap: '15px',
      flexWrap: 'wrap',
      background: darkMode ? '#1e2a3a' : 'white',
      borderBottom: darkMode ? '1px solid #3a506b' : '1px solid #e0e0e0',
    },
    titleText: {
      margin: 0,
      fontSize: '20px',
      fontWeight: 600,
      color: darkMode ? 'white' : '#222',
    },
    filterRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    input: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#2d4059' : 'white',
      color: darkMode ? 'white' : '#222',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    applyButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#4CAF50',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    resetButton: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: darkMode ? '1px solid #3a506b' : '1px solid #ddd',
      backgroundColor: darkMode ? '#2d4059' : '#f5f5f5',
      color: darkMode ? 'white' : '#222',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    mapArea: {
      flex: 1,
      position: 'relative',
      borderRadius: '0',
      overflow: 'hidden',
      width: '100%',
      height: '100%',
    },
  }),
};
