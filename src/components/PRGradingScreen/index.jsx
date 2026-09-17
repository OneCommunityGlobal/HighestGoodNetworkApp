import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  deleteWeeklyGradingReviewer,
  fetchPRGradingConfig,
  fetchWeeklyGrading,
  saveWeeklyGrading,
  syncPRGradingReviewers,
} from '../../actions/prGradingActions';
import { UserRole } from '../../utils/enums';
import PRGradingScreen from './PRGradingScreen';

const ALLOWED_ROLES = [UserRole.Administrator, UserRole.Owner];

const PST_TIMEZONE = 'America/Los_Angeles';

// Get the current date components in PST
const getPSTDate = () => {
  const now = new Date();
  const pst = new Intl.DateTimeFormat('en-CA', {
    timeZone: PST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  // en-CA gives YYYY-MM-DD
  return new Date(pst + 'T00:00:00');
};

const getSunday = (weeksAgo = 0) => {
  const today = getPSTDate();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  today.setDate(today.getDate() - dayOfWeek - weeksAgo * 7);
  return today.toISOString().split('T')[0];
};

const getSaturday = sundayDateStr => {
  const d = new Date(sundayDateStr + 'T00:00:00');
  d.setDate(d.getDate() + 6);
  return d.toISOString().split('T')[0];
};

const formatShort = dateStr => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    timeZone: PST_TIMEZONE,
    month: 'short',
    day: 'numeric',
  });
};

const buildWeekLabel = (baseLabel, weeksAgo) => {
  const sunday = getSunday(weeksAgo);
  const saturday = getSaturday(sunday);
  return `${baseLabel} (${formatShort(sunday)} – ${formatShort(saturday)})`;
};

const WEEK_OPTIONS = [
  { label: buildWeekLabel('This week', 0), value: getSunday(0) },
  { label: buildWeekLabel('1 week ago', 1), value: getSunday(1) },
  { label: buildWeekLabel('2 weeks ago', 2), value: getSunday(2) },
  { label: buildWeekLabel('3 weeks ago', 3), value: getSunday(3) },
];

const buildTeamData = (teamName, weekStart) => {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(weekStart + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  return {
    teamName,
    dateRange: {
      start: start.toLocaleDateString('en-US', {
        timeZone: PST_TIMEZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      end: end.toLocaleDateString('en-US', {
        timeZone: PST_TIMEZONE,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    },
  };
};

const transformApiResponse = (flatArray, teamName, weekStart) => ({
  teamData: buildTeamData(teamName, weekStart),
  reviewers: flatArray.map(entry => ({
    id: uuidv4(),
    reviewer: entry.reviewer,
    role: entry.role,
    prsNeeded: entry.prsNeeded ?? 0,
    prsReviewed: entry.prsReviewed ?? 0,
    gradedPrs: (entry.gradedPrs ?? []).map(pr => ({
      id: uuidv4(),
      prNumbers: pr.prNumbers,
      grade: pr.grade,
    })),
  })),
});

// Build bootstrap rows from config reviewerNames + sync prsNeeded data
const bootstrapReviewers = (reviewerNames, syncTeamArray) => {
  // Normalise keys for case-insensitive, trim-safe lookup
  const prsNeededMap = {};
  if (Array.isArray(syncTeamArray)) {
    syncTeamArray.forEach(entry => {
      prsNeededMap[entry.name.toLowerCase().trim()] = entry.prsNeeded;
    });
  }
  return reviewerNames.map(name => ({
    id: uuidv4(),
    reviewer: name,
    prsNeeded: prsNeededMap[name.toLowerCase().trim()] ?? 7,
    prsReviewed: 0,
    gradedPrs: [],
  }));
};

const PRGradingScreenContainer = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const userRole = useSelector(state => state.auth?.user?.role);

  const initialTeamName = location.state?.teamName || 'Team 1';

  const [selectedTeamName, setSelectedTeamName] = useState(initialTeamName);
  const [selectedWeek, setSelectedWeek] = useState(WEEK_OPTIONS[0].value);
  const [teamOptions, setTeamOptions] = useState([]);
  const [syncData, setSyncData] = useState(null); // { team1: [{name, prsNeeded}], team2: [...] }
  const [teamData, setTeamData] = useState(null);
  const [reviewers, setReviewers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Role gate — only Owner and Administrator can access this page
  const isAuthorized = ALLOWED_ROLES.includes(userRole);

  // Sync reviewers then load team config on mount
  useEffect(() => {
    const loadTeams = async () => {
      try {
        // Sync must complete before config fetch — it updates the config the fetch reads
        const syncResult = await dispatch(syncPRGradingReviewers());
        if (syncResult.success && syncResult.data) {
          setSyncData(syncResult.data);
        }
      } catch {
        // Non-fatal — proceed without sync data
      }
      try {
        const result = await dispatch(fetchPRGradingConfig());
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setTeamOptions(result.data);
          setSelectedTeamName(result.data[0].teamName);
        }
      } catch {
        // Non-fatal
      }
    };
    loadTeams();
  }, [dispatch]);

  const loadGradingData = useCallback(
    async (name, weekStart, currentSyncData, currentTeamOptions) => {
      setLoading(true);
      setError(null);
      setIsEmpty(false);
      try {
        const result = await dispatch(fetchWeeklyGrading(name, weekStart));
        if (!result.success) {
          setError('Failed to load grading data. Please try again.');
          return;
        }
        if (!Array.isArray(result.data)) {
          setError('Failed to load grading data. Please try again.');
          return;
        }
        if (result.data.length === 0) {
          // Bootstrap from config reviewerNames + sync prsNeeded data
          const teamConfig = currentTeamOptions?.find(t => t.teamName === name);
          const reviewerNames = teamConfig?.reviewerNames ?? [];

          // Determine which sync team array to use based on team name
          const isTeam1 = name.toLowerCase().trim() === 'team 1';
          const syncTeamArray = currentSyncData
            ? isTeam1
              ? currentSyncData.team1
              : currentSyncData.team2
            : null;

          if (reviewerNames.length > 0) {
            setTeamData(buildTeamData(name, weekStart));
            setReviewers(bootstrapReviewers(reviewerNames, syncTeamArray));
            // Not truly empty if we can bootstrap — show the table ready to be graded
            setIsEmpty(false);
          } else {
            setIsEmpty(true);
            setTeamData(buildTeamData(name, weekStart));
            setReviewers([]);
          }
          return;
        }
        const transformed = transformApiResponse(result.data, name, weekStart);
        setTeamData(transformed.teamData);
        setReviewers(transformed.reviewers);
      } catch {
        setError('Failed to load grading data. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (selectedTeamName) {
      loadGradingData(selectedTeamName, selectedWeek, syncData, teamOptions);
    }
  }, [selectedTeamName, selectedWeek, loadGradingData, syncData, teamOptions]);

  const handleTeamChange = name => setSelectedTeamName(name);
  const handleWeekChange = week => setSelectedWeek(week);

  const handleSave = useCallback(
    async updatedReviewers => {
      setSaveStatus(null);
      try {
        const payload = {
          teamName: selectedTeamName,
          date: selectedWeek,
          gradings: updatedReviewers.map(r => ({
            reviewer: r.reviewer,
            prsNeeded: r.prsNeeded === '' ? 0 : Number(r.prsNeeded),
            prsReviewed: r.gradedPrs.length,
            gradedPrs: r.gradedPrs.map(pr => ({
              prNumbers: pr.prNumbers,
              grade: pr.grade,
            })),
          })),
        };
        const result = await dispatch(saveWeeklyGrading(payload));
        if (result.success) {
          setSaveStatus('success');
          // Refresh data from server after save
          await loadGradingData(selectedTeamName, selectedWeek, syncData, teamOptions);
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    },
    [dispatch, selectedTeamName, selectedWeek, loadGradingData, syncData, teamOptions],
  );

  const handleRemoveReviewer = useCallback(
    async reviewerName => {
      try {
        const result = await dispatch(
          deleteWeeklyGradingReviewer(selectedTeamName, reviewerName, selectedWeek),
        );
        if (result.success) {
          await loadGradingData(selectedTeamName, selectedWeek, syncData, teamOptions);
        } else {
          setSaveStatus('error');
        }
      } catch {
        setSaveStatus('error');
      }
    },
    [dispatch, selectedTeamName, selectedWeek, loadGradingData, syncData, teamOptions],
  );

  const handleDismissSaveStatus = () => setSaveStatus(null);

  if (!isAuthorized) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontSize: '1rem', color: '#dc3545' }}>
        You do not have permission to access this page.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontSize: '1rem', color: '#6c757d' }}>
        Loading grading data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontSize: '1rem', color: '#dc3545' }}>
        {error}
      </div>
    );
  }

  if (!teamData || !reviewers) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontSize: '1rem', color: '#6c757d' }}>
        Loading grading data...
      </div>
    );
  }

  return (
    <PRGradingScreen
      teamData={teamData}
      reviewers={reviewers}
      teamOptions={teamOptions}
      selectedTeamName={selectedTeamName}
      weekOptions={WEEK_OPTIONS}
      selectedWeek={selectedWeek}
      onTeamChange={handleTeamChange}
      onWeekChange={handleWeekChange}
      onSave={handleSave}
      onRemoveReviewer={handleRemoveReviewer}
      saveStatus={saveStatus}
      onDismissSaveStatus={handleDismissSaveStatus}
      isEmpty={isEmpty}
      emptyMessage={isEmpty ? 'No grading data for this team yet.' : undefined}
    />
  );
};

export default PRGradingScreenContainer;
