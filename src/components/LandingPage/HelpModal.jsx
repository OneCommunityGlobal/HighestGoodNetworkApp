import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import styles from './HelpModal.module.css';

function HelpModal({ show, onHide, auth }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);

  const darkMode = useSelector(state => state.theme.darkMode);

  const userId = auth?.user?.userid;

  useEffect(() => {
    const fetchHelpCategories = async () => {
      try {
        const categoriesResponse = await axios.get(ENDPOINTS.HELP_CATEGORIES);
        setOptions(categoriesResponse.data.map(category => category.name));
      } catch {
        setError('Failed to load help categories');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpCategories();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const profileResponse = await axios.get(ENDPOINTS.USER_PROFILE(userId));
        setTeams(profileResponse.data?.teams || []);
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        setTeams([]);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleSelect = option => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onHide();
    }
  };

  const handleSuggestionsClick = () => {
    localStorage.setItem('openSuggestionsModal', 'true');
    onHide();
  };

  /* ---------------- Access Logic ---------------- */
  const role = auth?.user?.role?.trim().toLowerCase() || '';

  const allowedRoles = useMemo(() => new Set(['owner', 'administrator']), []);

  const isSoftwareDevMember = useMemo(() => {
    return (
      allowedRoles.has(role) ||
      teams.some(team => team.teamName?.trim().toLowerCase() === 'software development team')
    );
  }, [allowedRoles, teams, role]);

  const renderContent = () => {
    if (loading) return <div>Loading categories...</div>;
    if (error) return <div className="text-danger">{error}</div>;

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
            {selectedOption || 'Select an option'}
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
                key={option}
                className={`${styles.selectOption} ${darkMode ? styles.selectOptionDark : ''}`}
                onClick={() => handleSelect(option)}
                role="option"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelect(option);
                }}
                aria-selected={selectedOption === option}
              >
                {option}
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
          disabled={!selectedOption || !isSoftwareDevMember}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ---------------- PropTypes ---------------- */
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
