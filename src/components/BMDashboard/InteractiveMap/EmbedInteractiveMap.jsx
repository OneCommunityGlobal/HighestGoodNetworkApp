/* eslint-disable */
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import {
  MapThemeUpdater,
  ProjectMarkers,
  MapUtils,
  MapLegend,
  ProjectCounter,
} from './MapSharedComponents';

function EmbedInteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    try {
      let response;
      try {
        response = await axios.get(ENDPOINTS.BM_PROJECTS_WITH_LOCATION);
      } catch (projectError) {
        console.log('Projects with location endpoint not available, using organization data');
        response = await axios.get(ENDPOINTS.BM_ORGS_WITH_LOCATION);
      }

      const data = response.data.data || [];

      if (data.length === 0) {
        console.log('No data from backend, using pseudo data');
        const pseudoData = MapUtils.getPseudoOrgs();
        setOrgs(pseudoData);
      } else {
        setOrgs(data);
      }
      return data;
    } catch (error) {
      console.error('Error fetching project/org data:', error);
      const pseudoData = MapUtils.getPseudoOrgs();
      setOrgs(pseudoData);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = org => {
    history.push(`/bmdashboard/projects/${org.orgId}`);
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

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
        count={orgs.length}
        darkMode={darkMode}
        position="bottomleft"
        isEmbed={true}
      />
      <MapLegend position="bottomleft" darkMode={darkMode} isEmbed={true} />

      <MapContainer
        center={[20, 0]}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        zoom={1}
        minZoom={1}
        scrollWheelZoom
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
        worldCopyJump
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
          minZoom={1}
          maxZoom={15}
        />
        <MarkerClusterGroup
          disableClusteringAtZoom={13}
          spiderfyOnMaxZoom={true}
          chunkedLoading={true}
          maxClusterRadius={80}
        >
          <ProjectMarkers
            orgs={orgs}
            darkMode={darkMode}
            onProjectClick={handleProjectClick}
            markerRadius={6}
          />
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

export default EmbedInteractiveMap;
