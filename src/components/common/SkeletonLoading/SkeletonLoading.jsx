import React from 'react';
import './SkeletonLoading.css';
import { Container } from 'reactstrap';

const SkeletonLoading = ({ template }) => {
  const renderSkeletonTemplate = () => {
    switch (template) {
      case 'Timelog':
        return (
          <Container fluid="md">
            <div className="skeleton-loading-timelog">
              <div className="skeleton-loading-item-timelog"></div>
              <div className="skeleton-loading-item-timelog"></div>
              <div className="skeleton-loading-item-add-intangible"></div>
            </div>
          </Container>
        );
      case 'TimelogFilter':
        return (
          <div className="skeleton-loading-timelog-filter">
            <div className="skeleton-loading-timelog-filter-item"></div>
            <div className="skeleton-loading-timelog-filter-item"></div>
            <div className="skeleton-loading-timelog-filter-item"></div>
          </div>
        );
      case 'TeamMemberTasks':
        return (
          <>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
            <tr>
              <td colSpan={5} className="skeleton-loading-team-member-tasks-row"></td>
            </tr>
          </>
        );
      default:
        return null;
    }
  };

  return renderSkeletonTemplate();
};

export default SkeletonLoading;
