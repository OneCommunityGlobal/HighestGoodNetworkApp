import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getWeeklyGrading } from '../../actions/prAnalytics/weeklyGradingActions';
import { getDataByTeamId } from './mockData';
import PRGradingScreen from './PRGradingScreen';

const PRGradingScreenContainer = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);

  const teamId = location.state?.teamId || 'team1';
  const isStaticTeam = ['team1', 'team2', 'team3'].includes(teamId);

  const [teamData, setTeamData] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(!isStaticTeam);

  useEffect(() => {
    if (isStaticTeam) {
      const data = getDataByTeamId(teamId);
      setTeamData(data.teamData);
      setReviewers(data.reviewers);
      return;
    }

    // Dynamic team — fetch from backend
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const formatDate = d => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;

        const weekStartStr = formatDate(weekStart);
        const weekEndStr = formatDate(weekEnd);

        // Fetch team config to get reviewer names
        const { default: axios } = await import('axios');
        const { ENDPOINTS } = await import('../../utils/URL');
        const configRes = await axios.get(ENDPOINTS.PR_GRADING_CONFIG);
        const config = configRes.data.find(c => c._id === teamId);

        const teamName = config?.teamName || location.state?.teamName || teamId;

        setTeamData({
          teamCode: teamId,
          teamName,
          dateRange: { start: weekStartStr, end: weekEndStr },
        });

        // Fetch existing grading data
        const gradingData = await dispatch(getWeeklyGrading(teamId, weekStartStr, token));

        const { v4: uuidv4 } = await import('uuid');

        if (gradingData && gradingData.length > 0) {
          const mapped = gradingData.map(entry => ({
            id: uuidv4(),
            reviewer: entry.reviewer,
            prsNeeded: entry.prsNeeded,
            prsReviewed: entry.prsReviewed,
            gradedPrs: (entry.gradedPrs || []).map(pr => ({ ...pr, id: uuidv4() })),
          }));
          setReviewers(mapped);
        } else if (config?.reviewerNames?.length > 0) {
          // No grading yet — populate from config reviewer names
          const mapped = config.reviewerNames.map((name, index) => ({
            id: uuidv4(),
            reviewer: name || `Reviewer ${index + 1}`,
            prsNeeded: 10,
            prsReviewed: 0,
            gradedPrs: [],
          }));
          setReviewers(mapped);
        } else {
          setReviewers([]);
        }
      } catch {
        setReviewers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!teamData) return <div>Error: Team not found</div>;

  return <PRGradingScreen teamData={teamData} reviewers={reviewers} />;
};

export default PRGradingScreenContainer;
