import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, FormGroup, Label, Spinner } from 'reactstrap';
import Select from 'react-select';
import ProjectSummary from './ProjectSummary';
import styles from '../BMDashboard.module.css';

function ProjectsList() {
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const handleSelectChange = selectedOptions => {
    setIsUpdating(true);

    timeoutRef.current = setTimeout(() => {
      setSelectedProjects(selectedOptions || []);
      setIsUpdating(false);
    }, 600);
  };

  const filteredProjects = selectedProjects.length
    ? projects.filter(project => selectedProjects.some(selected => selected.value === project._id))
    : projects;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: darkMode ? '#2a3f5f' : base.backgroundColor,
      borderColor: darkMode ? '#3a506b' : base.borderColor,
      color: darkMode ? '#e0e0e0' : base.color,
      boxShadow: state.isFocused
        ? darkMode
          ? '0 0 0 1px #6af1ea'
          : base.boxShadow
        : base.boxShadow,
      '&:hover': {
        borderColor: darkMode
          ? '#5a7a9b'
          : base['&:hover']
          ? base['&:hover'].borderColor
          : base.borderColor,
      },
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#1c2541' : base.backgroundColor,
      border: darkMode ? '1px solid #3a506b' : base.border,
    }),
    option: (base, state) => {
      let backgroundColor = base.backgroundColor;
      if (state.isSelected) {
        backgroundColor = darkMode ? '#3a506b' : base.backgroundColor;
      } else if (state.isFocused) {
        backgroundColor = darkMode ? '#2a3f5f' : base.backgroundColor;
      } else {
        backgroundColor = darkMode ? '#1c2541' : base.backgroundColor;
      }

      return {
        ...base,
        backgroundColor,
        color: darkMode ? '#e0e0e0' : base.color,
        '&:hover': {
          backgroundColor: darkMode
            ? '#3a506b'
            : base['&:hover']
            ? base['&:hover'].backgroundColor
            : base.backgroundColor,
        },
      };
    },
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#3a506b' : base.backgroundColor,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#ffffff' : base.color,
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#ffffff' : base.color,
      '&:hover': {
        backgroundColor: darkMode ? '#5a7a9b' : '#e9ecef',
        color: darkMode ? '#ffffff' : '#495057',
      },
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#b5bac5' : base.color,
    }),
    singleValue: base => ({
      ...base,
      color: darkMode ? '#e0e0e0' : base.color,
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#e0e0e0' : base.color,
    }),
  };

  return (
    <Row
      className="ml-0 text-center mt-5"
      style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}
    >
      <Col md="8" lg="6" className="mb-4" style={{ margin: '0 auto' }}>
        <FormGroup className="text-left" style={{ textAlign: 'left' }}>
          <Label
            className={darkMode ? 'text-light' : ''}
            style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}
          >
            Filter Building Summaries
          </Label>

          <Select
            isMulti
            isDisabled={isUpdating}
            options={projectOptions}
            onChange={handleSelectChange}
            placeholder="Select a project to view summary details."
            styles={selectStyles}
            classNamePrefix="react-select"
            value={selectedProjects}
          />

          <small className={`form-text ${darkMode ? 'text-light opacity-75' : 'text-muted'} mt-2`}>
            Select one or multiple projects from the dropdown to filter the inventory and building
            data below.
          </small>
        </FormGroup>
      </Col>

      <Col xs="12">
        <div
          className="d-flex align-items-center justify-content-center mb-3"
          style={{ minHeight: '40px' }}
        >
          <h3 className={`m-0 ${darkMode ? 'text-light' : ''}`} style={{ fontSize: '1.4rem' }}>
            {selectedProjects.length > 0
              ? `Showing Summary for: ${selectedProjects.map(p => p.label).join(', ')}`
              : 'Showing All Projects'}
          </h3>
          {isUpdating && (
            <Spinner size="sm" color="primary" className="ml-3" style={{ marginLeft: '15px' }} />
          )}
        </div>

        {filteredProjects.length ? (
          <ul
            className={`${styles.projectsList} ${
              darkMode ? styles.darkProjectsList : styles.lightProjectsList
            }`}
            style={{
              opacity: isUpdating ? 0.6 : 1,
              transition: 'opacity 0.2s ease',
              listStyleType: 'none',
              paddingLeft: 0,
              margin: '0 auto',
            }}
          >
            {filteredProjects.map(project => (
              <li
                className={`${darkMode ? styles.darkProjectSummary : styles.projectSummary}`}
                key={project._id}
                style={{
                  listStyleType: 'none',
                  marginBottom: '3rem',
                }}
              >
                <ProjectSummary project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={darkMode ? 'text-light mt-4' : 'mt-4'}>
            No projects data available for the selected filters.
          </p>
        )}
      </Col>
    </Row>
  );
}

export default ProjectsList;
