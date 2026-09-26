import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { availableSkills, formatSkillName } from '../HGNHelpSkillsDashboard/FilerData';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import styles from './HelpModal.module.css';

const SOFTWARE_DEV_TEAM_NAME = 'software development team';

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
  const [teams, setTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const userId = auth?.user?.userid;

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
        setOptions(buildSkillFallbackOptions());
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpCategories();
  }, []);

  useEffect(() => {
    if (!userId) return undefined;

    const fetchUserProfile = async () => {
      try {
        const profileResponse = await httpService.get(ENDPOINTS.USER_PROFILE(userId));
        setTeams(profileResponse.data?.teams || []);
      } catch {
        setTeams([]);
      }
    };

    fetchUserProfile();
    return undefined;
  }, [userId]);

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
        userId,
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

  const role = auth?.user?.role?.trim().toLowerCase() || '';
  const allowedRoles = useMemo(() => new Set(['owner', 'administrator']), []);

  const isSoftwareDevMember = useMemo(() => {
    return (
      allowedRoles.has(role) ||
      teams.some(team => team.teamName?.trim().toLowerCase() === SOFTWARE_DEV_TEAM_NAME)
    );
  }, [allowedRoles, teams, role]);

  const selectedLabel =
    options.find(option => option.value === selectedOption)?.label || selectedOption;

  const renderContent = () => {
    if (loading) return <div>Loading categories...</div>;
    if (error) return <div className="text-danger">{error}</div>;
    if (!options.length) {
      return <div className="text-danger">No help categories available.</div>;
    }

    return (
      <>
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

        {!isSoftwareDevMember && (
          <div className="alert alert-warning mt-3">
            Only members of the Software Development Team can submit requests.
          </div>
        )}

        <p className={`${styles.textMuted} ${darkMode ? styles.textMutedDark : ''}`}>
          If you have any suggestions please click{' '}
          <button
            type="button"
            className="p-0 border-0 align-baseline"
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
          disabled={!selectedOption || !isSoftwareDevMember || isSubmitting}
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
