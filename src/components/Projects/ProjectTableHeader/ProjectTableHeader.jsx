import React from 'react';
import PropTypes from 'prop-types';
import styles from '../projects.module.css';
import {
  PROJECT_NAME,
  ACTIVE,
  MEMBERS,
  WBS,
  PROJECT_CATEGORY,
  INVENTORY,
  ARCHIVE,
} from './../../../languages/en/ui';
import { connect } from 'react-redux';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { Dropdown } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import { Button } from 'reactstrap';

const ProjectTableHeader = props => {
  const { role, darkMode } = props;
  const { canDeleteProject = false } = props;

  const categoryList = ['Unspecified', 'Food', 'Energy', 'Housing', 'Education', 'Society', 'Economics', 'Stewardship', 'Other'];
  const statusList = ['Active', 'Inactive'];

  const getSortIcon = column => {
    if (props.sorted.column !== column || props.sorted.direction === "DEFAULT") return faSortDown;
    if (props.sorted.direction === "ASC") return faArrowDown;
    if (props.sorted.direction === "DESC") return faArrowUp;
    return faSortDown;
  };

  const getAriaSort = column => {
    if (props.sorted.column !== column || props.sorted.direction === 'DEFAULT') return undefined;
    return props.sorted.direction === 'DESC' ? 'descending' : 'ascending';
  };
  const inventoryEdited = props.sorted.column === 'INVENTORY' && props.sorted.direction === 'DESC';

  // Sort and filter controls share one style so size (30x30px) and color match.
  const controlStyle = {
    ...(darkMode ? boxStyleDark : boxStyle),
    width: '30px',
    height: '30px',
    border: 'none',
  };
  const controlClass =
    'btn btn-secondary btn-sm px-0 py-0 d-flex align-items-center justify-content-center';

  const renderSortButton = column => (
    <Button
      size="sm"
      color="secondary"
      className={`${controlClass} ml-3`}
      style={controlStyle}
      id={`${column.toLowerCase()}_sort`}
      onClick={() => props.handleSort(column)}
    >
      <FontAwesomeIcon icon={getSortIcon(column)} pointerEvents="none" aria-hidden="true" />
    </Button>
  );

  const renderDropdownFilterButton = (id, selectedValue, onChange, list, placeholder) => {
    const itemClass = darkMode ? 'bg-darkmode-liblack text-light border-0' : '';
    return (
      <Dropdown className={`${styles.projectFilterDropdown} ml-3 d-inline-block`} onSelect={onChange}>
        <Dropdown.Toggle as="button" type="button" id={id} className={controlClass} style={controlStyle}>
          <FontAwesomeIcon icon={faSortDown} pointerEvents="none" aria-hidden="true" />
        </Dropdown.Toggle>
        <Dropdown.Menu align="right">
          <Dropdown.Item eventKey="" disabled={!selectedValue} className={itemClass}>
            {selectedValue ? 'Clear filter' : placeholder}
          </Dropdown.Item>
          <Dropdown.Divider />
          {list.map(item => (
            <Dropdown.Item key={item} eventKey={item} active={selectedValue === item} className={itemClass}>
              {item}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="projects__order" style={{ textAlign: 'center' }}>
        #
      </th>

      {/* 1. Project Name column header */}
      <th scope="col" aria-sort={getAriaSort('PROJECTS')} className='align-middle text-break'>
        <span className="d-flex justify-content-between align-items-center">
          <span>{PROJECT_NAME}</span>
          <div>{renderSortButton('PROJECTS')}</div>
        </span>
      </th>

      {/* 2. Category column header */}
      <th scope="col" id="projects__category" className='align-middle'>
        <span className="d-flex justify-content-between align-items-center">
          <span>{PROJECT_CATEGORY}</span>
          {renderDropdownFilterButton('project-category-filter', props.selectedValue, props.onChange, categoryList, 'Choose category')}
        </span>
      </th>

      {/* 3. Active status column header */}
      <th scope="col" id="projects__active" className='align-middle'>
        <span className="d-flex justify-content-between align-items-center">
          <span>{ACTIVE}</span>
          {renderDropdownFilterButton('project-status-filter', props.showStatus, props.selectStatus, statusList, 'Choose Status')}
        </span>
      </th>

      {/* 4. Inventory column header */}
      <th scope="col" id="projects__inv" aria-label={INVENTORY} aria-sort={inventoryEdited ? 'descending' : undefined} className='align-middle'>
        <span className='d-flex justify-content-between align-items-center'>
          <span>{INVENTORY}</span>
          <Dropdown
            className={`${styles.projectFilterDropdown} ml-3 d-inline-block`}
            onSelect={props.onInventorySortChange}
            focusFirstItemOnShow="keyboard"
          >
            <Dropdown.Toggle
              as="button"
              type="button"
              id="project-inventory-sort"
              aria-label="Inventory sort options"
              className={`${controlClass}${inventoryEdited ? ' active' : ''}`}
              style={controlStyle}
            >
              <FontAwesomeIcon icon={faSortDown} pointerEvents="none" aria-hidden="true" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="right">
              <Dropdown.Item eventKey="EDITED" active={inventoryEdited} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>
                Edited
              </Dropdown.Item>
              <Dropdown.Item eventKey="DEFAULT" active={props.sorted.direction === 'DEFAULT'} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>
                Default order
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </span>
      </th>

      {/* 5. Members column header */}
      <th scope="col" id="projects__members" aria-sort={getAriaSort('MEMBERS')} className='align-middle'>
        <span className='d-flex justify-content-between align-items-center'>
          <span>{MEMBERS}</span>
          <div>
            {renderSortButton('MEMBERS')}
          </div>
        </span>
      </th>

      {/* 6. WBS column header */}
      <th scope="col" id="projects__wbs" className='align-middle'>
        <div className="d-flex align-items-center justify-content-between">
          <span>{WBS}</span>
          <EditableInfoModal
            areaName="ProjectTableHeaderWBS"
            areaTitle="WBS"
            fontSize={24}
            isPermissionPage={true}
            role={role}
            className="p-1 mb-1"
            darkMode={darkMode}
          />
        </div>
      </th>

      {/* 7. Archive column header */}
      {canDeleteProject ? (
        <th scope="col" id="projects__delete" className='align-middle'>
          {ARCHIVE}
        </th>
      ) : null}
    </tr>
  );
};

ProjectTableHeader.propTypes = {
  canDeleteProject: PropTypes.bool,
  role: PropTypes.string,
  darkMode: PropTypes.bool,
  selectedValue: PropTypes.string,
  showStatus: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  selectStatus: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  onInventorySortChange: PropTypes.func.isRequired,
  sorted: PropTypes.shape({
    column: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  role: state.userProfile.role,
});

export default connect(mapStateToProps)(ProjectTableHeader);
