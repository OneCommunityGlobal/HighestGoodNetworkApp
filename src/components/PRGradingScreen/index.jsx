import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getDataByTeamId } from './mockData';
import PRGradingScreen from './PRGradingScreen';

const STATIC_IDS = ['team1', 'team2', 'team3'];

const PRGradingScreenContainer = () => {
  const location = useLocation();
  const teamId = location.state?.teamId || 'team1';
  const config = location.state?.config || null;

  if (!STATIC_IDS.includes(teamId) && config) {
    const reviewers = Array.from({ length: config.reviewerCount }, (_, i) => ({
      id: uuidv4(),
      reviewer: config.reviewerNames?.[i] || `Reviewer ${i + 1}`,
      prsNeeded: 10,
      prsReviewed: 0,
      gradedPrs: [],
    }));

    const teamData = {
      teamName: config.teamName,
      dateRange: {
        start: new Date().toLocaleDateString(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      },
    };

    return <PRGradingScreen teamData={teamData} reviewers={reviewers} />;
  }

  const data = getDataByTeamId(teamId);
  return <PRGradingScreen teamData={data.teamData} reviewers={data.reviewers} />;
};

export default PRGradingScreenContainer;
