import React from 'react';
import { useLocation } from 'react-router-dom';
import { getAllMockData, getDataByTeamId } from './mockData';
import PRGradingScreen from './PRGradingScreen';

const PRGradingScreenContainer = () => {
  const location = useLocation();

  //TODO: remove this once and replace with the backend enpoint to get data when we have the backend endpoint
  // Get teamId from router state, fallback to default
  const teamId = location.state?.teamId || 'team1';
  const data = getDataByTeamId(teamId);

  return <PRGradingScreen teamData={data.teamData} reviewers={data.reviewers} />;
};

export default PRGradingScreenContainer;
