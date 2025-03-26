// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';

const skillOptions = [
  { value: 'leadership_experience', label: 'Leadership Experience' },
  { value: 'leadership_skills', label: 'Leadership Skills' },
  { value: 'frontend_backend_overall', label: 'Frontend and Backend Overall' },
  { value: 'figma', label: 'Figma' },
  { value: 'responsive_ui', label: 'Responsive UI' },
  { value: 'html_semantics', label: 'HTML Semantics' },
  { value: 'bootstrap', label: 'Bootstrap' },
  { value: 'css_advanced', label: 'CSS Advanced' },
  { value: 'react_advanced', label: 'React Advanced' },
  { value: 'redux', label: 'Redux' },
  { value: 'web_sockets', label: 'Web Sockets' },
  { value: 'frontend_overall', label: 'Frontend Overall' },
  { value: 'backend_overall', label: 'Backend Overall' },
  { value: 'mern_stack', label: 'MERN Stack' },
  { value: 'tdd_backend', label: 'TDD Backend' },
  { value: 'database', label: 'Database' },
  { value: 'testing', label: 'Testing' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'version_control', label: 'Version Control' },
  { value: 'code_review', label: 'Code Review' },
  { value: 'environment_setup', label: 'Environment Setup' },
  { value: 'advanced_coding', label: 'Advanced Coding' },
  { value: 'agile', label: 'Agile' },
  { value: 'mongo_db', label: 'MongoDB' },
  { value: 'mock_mongo_db', label: 'Mock MongoDB' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'markdown_graphs', label: 'Markdown & Graphs' },
];

function HelpModal({ show, onHide }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const history = useHistory();

  const handleSubmit = e => {
    e.preventDefault();
    localStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
    history.push('/skills-overview');
    onHide();
  };

  const handleSuggestionClick = () => {
    history.push('/dashboard/feedback');
  };

  const customStyles = {
    control: base => ({
      ...base,
      minHeight: '50px',
      marginBottom: '20px',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" aria-labelledby="help-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title id="help-modal">What do you need help with?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Select
              isMulti
              name="skills"
              options={skillOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={selectedSkills}
              onChange={setSelectedSkills}
              styles={customStyles}
              placeholder="Select skills you need help with..."
            />
          </Form.Group>
          <div className="text-center mt-3 mb-4">
            <p className="text-muted">
              If you have any suggestions please click{' '}
              <Button
                variant="link"
                className="p-0"
                onClick={handleSuggestionClick}
                style={{ textDecoration: 'underline' }}
              >
                here
              </Button>
            </p>
          </div>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit" className="px-4">
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

HelpModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default HelpModal;
