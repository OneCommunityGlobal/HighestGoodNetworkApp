import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import styles from './HelpModal.module.css';

function HelpModal({ show, onHide, auth }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Help Categories
  useEffect(() => {
    const fetchHelpCategories = async () => {
      try {
        const response = await axios.get(ENDPOINTS.HELP_CATEGORIES);
        setOptions(response.data.map(category => category.name));
        setLoading(false);
      } catch (err) {
        setError('Failed to load help categories');
        setLoading(false);
      }
    };
    fetchHelpCategories();
  }, []);

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

  const renderContent = () => {
    if (loading) return <div>Loading categories...</div>;
    if (error) return <div className="text-danger">{error}</div>;

    return (
      <>
        <div
          className={styles.selectButton}
          onClick={() => setIsOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') setIsOpen(!isOpen);
          }}
        >
          <span className={`${styles.selectButtonText} ${selectedOption ? styles.selected : ''}`}>
            {selectedOption || 'Select an option'}
          </span>
          <span className={`${styles.selectButtonArrow} ${isOpen ? styles.open : ''}`} />
        </div>
        {isOpen && (
          <div className={styles.selectOptions} role="listbox">
            {options.map(option => (
              <div
                key={option}
                className={styles.selectOption}
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

  // ---- Access Logic ----
  const user = auth?.user || {};
  const role = user.role?.trim().toLowerCase() || '';

  const allowedRoles = ['owner', 'administrator'];

  // User must be in Software Development Team OR have one of the allowed roles
  const isSoftwareDevMember =
    user.teams?.some(team => team.teamName?.trim().toLowerCase() === 'software development team') ||
    allowedRoles.includes(role);

  console.log('User Role:', role);
  console.log('Teams:', user.teams);
  console.log('isSoftwareDevMember:', isSoftwareDevMember);

  // ---- Modal Layout ----
  return (
    <Modal show={show} onHide={onHide} className={styles.helpModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>What do you need help with?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.selectContainer}>{renderContent()}</div>

        {!isSoftwareDevMember && (
          <div className="alert alert-warning mt-3">
            Only members from the software development team can seek help
          </div>
        )}

        <p className={styles.textMuted}>
          If you have any suggestions please click
          <button
            type="button"
            className="btn btn-link p-0 border-0 align-baseline"
            onClick={handleSuggestionsClick}
            style={{
              color: '#0066CC',
              textDecoration: 'none',
              marginLeft: '4px',
            }}
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

// ---- PropTypes ----
HelpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    user: PropTypes.shape({
      role: PropTypes.string,
      teams: PropTypes.arrayOf(
        PropTypes.shape({
          teamName: PropTypes.string,
        }),
      ),
    }),
  }).isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(HelpModal);
