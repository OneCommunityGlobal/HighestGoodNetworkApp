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
import { Dropdown,DropdownButton } from 'react-bootstrap';

// import DropdownButton from 'react-bootstrap/DropdownButton';
import { boxStyle } from '~/styles';
import { Button } from 'reactstrap';


const ProjectTableHeader = props => {
  const { role, darkMode } = props;
  const canDeleteProject = hasPermission('deleteProject')

  const categoryList = ['Unspecified', 'Food', 'Energy', 'Housing', 'Education', 'Society', 'Economics', 'Stewardship', 'Other'];
  const statusList = ['Active', 'Inactive'];

  const getSortIcon = column => {
    if (props.sorted.column !== column || props.sorted.direction === "DEFAULT") return faSortDown;
    if (props.sorted.direction === "ASC") return faArrowDown;
    if (props.sorted.direction === "DESC") return faArrowUp;
    return faSortDown;
  };

  const renderSortButton = column => (
    <Button
      size="sm"
      className="ml-3 mb-1"
      id={`${column.toLowerCase()}_sort`}
      onClick={() => props.handleSort(column)}
    >
      <FontAwesomeIcon icon={getSortIcon(column)} pointerEvents="none" />
    </Button>
  );

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="projects__order" style={{ textAlign: 'center' }}>
        #
      </th>
      {/* <th scope="col">{PROJECT_NAME}</th> */}
      <th scope="col" className='align-middle'>        
        <span className='d-flex justify-content-between align-middle mt-1'>
          {PROJECT_NAME}
          <div>
            {renderSortButton('PROJECTS')}
          </div>
        </span>
      </th>
      <th scope="col" id="projects__category" className='align-middle'>
         {/* This span holds the header-name and a dropDown component */}
       <span className='d-flex justify-content-between align-middle mt-1'>
        {PROJECT_CATEGORY}
        <DropdownButton id="" title="" size='sm'style={darkMode ? {} : boxStyle} variant='info' value={props.selectedValue} onSelect={props.onChange} menuAlign="right">
          <Dropdown.Item default eventKey="" disabled={!props.selectedValue} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{props.selectedValue ? 'Clear filter' : 'Choose category'}</Dropdown.Item>
          <Dropdown.Divider />
          {categoryList.map((category, index) => 
            <Dropdown.Item key={index} eventKey={category} active={props.selectedValue === category} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{category}</Dropdown.Item>
          )}
        </DropdownButton>
       </span> 
      </th>
      <th scope="col" id="projects__active" className='align-middle'>
      <span className='d-flex justify-content-between align-middle mt-1'>
        {ACTIVE}
        <DropdownButton className='ml-2 align-middle' id="" title="" size='sm'style={darkMode ? {} : boxStyle} variant='info' value={props.showStatus} onSelect={props.selectStatus}  menuAlign="right" >
        <Dropdown.Item default value="" disabled={!props.showStatus} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{props.showStatus ? 'Clear filter' : 'Choose Status'}</Dropdown.Item>
          {statusList.map((status, index) => 
            <Dropdown.Item key={index} eventKey={status} active={props.showStatus === status} className={darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}>{status}</Dropdown.Item>
          )}
        </DropdownButton>
       </span> 
      </th>
      <th scope="col" id="projects__inv" className='align-middle'>
        <span className='d-flex justify-content-between'>
          {INVENTORY}
          <div>
            {renderSortButton('INVENTORY')}
          </div>
        </span> 
      </th>
      <th scope="col" id="projects__members" className='align-middle'>
        <span className='d-flex'>
          {MEMBERS}
          {renderSortButton('MEMBERS')}
        </span>
      </th>
      <th scope="col" id="projects__wbs" className='align-middle'>
        <div className="d-flex align-items-center">
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
  onChange: PropTypes.func.isRequired,
  selectStatus: PropTypes.func.isRequired,
  handleSort: PropTypes.func.isRequired,
  sorted: PropTypes.shape({
    column: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  role: state.userProfile.role, // Map 'role' from Redux state to 'role' prop
});

export default connect(mapStateToProps)(ProjectTableHeader)

