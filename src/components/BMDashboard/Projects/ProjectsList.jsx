import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Row, Col } from 'reactstrap';
import Select from 'react-select';
import ProjectSummary from './ProjectSummary';
import styles from '../BMDashboard.module.css';
import summaryStyles from './ProjectSummary.module.css';
import { PROJECT_PARAM, readProjectIds, updateDashboardQuery } from '../dashboardQuery';
import { exportProjectSummaries } from './exportProjectSummaries';

function ProjectsList() {
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const history = useHistory();
  const { search } = useLocation();
  const listRef = useRef(null);
  const exportingRef = useRef(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [exportError, setExportError] = useState('');
  const hasProjectSelection = new URLSearchParams(search).has(PROJECT_PARAM);
  const selectedIds = readProjectIds(search);
  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const handleSelectChange = selectedOptions => {
    const nextIds = (selectedOptions || []).map(option => option.value);
    if (
      nextIds.length === selectedProjects.length &&
      nextIds.every(id => selectedProjects.some(option => option.value === id))
    ) {
      return;
    }
    updateDashboardQuery(history, { [PROJECT_PARAM]: nextIds });
  };

  const selectedProjects = projectOptions.filter(option => selectedIds.includes(option.value));
  const filteredProjects = hasProjectSelection
    ? projects.filter(project => selectedProjects.some(selected => selected.value === project._id))
    : projects;

  const handleExport = async format => {
    if (exportingRef.current) return;
    const summaries = Array.from(listRef.current?.querySelectorAll('section[aria-label]') || []);
    if (!summaries.length) {
      setExportError('No project summaries are available to export.');
      return;
    }
    exportingRef.current = true;
    setExporting(true);
    setExportError('');
    setExportMessage(`Preparing ${format.toUpperCase()} export...`);
    const selectionContext = hasProjectSelection
      ? `Selected project summaries: ${summaries.length}${
          selectedIds.length > selectedProjects.length ? ' (unavailable selections omitted)' : ''
        }`
      : `All displayed project summaries: ${summaries.length}`;
    try {
      await exportProjectSummaries({ summaries, selectionContext, format });
      setExportMessage(`${format.toUpperCase()} export created; download started.`);
    } catch (error) {
      setExportMessage('');
      setExportError(`Export failed: ${error.message || 'Please try again.'}`);
    } finally {
      exportingRef.current = false;
      setExporting(false);
    }
  };

  // Custom styles for react-select in dark mode
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
      <Col md="8" lg="6" className="mb-3" style={{ margin: '0 auto' }}>
        <Select
          isMulti
          options={projectOptions}
          value={selectedProjects}
          onChange={handleSelectChange}
          placeholder="Select Projects"
          styles={selectStyles}
          classNamePrefix="react-select"
        />
      </Col>
      <Col xs="12" className="mb-3">
        <div role="group" aria-label="Export project summaries">
          <button
            type="button"
            className="btn btn-secondary mr-2"
            disabled={exporting || !filteredProjects.length}
            onClick={() => handleExport('pdf')}
          >
            Export PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={exporting || !filteredProjects.length}
            onClick={() => handleExport('png')}
          >
            Export PNG
          </button>
        </div>
        <p role="status" aria-live="polite">
          {exportMessage}
        </p>
        {exportError && <p role="alert">{exportError}</p>}
      </Col>
      <Col xs="12" className={summaryStyles.summaryListContainer}>
        {filteredProjects.length ? (
          <ul
            ref={listRef}
            className={`${styles.projectsList} ${summaryStyles.summaryList} ${
              darkMode ? styles.darkProjectsList : styles.lightProjectsList
            }`}
          >
            {filteredProjects.map(project => (
              <li
                className={`${darkMode ? styles.darkProjectSummary : styles.projectSummary}`}
                key={project._id}
              >
                <ProjectSummary project={project} />
              </li>
            ))}
          </ul>
        ) : hasProjectSelection ? (
          <div>
            <p role="status">
              Selected projects are unavailable or still loading. Clear the selection to show all
              projects.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => updateDashboardQuery(history, { [PROJECT_PARAM]: [] })}
            >
              Clear project selection
            </button>
          </div>
        ) : (
          <p className={darkMode ? 'text-light' : ''}>No projects data</p>
        )}
      </Col>
    </Row>
  );
}

export default ProjectsList;
