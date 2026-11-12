import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { availableSkills, formatSkillName } from '../HGNHelpSkillsDashboard/FilerData';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import styles from './HelpModal.module.css';

/** Maps common help-category labels to questionnaire skill keys. */
const TOPIC_TO_SKILL_KEY = {
  figma: 'UIUXTools',
  'ui/ux': 'UIUXTools',
  'frontend and backend overall': 'combined_frontend_backend',
  'frontend/backend': 'combined_frontend_backend',
  mern: 'mern_skills',
  leadership: 'leadership_skills',
};

const buildSkillFallbackOptions = () =>
  availableSkills.map(skillKey => ({
    value: skillKey,
    label: formatSkillName(skillKey),
  }));

const normalizeCategoryOptions = categories => {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  return categories
    .map(category => {
      if (typeof category === 'string') {
        return { value: category, label: category };
      }
      const name = category?.name;
      if (!name) return null;
      return { value: name, label: name };
    })
    .filter(Boolean);
};

const resolveSkillKey = selectedTopic => {
  if (!selectedTopic) return null;
  if (availableSkills.includes(selectedTopic)) return selectedTopic;

  const byLabel = availableSkills.find(
    skillKey => formatSkillName(skillKey).toLowerCase() === selectedTopic.toLowerCase(),
  );
  if (byLabel) return byLabel;

  return TOPIC_TO_SKILL_KEY[selectedTopic.trim().toLowerCase()] || null;
};

function HelpModal({ show, onHide, auth }) {
  const history = useHistory();
  const [selectedOption, setSelectedOption] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // null = not yet determined (loading or unknown due to a failed request); true/false = backend result
  const [eligible, setEligible] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [eligibilityError, setEligibilityError] = useState(false);
  const userId = auth?.user?.userid;
  const previousShowRef = useRef(show);
  const previousUserIdRef = useRef(userId);
  const hasRunEligibilityEffectRef = useRef(false);
  // Monotonic id so only the most recent eligibility request may update state.
  const eligibilityRequestIdRef = useRef(0);

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchHelpCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const categoriesResponse = await httpService.get(ENDPOINTS.HELP_CATEGORIES);
        const apiOptions = normalizeCategoryOptions(categoriesResponse.data);

        if (apiOptions.length > 0) {
          setOptions(apiOptions);
        } else {
          // DB may be empty — fall back to questionnaire skills so the dropdown is usable
          setOptions(buildSkillFallbackOptions());
        }
      } catch {
        // Still offer skill fallback, but surface that the categories endpoint failed.
        setOptions(buildSkillFallbackOptions());
        setError(
          'Failed to load help categories from the server. Showing questionnaire skills instead.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHelpCategories();
  }, []);

  useEffect(() => {
    const isInitialRun = !hasRunEligibilityEffectRef.current;
    const isReopening = !previousShowRef.current && show;
    const userChanged = previousUserIdRef.current !== userId;
    hasRunEligibilityEffectRef.current = true;
    previousShowRef.current = show;
    previousUserIdRef.current = userId;

    if (!userId) {
      // Invalidate any in-flight request so it cannot update state for a signed-out user.
      eligibilityRequestIdRef.current += 1;
      setEligibilityLoading(false);
      return undefined;
    }

    const fetchEligibility = async () => {
      eligibilityRequestIdRef.current += 1;
      const requestId = eligibilityRequestIdRef.current;
      const isLatest = () => requestId === eligibilityRequestIdRef.current;
      setEligibilityLoading(true);
      setEligibilityError(false);
      try {
        const eligibilityResponse = await httpService.get(ENDPOINTS.HELP_REQUEST_ELIGIBILITY);
        if (!isLatest()) return;
        setEligible(Boolean(eligibilityResponse.data?.eligible));
      } catch {
        // A superseded request's failure must not overwrite a newer result.
        if (!isLatest()) return;
        // A failed eligibility check is not proof of ineligibility; keep eligible unknown (null).
        setEligible(null);
        setEligibilityError(true);
      } finally {
        if (isLatest()) setEligibilityLoading(false);
      }
    };

    if (isInitialRun || isReopening || userChanged) {
      void fetchEligibility();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void fetchEligibility();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId, show]);

  const handleSelect = optionValue => {
    setSelectedOption(optionValue);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error('Please select a help category');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await httpService.post(ENDPOINTS.HELP_REQUEST_CREATE, {
        topic: selectedOption,
        description: `Help request for: ${selectedOption}`,
      });

      toast.success('Help request submitted successfully!');

      const helpTopic = selectedOption;
      const selectedSkillKey = resolveSkillKey(helpTopic);

      setSelectedOption('');

      // Navigate to community helpers; do not call onHide() (HelpPage would redirect to dashboard).
      history.push({
        pathname: '/hgnhelp/community',
        state: {
          initialSkills: selectedSkillKey ? [selectedSkillKey] : [],
          softwareDevTeamOnly: true,
          helpTopic,
        },
      });
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        toast.error('Cannot connect to server. Please ensure the backend is running.');
      } else {
        const errorMessage =
          err.response?.data?.message || 'Failed to submit help request. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionsClick = () => {
    localStorage.setItem('openSuggestionsModal', 'true');
    onHide();
  };

  const selectedLabel =
    options.find(option => option.value === selectedOption)?.label || selectedOption;

  const renderContent = () => {
    if (loading) return <div>Loading categories...</div>;
    if (!options.length) {
      return <div className="text-danger">{error || 'No help categories available.'}</div>;
    }

    return (
      <>
        {error && <div className="alert alert-warning mb-3">{error}</div>}
        <div
          className={`${styles.selectButton} ${darkMode ? styles.selectButtonDark : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
          }}
        >
          <span
            className={`${styles.selectButtonText}
              ${selectedOption ? styles.selected : ''}
              ${darkMode ? styles.selectButtonTextDark : ''}
              ${darkMode && selectedOption ? styles.selectedDark : ''}
            `}
          >
            {selectedLabel || 'Select an option'}
          </span>

          <span
            className={`${styles.selectButtonArrow} ${isOpen ? styles.open : ''} ${
              darkMode ? styles.selectButtonArrowDark : ''
            }`}
          />
        </div>

        {isOpen && (
          <div
            className={`${styles.selectOptions} ${darkMode ? styles.selectOptionsDark : ''}`}
            role="listbox"
          >
            {options.map(option => (
              <div
                key={option.value}
                className={`${styles.selectOption} ${darkMode ? styles.selectOptionDark : ''}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelect(option.value);
                }}
                aria-selected={selectedOption === option.value}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={`${styles.helpModal} ${darkMode ? styles.darkMode : ''}`}
    >
      <Modal.Header closeButton>
        <Modal.Title>What do you need help with?</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className={styles.selectContainer}>{renderContent()}</div>

        {!eligibilityLoading && eligibilityError && (
          <div className="alert alert-warning mt-3">
            Unable to verify your eligibility right now. Please try again later.
          </div>
        )}

        {!eligibilityLoading && !eligibilityError && eligible === false && (
          <div className="alert alert-warning mt-3">
            You must complete the HGN questionnaire and belong to an eligible HGN team or role to
            submit a help request.
          </div>
        )}

        <p className={`${styles.textMuted} ${darkMode ? styles.textMutedDark : ''}`}>
          If you have any suggestions please click{' '}
          <button
            type="button"
            className={`${styles.suggestionsLink} ${darkMode ? styles.suggestionsLinkDark : ''}`}
            onClick={handleSuggestionsClick}
          >
            here
          </button>
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedOption || eligibilityLoading || eligible !== true || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

HelpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    user: PropTypes.shape({
      userid: PropTypes.string,
      role: PropTypes.string,
    }),
  }).isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(HelpModal);
