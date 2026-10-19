import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import PRGradingView from './PRGradingView';
import {
  loadSavedGradings,
  mergeSavedGradings,
  saveAddedPR,
  saveGradeChange,
} from './prGradingPersistence';
import { usePRPromotion } from './usePRPromotion';

const hasDuplicatePR = (gradedPrs, value) => {
  const enteredNumbers = value.split('+').map(number => number.trim());
  const existingNumbers = gradedPrs.flatMap(pr =>
    pr.prNumbers.split('+').map(number => number.trim()),
  );
  return (
    new Set(enteredNumbers).size !== enteredNumbers.length ||
    enteredNumbers.some(number => existingNumbers.includes(number))
  );
};

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [reviewerData, setReviewerData] = useState(reviewers || []);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [isSavingPR, setIsSavingPR] = useState(false);
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [gradeError, setGradeError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const {
    promotingReviewer,
    promotedReviewerIds,
    handlePromoteClick,
    handleConfirmPromotion,
    handleCancelPromotion,
  } = usePRPromotion(teamData?.teamName);

  useEffect(() => {
    if (!teamData || !reviewers) return undefined;
    let active = true;
    setIsLoadingSaved(true);
    loadSavedGradings(teamData)
      .then(saved => {
        if (active) {
          setReviewerData(mergeSavedGradings(reviewers, saved));
          setLoadError('');
        }
      })
      .catch(() => {
        if (active) setLoadError('Could not load saved PRs. Try again before adding a PR.');
      })
      .finally(() => {
        if (active) setIsLoadingSaved(false);
      });
    return () => {
      active = false;
    };
  }, [teamData, reviewers]);

  const availableRoles = useMemo(() => {
    const roles = reviewerData.map(reviewer => reviewer.role).filter(Boolean);
    return [...new Set(roles)];
  }, [reviewerData]);

  const filteredReviewers = useMemo(
    () =>
      reviewerData.filter(reviewer => {
        const nameMatch = reviewer.reviewer.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = roleFilter ? reviewer.role === roleFilter : true;
        return nameMatch && roleMatch;
      }),
    [reviewerData, searchTerm, roleFilter],
  );

  const handleClearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  const validatePRNumber = value => {
    const trimmed = value.trim();
    const pattern = /^\d+(\s*\+\s*\d+)?$/;
    if (!trimmed) return { isValid: false, error: 'PR number cannot be empty' };
    if (!pattern.test(trimmed)) return { isValid: false, error: 'Format: 1070 or 1070 + 1256' };
    return { isValid: true, error: '' };
  };

  const handleAddNewClick = reviewerId => {
    if (isFinalized || isLoadingSaved || loadError) return;
    setActiveInput(reviewerId);
    setInputValue('');
    setInputError('');
  };

  const handleInputSubmit = async reviewerId => {
    if (isFinalized || isLoadingSaved || isSavingPR || loadError) return;
    const validation = validatePRNumber(inputValue);
    if (!validation.isValid) {
      setInputError(validation.error);
      return;
    }
    const reviewer = reviewerData.find(item => item.id === reviewerId);
    if (!reviewer) return;
    if (hasDuplicatePR(reviewer.gradedPrs, inputValue)) {
      setInputError('This PR number has already been added for this reviewer.');
      return;
    }

    setIsSavingPR(true);
    try {
      const saved = await loadSavedGradings(teamData);
      const currentReviewers = mergeSavedGradings(reviewerData, saved);
      const currentReviewer = currentReviewers.find(item => item.id === reviewerId);
      if (!currentReviewer) return;
      if (hasDuplicatePR(currentReviewer.gradedPrs, inputValue)) {
        setReviewerData(currentReviewers);
        setInputError('This PR number has already been added for this reviewer.');
        return;
      }

      const prNumbers = inputValue.trim();
      await saveAddedPR(teamData, currentReviewer, prNumbers);
      const newPREntry = { id: uuidv4(), prNumbers, grade: 'Okay' };
      setReviewerData(
        currentReviewers.map(item =>
          item.id === reviewerId
            ? {
                ...item,
                gradedPrs: [...item.gradedPrs, newPREntry],
                prsReviewed: item.gradedPrs.length + 1,
              }
            : item,
        ),
      );
      setActiveInput(null);
      setInputValue('');
      setInputError('');
    } catch {
      setInputError('Could not save this PR. Please try again.');
    } finally {
      setIsSavingPR(false);
    }
  };

  const handleCancelInput = () => {
    if (isFinalized || isSavingPR) return;
    setActiveInput(null);
    setInputValue('');
    setInputError('');
  };

  const handlePRNumberClick = reviewerId => {
    if (isFinalized || isLoadingSaved || loadError) return;
    setGradeError('');
    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = async (reviewerId, prId, newGrade) => {
    if (isFinalized || isLoadingSaved || isSavingGrade || loadError) return;
    const reviewer = reviewerData.find(item => item.id === reviewerId);
    const pr = reviewer?.gradedPrs.find(item => item.id === prId);
    if (!pr || pr.grade === newGrade) return;

    setIsSavingGrade(true);
    setGradeError('');
    try {
      const savedGrade = newGrade === 'Cannot find image' ? 'No Correct Image' : newGrade;
      await saveGradeChange(teamData, reviewer, pr.prNumbers, savedGrade);
      setReviewerData(prev =>
        prev.map(item =>
          item.id === reviewerId
            ? {
                ...item,
                gradedPrs: item.gradedPrs.map(gradedPR =>
                  gradedPR.id === prId ? { ...gradedPR, grade: newGrade } : gradedPR,
                ),
              }
            : item,
        ),
      );
    } catch {
      setGradeError('Could not save this grade. Please try again.');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleCloseGradingModal = () => {
    if (isSavingGrade) return;
    setShowGradingModal(null);
    setGradeError('');
  };

  if (!teamData || !reviewers) return <div>Error: Missing required props</div>;

  return (
    <PRGradingView
      darkMode={darkMode}
      teamData={teamData}
      isFinalized={isFinalized}
      onFinalize={() => setIsFinalized(true)}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      availableRoles={availableRoles}
      onClearSearch={handleClearSearch}
      filteredReviewers={filteredReviewers}
      promotedReviewerIds={promotedReviewerIds}
      onPromoteClick={handlePromoteClick}
      activeInput={activeInput}
      inputValue={inputValue}
      inputError={inputError}
      loadError={loadError}
      gradeError={gradeError}
      isLoadingSaved={isLoadingSaved}
      isSavingPR={isSavingPR}
      isSavingGrade={isSavingGrade}
      onInputValueChange={value => {
        setInputValue(value);
        setInputError('');
      }}
      onAddNewClick={handleAddNewClick}
      onInputSubmit={handleInputSubmit}
      onCancelInput={handleCancelInput}
      onPRNumberClick={handlePRNumberClick}
      promotingReviewer={promotingReviewer}
      onConfirmPromotion={handleConfirmPromotion}
      onCancelPromotion={handleCancelPromotion}
      showGradingModal={showGradingModal}
      onCloseGradingModal={handleCloseGradingModal}
      gradingReviewer={reviewerData.find(reviewer => reviewer.id === showGradingModal)}
      onGradeChange={handleGradeChange}
    />
  );
};

PRGradingScreen.propTypes = {
  teamData: PropTypes.shape({
    teamName: PropTypes.string.isRequired,
    dateRange: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  reviewers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      reviewer: PropTypes.string.isRequired,
      role: PropTypes.string,
      prsNeeded: PropTypes.number,
      gradedPrs: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          prNumbers: PropTypes.string.isRequired,
          grade: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ).isRequired,
};

export default PRGradingScreen;
