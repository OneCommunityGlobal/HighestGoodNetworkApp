import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ENDPOINTS } from '../../utils/URL';
import { getDataByTeamId } from './mockData';
import PRGradingScreen from './PRGradingScreen';

const STATIC_IDS = ['team1', 'team2', 'team3'];

const PRGradingScreenContainer = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const teamId = params.get('teamId') || location.state?.teamId || 'team1';
  const [savedConfig, setSavedConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const locationConfig = location.state?.teamId === teamId ? location.state?.config : null;
  const config = locationConfig || (savedConfig?.id === teamId ? savedConfig : null);

  useEffect(() => {
    if (STATIC_IDS.includes(teamId) || locationConfig) return undefined;
    let active = true;
    axios
      .get(ENDPOINTS.PR_GRADING_CONFIG)
      .then(response => {
        if (!active) return;
        const match = response.data.find(item => item._id === teamId);
        if (match) {
          setSavedConfig({
            id: match._id,
            name: match.teamName,
            reviewerCount: match.reviewerCount,
            reviewerNames: match.reviewerNames,
          });
        } else {
          setConfigError('Team configuration not found.');
        }
      })
      .catch(() => {
        if (active) setConfigError('Could not load the team configuration.');
      });
    return () => {
      active = false;
    };
  }, [teamId, locationConfig]);

  if (!STATIC_IDS.includes(teamId) && !config) {
    return <div>{configError || 'Loading team configuration...'}</div>;
  }

  if (!STATIC_IDS.includes(teamId) && config) {
    const reviewers = Array.from({ length: config.reviewerCount }, (_, i) => ({
      id: uuidv4(),
      reviewer: config.reviewerNames?.[i] || `Reviewer ${i + 1}`,
      prsNeeded: 10,
      prsReviewed: 0,
      gradedPrs: [],
    }));

    const weekStart = params.get('weekStart');
    if (weekStart && !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return <div>Invalid week start date.</div>;
    }
    const start = weekStart ? new Date(`${weekStart}T12:00:00`) : new Date();
    if (Number.isNaN(start.getTime())) return <div>Invalid week start date.</div>;
    if (!weekStart) start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const teamData = {
      teamName: config.name,
      dateRange: {
        start: start.toLocaleDateString('en-US'),
        end: end.toLocaleDateString('en-US'),
      },
    };

    return <PRGradingScreen teamData={teamData} reviewers={reviewers} />;
  }

  const data = getDataByTeamId(teamId);
  return <PRGradingScreen teamData={data.teamData} reviewers={data.reviewers} />;
};

export default PRGradingScreenContainer;
