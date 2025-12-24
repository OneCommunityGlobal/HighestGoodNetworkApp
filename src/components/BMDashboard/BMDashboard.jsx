import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'reactstrap';
import { fetchBMProjects } from '../../actions/bmdashboard/projectActions';
import ProjectsList from './Projects/ProjectsList';
import ProjectSelectForm from './Projects/ProjectSelectForm';
import BMError from './shared/BMError';
import './BMDashboard.module.css';

export function BMDashboard() {
  const [isError, setIsError] = useState(false);

  const dispatch = useDispatch();
  const errors = useSelector(state => state.errors || {});
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // fetch projects data on pageload
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // trigger an error state if there is an errors object
  useEffect(() => {
    if (Object.entries(errors).length) {
      setIsError(true);
    }
  }, [errors]);

  // Enhanced text visibility enforcement for both dark and light modes
  useEffect(() => {
    const ensureTextVisibility = () => {
      const bmContainer = document.querySelector('.bm-dashboard-container');
      if (bmContainer) {
        // Target all text elements within BMDashboard
        const textElements = bmContainer.querySelectorAll('*');
        textElements.forEach(element => {
          const hasText = element.textContent && element.textContent.trim().length > 0;
          const isTextElement = [
            'P',
            'SPAN',
            'DIV',
            'H1',
            'H2',
            'H3',
            'H4',
            'H5',
            'H6',
            'LABEL',
            'A',
            'LI',
            'TD',
            'TH',
            'BUTTON',
          ].includes(element.tagName);

          if (hasText && isTextElement) {
            if (darkMode) {
              // Dark mode: force white text with shadow
              element.style.setProperty('color', '#ffffff', 'important');
              element.style.setProperty('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.5)', 'important');
            } else {
              // Light mode: force dark text, remove shadow
              element.style.setProperty('color', '#333333', 'important');
              element.style.removeProperty('text-shadow');
            }
          }
        });

        // Handle containers - only target containers within BMDashboard, not ProjectDetails
        const containers = bmContainer.querySelectorAll(
          '.container, .projects-list, .project-summary',
        );
        containers.forEach(container => {
          // Skip if it's inside ProjectDetails (has project-details class in parent)
          const isInProjectDetails = container.closest('.project-details, .project-details-dark');
          if (isInProjectDetails) {
            return; // Don't override ProjectDetails styles
          }

          if (darkMode) {
            container.style.setProperty('background-color', '#1b2a41', 'important');
            container.style.setProperty('color', '#ffffff', 'important');
          } else {
            container.style.setProperty('background-color', '#ffffff', 'important');
            container.style.setProperty('color', '#333333', 'important');
          }
        });

        // Handle LogBar headings specifically - only within BMDashboard, not ProjectDetails
        const logBarHeadings = bmContainer.querySelectorAll(
          '.log-bar h2, .log-bar-dark h2, .log-bar__section h2',
        );
        logBarHeadings.forEach(heading => {
          // Skip if it's inside ProjectDetails (has project-details class in parent)
          const isInProjectDetails = heading.closest('.project-details, .project-details-dark');
          if (isInProjectDetails) {
            return; // Don't override ProjectDetails LogBar styles
          }

          if (darkMode) {
            heading.style.setProperty('color', '#ffffff', 'important');
            heading.style.setProperty('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.5)', 'important');
          } else {
            heading.style.setProperty('color', '#333333', 'important');
            heading.style.removeProperty('text-shadow');
          }
        });

        // Handle input and form elements
        const inputs = bmContainer.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
          if (darkMode) {
            input.style.setProperty('background-color', '#2a3f5f', 'important');
            input.style.setProperty('color', '#ffffff', 'important');
            input.style.setProperty('border-color', '#3a506b', 'important');
          } else {
            input.style.setProperty('background-color', '#ffffff', 'important');
            input.style.setProperty('color', '#333333', 'important');
            input.style.setProperty('border-color', '#ced4da', 'important');
          }
        });

        // Handle button styles
        const buttons = bmContainer.querySelectorAll('button, .btn');
        buttons.forEach(button => {
          if (darkMode) {
            button.style.setProperty('background-color', '#3a506b', 'important');
            button.style.setProperty('color', '#ffffff', 'important');
            button.style.setProperty('border-color', '#5a7a9b', 'important');
          } else {
            button.style.setProperty('background-color', '#007bff', 'important');
            button.style.setProperty('color', '#ffffff', 'important');
            button.style.setProperty('border-color', '#007bff', 'important');
          }
        });

        // Handle project summary spans specifically
        const summarySpans = bmContainer.querySelectorAll('.project-summary_span');
        summarySpans.forEach(span => {
          if (darkMode) {
            span.style.setProperty('color', '#6af1ea', 'important');
          } else {
            span.style.setProperty('color', '#007bff', 'important');
          }
        });

        // Handle project summary labels
        const summaryLabels = bmContainer.querySelectorAll('.project-summary_label');
        summaryLabels.forEach(label => {
          if (darkMode) {
            label.style.setProperty('color', '#b5bac5', 'important');
          } else {
            label.style.setProperty('color', '#6c757d', 'important');
          }
        });
      }
    };

    // Run immediately
    ensureTextVisibility();

    // Set up observer to handle dynamic content
    const observer = new MutationObserver(() => {
      ensureTextVisibility();
    });

    const target = document.querySelector('.bm-dashboard-container');
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [darkMode]);

  return (
    <Container
      className={`justify-content-center align-items-center bm-dashboard-container ${
        darkMode ? 'bm-dashboard-dark' : 'bm-dashboard-light'
      }`}
    >
      <header
        className={`bm-dashboard__header ${
          darkMode ? 'bm-dashboard__header-dark' : 'bm-dashboard__header-light'
        }`}
      >
        <h1 className={darkMode ? 'text-light' : 'text-dark'}>
          Building and Inventory Management Dashboard
        </h1>
      </header>
      <main
        className={`bm-dashboard-main ${
          darkMode ? 'bm-dashboard-main-dark' : 'bm-dashboard-main-light'
        }`}
      >
        {isError ? (
          <BMError errors={errors} />
        ) : (
          <>
            <ProjectSelectForm />
            <ProjectsList />
          </>
        )}
      </main>
    </Container>
  );
}

export default BMDashboard;
