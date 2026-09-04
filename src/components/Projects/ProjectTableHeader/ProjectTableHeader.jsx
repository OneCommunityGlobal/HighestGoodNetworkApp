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
import hasPermission from '~/utils/permissions';
import { connect } from 'react-redux';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { Dropdown } from 'react-bootstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import { Button } from 'reactstrap';

const ProjectTableHeader = props => {
  const { role, darkMode } = props;
  const canDeleteProject = hasPermission('deleteProject');

  const categoryList = ['Unspecified', 'Food', 'Energy', 'Housing', 'Education', 'Society', 'Economics', 'Stewardship', 'Other'];
  const statusList = ['Active', 'Inactive'];
  // 如果 Inventory 也有自己的列表数据，可以在这里定义（例如 inventoryList = [...]）
  const inventoryList = ['All', 'In Stock', 'Out of Stock']; // 可根据实际需求调整

  const getSortIcon = column => {
    if (props.sorted.column !== column || props.sorted.direction === "DEFAULT") return faSortDown;
    if (props.sorted.direction === "ASC") return faArrowDown;
    if (props.sorted.direction === "DESC") return faArrowUp;
    return faSortDown;
  };

  // Standardized sort button rendering function with fixed 30x30px dimensions and center alignment
  const renderSortButton = column => (
    <Button
      size="sm"
      className="btn-sm ml-3 d-flex align-items-center justify-content-center"
      style={{ width: '30px', height: '30px', boxShadow: 'none' }}
      id={`${column.toLowerCase()}_sort`}
      onClick={() => props.handleSort(column)}
    >
      <FontAwesomeIcon icon={getSortIcon(column)} pointerEvents="none" />
    </Button>
  );

  // Standardized dropdown filter button helper to ensure uniform size (30x30px), exact icon matching, and clean layout
  const renderDropdownFilterButton = (selectedValue, onChange, list, placeholder, isDark) => (
    <Dropdown className="ml-3 d-inline-block">
      {/* Used native button toggle via Dropdown.Toggle to bypass component ref conflicts and eliminate unwanted default caret/shadow artifacts */}
      <Dropdown.Toggle 
        as="button"
        className="btn btn-secondary btn-sm px-0 py-0 d-flex align-items-center justify-content-center"
        style={{ ...(isDark ? boxStyleDark : boxStyle), width: '30px', height: '30px', border: 'none', boxShadow: 'none' }}
      >
        <FontAwesomeIcon icon={faSortDown} pointerEvents="none" />
      </Dropdown.Toggle>

      <Dropdown.Menu align="right">
        <Dropdown.Item default eventKey="" disabled={!selectedValue} className={isDark ? 'bg-darkmode-liblack text-light border-0' : ''}>
          {selectedValue ? 'Clear filter' : placeholder}
        </Dropdown.Item>
        <Dropdown.Divider />
        {list.map((item, index) => 
          <Dropdown.Item key={index} eventKey={item} active={selectedValue === item} className={isDark ? 'bg-darkmode-liblack text-light border-0' : ''}>
            {item}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="projects__order" style={{ textAlign: 'center' }}>
        #
      </th>
      
      {/* 1. Project Name column header */}
      <th scope="col" className='align-middle'>        
        <span className="d-flex justify-content-between align-items-center">
          <span>{PROJECT_NAME}</span>
          <div>{renderSortButton('PROJECTS')}</div>
        </span>
      </th>

      {/* 2. Category column header */}
      <th scope="col" id="projects__category" className='align-middle'>
        <span className="d-flex justify-content-between align-items-center">
          <span>{PROJECT_CATEGORY}</span>
          {/* Utilized the standardized render function for consistent category filtering button layout */}
          {renderDropdownFilterButton(props.selectedValue, props.onChange, categoryList, 'Choose category', darkMode)}
        </span> 
      </th>

      {/* 3. Active status column header */}
      <th scope="col" id="projects__active" className='align-middle'>
        <span className="d-flex justify-content-between align-items-center">
          <span>{ACTIVE}</span>
          {/* Utilized the standardized render function for consistent active status filtering button layout */}
          {renderDropdownFilterButton(props.showStatus, props.selectStatus, statusList, 'Choose Status', darkMode)}
        </span> 
      </th>

      {/* 4. Inventory column header */}
      <th scope="col" id="projects__inv" className='align-middle'>
        <span className='d-flex justify-content-between align-items-center'>
          <span>{INVENTORY}</span>
          {/* Converted Inventory to use the standardized dropdown filter button layout for visual consistency */}
          {renderDropdownFilterButton(props.inventoryValue, props.onInventoryChange, inventoryList, 'Choose Inventory', darkMode)}
        </span> 
      </th>

      {/* 5. Members column header */}
      <th scope="col" id="projects__members" className='align-middle'>
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
  role: PropTypes.string,
  darkMode: PropTypes.bool,
  selectedValue: PropTypes.string,
  showStatus: PropTypes.string,
  inventoryValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  selectStatus: PropTypes.func.isRequired,
  onInventoryChange: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  sorted: PropTypes.shape({
    column: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  role: state.userProfile.role,
});

export default connect(mapStateToProps)(ProjectTableHeader);