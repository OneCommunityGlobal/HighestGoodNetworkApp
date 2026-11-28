import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
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

function HelpModal({ show, onHide }) {
  const history = useHistory();

  const [selectedOption, setSelectedOption] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          setOptions(buildSkillFallbackOptions());
        }
      } catch {
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

  const handleSelect = optionValue => {
    setSelectedOption(optionValue);
    setIsOpen(false);
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error('Please select a help category');
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
        <Button variant="primary" onClick={handleSubmit} disabled={!selectedOption || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

HelpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(HelpModal);
