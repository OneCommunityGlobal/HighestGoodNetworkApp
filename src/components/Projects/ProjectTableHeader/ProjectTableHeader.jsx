import React from 'react';
import PropTypes from 'prop-types';
import './../projects.module.css';
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
import { faArrowUp, faArrowDown, faSortDown, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Dropdown, DropdownButton } from 'react-bootstrap';

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

  // One muted, theme-aware style for every sort/filter control in the header so
  // they read as a matched set instead of a row of clashing coloured chips.
  // Outline while idle, filled once that column's sort/filter is active.
  const baseColor = darkMode ? 'light' : 'secondary';
  const filterVariant = active => (active ? baseColor : `outline-${baseColor}`);

  const getAriaSort = column => {
    if (props.sorted.column !== column || props.sorted.direction === 'DEFAULT') return undefined;
    return props.sorted.direction === 'DESC' ? 'descending' : 'ascending';
  };
  const inventoryEdited = props.sorted.column === 'INVENTORY' && props.sorted.direction === 'DESC';
  const renderSortButton = column => {
    const active = props.sorted.column === column && props.sorted.direction !== 'DEFAULT';
    return (
      <Button
        size="sm"
        outline={!active}
        color={baseColor}
        className="ml-2"
        id={`${column.toLowerCase()}_sort`}
        onClick={() => props.handleSort(column)}
      >
        <FontAwesomeIcon icon={getSortIcon(column)} pointerEvents="none" aria-hidden="true" />
      </Button>
    );
  };

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="projects__order" style={{ textAlign: 'center' }}>
        #
      </th>
      {/* <th scope="col">{PROJECT_NAME}</th> */}
      <th scope="col" aria-sort={getAriaSort('PROJECTS')} className='align-middle text-break'>
        <span className='d-flex justify-content-between align-items-center mt-1'>
          {PROJECT_NAME}
          <div>
            {renderSortButton('PROJECTS')}
          </div>
        </span>
      </th>
      <th scope="col" id="projects__category" className='align-middle'>
        {/* This span holds the header-name and a filter dropdown */}
        <span className='d-flex justify-content-between align-items-center mt-1'>
          {PROJECT_CATEGORY}
          <DropdownButton
            id="project-category-filter"
            title={<FontAwesomeIcon icon={faChevronDown} pointerEvents="none" />}
            size="sm"
            variant={filterVariant(Boolean(props.selectedValue))}
            className="ml-2"
            value={props.selectedValue}
            onSelect={props.onChange}
            menuAlign="right"
          >
            <Dropdown.Item default eventKey="" disabled={!props.selectedValue} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{props.selectedValue ? 'Clear filter' : 'Choose category'}</Dropdown.Item>
            <Dropdown.Divider />
            {categoryList.map((category, index) => (
              <Dropdown.Item key={index} eventKey={category} active={props.selectedValue === category} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{category}</Dropdown.Item>
            ))}
          </DropdownButton>
        </span>
      </th>
      <th scope="col" id="projects__active" className='align-middle text-center'>
        <span className='d-flex justify-content-center align-items-center mt-1'>
          {ACTIVE}
          <DropdownButton
            id="project-status-filter"
            title={<FontAwesomeIcon icon={faChevronDown} pointerEvents="none" />}
            size="sm"
            variant={filterVariant(Boolean(props.showStatus))}
            className="ml-2 align-middle"
            value={props.showStatus}
            onSelect={props.selectStatus}
            menuAlign="right"
          >
            <Dropdown.Item default eventKey="" disabled={!props.showStatus} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{props.showStatus ? 'Clear filter' : 'Choose Status'}</Dropdown.Item>
            {statusList.map((status, index) => (
              <Dropdown.Item key={index} eventKey={status} active={props.showStatus === status} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{status}</Dropdown.Item>
            ))}
          </DropdownButton>
        </span>
      </th>
      <th scope="col" id="projects__inv" aria-label={INVENTORY} aria-sort={inventoryEdited ? 'descending' : undefined} className='align-middle text-center'>
        <span className='d-flex justify-content-center align-items-center'>
          {INVENTORY}
          <DropdownButton
            id="project-inventory-sort"
            focusFirstItemOnShow="keyboard"
            title={(
              <>
                <span className="sr-only">Inventory sort options</span>
                <FontAwesomeIcon icon={faChevronDown} pointerEvents="none" aria-hidden="true" />
              </>
            )}
            size="sm"
            variant={filterVariant(inventoryEdited)}
            className="ml-2"
            onSelect={props.onInventorySortChange}
            menuAlign="right"
          >
            <Dropdown.Item eventKey="EDITED" active={inventoryEdited} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>
              Edited
            </Dropdown.Item>
            <Dropdown.Item eventKey="DEFAULT" active={props.sorted.direction === 'DEFAULT'} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>
              Default order
            </Dropdown.Item>
          </DropdownButton>
        </span>
      </th>
      <th scope="col" id="projects__members" aria-sort={getAriaSort('MEMBERS')} className='align-middle text-center'>
        <span className='d-flex justify-content-center align-items-center'>
          {MEMBERS}
          {renderSortButton('MEMBERS')}
        </span>
      </th>
      <th scope="col" id="projects__wbs" className='align-middle text-center'>
        <div className="d-flex align-items-center justify-content-center">
          <span className="mr-2">{WBS}</span>
          <EditableInfoModal
            areaName="ProjectTableHeaderWBS"
            areaTitle="WBS"
            fontSize={24}
            isPermissionPage={true}
            role={role}
            className="p-2" // Add Bootstrap padding class to the EditableInfoModal
            darkMode={darkMode}
          />
        </div>
      </th>
      {canDeleteProject ? (
        <th scope="col" id="projects__delete" className='align-middle text-center'>
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
  role: state.userProfile.role, // Map 'role' from Redux state to 'role' prop
});

export default connect(mapStateToProps)(ProjectTableHeader)
