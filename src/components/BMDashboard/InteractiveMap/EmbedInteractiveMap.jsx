import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useProjectsData } from '../../../hooks/useProjectsData';
import BaseInteractiveMap from './BaseInteractiveMap';

function EmbedInteractiveMap() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const { orgs, loading } = useProjectsData();

  const handleProjectClick = org => {
    history.push(`/bmdashboard/projects/${org.orgId}`);
  };

  return (
    <BaseInteractiveMap
      orgs={orgs}
      loading={loading}
      darkMode={darkMode}
      onProjectClick={handleProjectClick}
      isEmbed={true}
      center={[20, 0]}
      zoom={1}
      minZoom={1}
      maxClusterRadius={80}
      markerRadius={6}
      position="bottomleft"
    />
  );
}

export default EmbedInteractiveMap;
