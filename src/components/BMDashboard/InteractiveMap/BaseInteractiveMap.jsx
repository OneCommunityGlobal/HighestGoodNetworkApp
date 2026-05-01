import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import { MapThemeUpdater, ProjectMarkers, MapLegend, ProjectCounter } from './MapSharedComponents';

function BaseInteractiveMap({
  orgs = [],
  filteredOrgs = [],
  loading = false,
  darkMode = false,
  onProjectClick,
  showFilters = false,
  isEmbed = false,
  mapKey = 0,
  center = [20, 0],
  zoom = 1,
  minZoom = 1,
  maxClusterRadius = 80,
  markerRadius = 8,
  position = 'bottomleft',
}) {
  // Use filteredOrgs if provided, otherwise fall back to orgs
  const displayOrgs = filteredOrgs.length > 0 ? filteredOrgs : orgs;

  if (loading) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: darkMode ? 'white' : '#222',
          background: darkMode ? '#0d1b2a' : 'white',
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: darkMode ? '#0d1b2a' : 'white',
      }}
    >
      <ProjectCounter
        count={displayOrgs.length}
        total={showFilters ? orgs.length : undefined}
        darkMode={darkMode}
        position={position}
        isEmbed={isEmbed}
      />

      {!isEmbed && <MapLegend position="bottomright" darkMode={darkMode} isEmbed={isEmbed} />}

      {isEmbed && <MapLegend position="bottomleft" darkMode={darkMode} isEmbed={isEmbed} />}

      <MapContainer
        key={mapKey}
        center={center}
        maxBounds={
          isEmbed
            ? [
                [-90, -180],
                [90, 180],
              ]
            : undefined
        }
        maxBoundsViscosity={isEmbed ? 1.0 : undefined}
        zoom={zoom}
        minZoom={minZoom}
        scrollWheelZoom
        style={{
          width: '100%',
          height: '100%',
          borderRadius: isEmbed ? '8px' : '0',
        }}
        worldCopyJump={isEmbed}
      >
        <MapThemeUpdater darkMode={darkMode} />
        <TileLayer
          noWrap={false}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            darkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
          minZoom={minZoom}
          maxZoom={15}
        />
        <MarkerClusterGroup
          disableClusteringAtZoom={13}
          spiderfyOnMaxZoom={true}
          chunkedLoading={true}
          maxClusterRadius={maxClusterRadius}
        >
          <ProjectMarkers
            orgs={displayOrgs}
            darkMode={darkMode}
            onProjectClick={onProjectClick}
            markerRadius={markerRadius}
          />
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default BaseInteractiveMap;
