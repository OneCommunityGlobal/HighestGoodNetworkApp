import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import PRGradingView from './PRGradingView';
import { usePRPromotion } from './usePRPromotion';

const PRGradingScreen = ({ teamData, reviewers }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  // Reviewer & grading state
  const [reviewerData, setReviewerData] = useState(reviewers || []);
  const [activeInput, setActiveInput] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [showGradingModal, setShowGradingModal] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // Promotion business logic & state from hook
  const {
    promotingReviewer,
    promotedReviewerIds,
    handlePromoteClick,
    handleConfirmPromotion,
    handleCancelPromotion,
  } = usePRPromotion(teamData?.teamName);

  // Search filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  /* ---------------- SEARCH FILTER ---------------- */

  const availableRoles = useMemo(() => {
    const roles = reviewerData.map(r => r.role).filter(Boolean);
    return [...new Set(roles)];
  }, [reviewerData]);

  const filteredReviewers = useMemo(() => {
    return reviewerData.filter(r => {
      const nameMatch = r.reviewer.toLowerCase().includes(searchTerm.toLowerCase());
      const roleMatch = roleFilter ? r.role === roleFilter : true;
      return nameMatch && roleMatch;
    });
  }, [reviewerData, searchTerm, roleFilter]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setRoleFilter('');
  };

  /* ---------------- ADD PR HANDLERS ---------------- */

  const validatePRNumber = value => {
    const trimmed = value.trim();
    const pattern = /^\d+(\s*\+\s*\d+)?$/;
    if (!trimmed) return false;
    return pattern.test(trimmed);
  };

  const handleAddNewClick = reviewerId => {
    if (isFinalized) return;
    setActiveInput(reviewerId);
    setInputValue('');
  };

  const handleInputSubmit = reviewerId => {
    if (isFinalized) return;
    if (!validatePRNumber(inputValue)) {
      return;
    }
    const newPREntry = { id: uuidv4(), prNumbers: inputValue.trim(), grade: 'Okay' };
    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId
          ? { ...r, gradedPrs: [...r.gradedPrs, newPREntry], prsReviewed: r.gradedPrs.length + 1 }
          : r,
      ),
    );
    setActiveInput(null);
    setInputValue('');
  };

  const handleCancelInput = () => {
    if (isFinalized) return;
    setActiveInput(null);
    setInputValue('');
  };

  /* ---------------- MODAL HANDLERS ---------------- */

  const handlePRNumberClick = reviewerId => {
    if (isFinalized) return;
    setShowGradingModal(reviewerId);
  };

  const handleGradeChange = (reviewerId, prId, newGrade) => {
    if (isFinalized) return;
    setReviewerData(prev =>
      prev.map(r =>
        r.id === reviewerId
          ? {
              ...r,
              gradedPrs: r.gradedPrs.map(pr => (pr.id === prId ? { ...pr, grade: newGrade } : pr)),
            }
          : r,
      ),
    );
  };

  const handleCloseGradingModal = () => setShowGradingModal(null);
  const handleFinalize = () => setIsFinalized(true);

  if (!teamData || !reviewers) {
    return <div>Error: Missing required props</div>;
  }

  return (
    <PRGradingView
      darkMode={darkMode}
      teamData={teamData}
      isFinalized={isFinalized}
      onFinalize={handleFinalize}
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
      onInputValueChange={setInputValue}
      onAddNewClick={handleAddNewClick}
      onInputSubmit={handleInputSubmit}
      onCancelInput={handleCancelInput}
      onPRNumberClick={handlePRNumberClick}
      promotingReviewer={promotingReviewer}
      onConfirmPromotion={handleConfirmPromotion}
      onCancelPromotion={handleCancelPromotion}
      showGradingModal={showGradingModal}
      onCloseGradingModal={handleCloseGradingModal}
      gradingReviewer={reviewerData.find(r => r.id === showGradingModal)}
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
