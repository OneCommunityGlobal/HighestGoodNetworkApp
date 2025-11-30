// components/InteractiveMap.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useProjectsData } from '../../../hooks/useProjectsData';
import BaseInteractiveMap from './BaseInteractiveMap';
import { MapUtils } from './MapSharedComponents';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';

export default function InteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  const { orgs, loading } = useProjectsData();
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mapKey, setMapKey] = useState(0);
  const [errMsg, setErrMsg] = useState('');

  const applyDateFilters = () => {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setErrMsg('End date cannot be earlier than start date');
      return;
    }
    setErrMsg('');

    let filtered = [...orgs];
    if (startDate) filtered = filtered.filter(o => new Date(o.startDate) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(o => new Date(o.startDate) <= new Date(endDate));

    setFilteredOrgs(filtered);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setErrMsg('');
    setFilteredOrgs([]);
  };

  const handleProjectClick = org => history.push(`/bmdashboard/projects/${org.orgId}`);

  useEffect(() => {
    setMapKey(k => k + 1);
  }, [darkMode]);

  const S = MapUtils.getMapStyles(darkMode);

  return (
    <div style={S.container}>
      <div style={S.headerRow}>
        <h2 style={S.titleText}>Global Distribution and Project Status Overview</h2>

        <div style={S.filterRow}>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={S.input}
          />
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={S.input}
          />
          <button onClick={applyDateFilters} style={S.applyButton}>
            Apply
          </button>
          <button onClick={resetFilters} style={S.resetButton}>
            Reset
          </button>

          {errMsg && (
            <span style={{ color: '#DE6A6A', fontSize: '13px', fontWeight: '500' }}>{errMsg}</span>
          )}
        </div>
      </div>

      <div style={S.mapArea}>
        <BaseInteractiveMap
          orgs={orgs}
          filteredOrgs={filteredOrgs}
          loading={loading}
          darkMode={darkMode}
          onProjectClick={handleProjectClick}
          showFilters={true}
          mapKey={mapKey}
          center={[40, 0]}
          zoom={3}
          maxClusterRadius={70}
          markerRadius={8}
          position="bottomleft"
        />
      </div>
    </div>
  );
}
