// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import './HelpModal.css';

function HelpModal({ show, onHide }) {
  const [selectedOption, setSelectedOption] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    'Leadership Experience',
    'Leadership Skills',
    'Frontend and Backend Overall',
    'Figma',
    'Responsive UI',
    'HTML Semantics',
    'Bootstrap',
    'CSS Advanced',
    'React Advanced',
    'Redux',
    'Web Sockets',
    'Frontend Overall',
    'Backend Overall',
    'MERN Stack',
    'TDD Backend',
    'Database',
    'Testing',
    'Deployment',
    'Version Control',
    'Code Review',
    'Environment Setup',
    'Advanced Coding',
    'Agile',
    'MongoDB',
    'Mock MongoDB',
    'Documentation',
    'Markdown & Graphs'
  ];

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
    // Store a flag in localStorage to indicate we want to open the suggestions modal
    localStorage.setItem('openSuggestionsModal', 'true');
    onHide(); // Close the help modal and trigger navigation
  };

  return (
    <Modal show={show} onHide={onHide} className="help-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>What do you need help with?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="select-container">
          <div 
            className="select-button" 
            onClick={() => setIsOpen(!isOpen)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsOpen(!isOpen);
              }
            }}
          >
            <span className={`select-button-text ${selectedOption ? 'selected' : ''}`}>
              {selectedOption || 'Select an option'}
            </span>
            <span className={`select-button-arrow ${isOpen ? 'open' : ''}`} />
          </div>
          {isOpen && (
            <div className="select-options" role="listbox">
              {options.map(option => (
                <div
                  key={option}
                  className="select-option"
                  onClick={() => handleSelect(option)}
                  role="option"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelect(option);
                    }
                  }}
                  aria-selected={selectedOption === option}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-muted">
          If you have any suggestions please click
          <button
            type="button"
            className="btn btn-link p-0 border-0 align-baseline"
            onClick={handleSuggestionsClick}
            style={{ color: '#0066CC', textDecoration: 'none', marginLeft: '4px' }}
          >
            here
          </button>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleSubmit} disabled={!selectedOption}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

HelpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default HelpModal;
