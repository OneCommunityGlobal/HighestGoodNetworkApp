import React from 'react';
import './../projects.css';
import {
  PROJECT_NAME,
  ACTIVE,
  MEMBERS,
  WBS,
  PROJECT_CATEGORY,
  INVENTORY,
  ARCHIVE,
} from './../../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faArrowUp, faArrowDown, faSortDown} from '@fortawesome/free-solid-svg-icons';
import { Dropdown,DropdownButton, Divider } from 'react-bootstrap';

// import DropdownButton from 'react-bootstrap/DropdownButton';
import { boxStyle } from 'styles';
import { Button } from 'reactstrap';


const ProjectTableHeader = props => {
  const { role, darkMode } = props;
  const canDeleteProject = props.hasPermission('deleteProject');

  const categoryList = ['Unspecified', 'Food', 'Energy', 'Housing', 'Education', 'Society', 'Economics', 'Stewardship', 'Other'];
  const statusList = ['Active', 'Inactive'];

  return (
    <tr className={darkMode ? 'bg-space-cadet text-light' : ''}>
      <th scope="col" id="projects__order" className='align-middle'>
        #
      </th>
      {/* <th scope="col">{PROJECT_NAME}</th> */}
      <th scope="col" className='align-middle'>        
        <span className='d-flex justify-content-between align-middle mt-1'>
          {PROJECT_NAME}
          <div>
            <Button size='sm' className='ml-3 mb-1' id='Ascending' onClick={props.handleSort}><FontAwesomeIcon icon={faArrowDown} pointerEvents="none"/></Button>
            <Button size='sm' className='ml-3 mb-1' id='Descending' onClick={props.handleSort}><FontAwesomeIcon icon={faArrowUp} pointerEvents="none"/></Button>
          </div>
        </span>
      </th>
      <th scope="col" id="projects__category" className='align-middle'>
         {/* This span holds the header-name and a dropDown component */}
       <span className='d-flex justify-content-between align-middle mt-1'>
        {PROJECT_CATEGORY}
        <DropdownButton id="" title="" size='sm'style={darkMode ? {} : boxStyle} variant='info' value={props.selectedValue} onSelect={props.onChange} menuAlign="right">
          <Dropdown.Item default eventKey="" disabled={!props.selectedValue}>{props.selectedValue ? 'Clear filter' : 'Choose category'}</Dropdown.Item>
          <Dropdown.Divider />
          {categoryList.map((category, index) => 
            <Dropdown.Item key={index} eventKey={category} active={props.selectedValue === category}>{category}</Dropdown.Item>
          )}
        </DropdownButton>
       </span> 
      </th>
      <th scope="col" id="projects__active" className='align-middle'>
      <span className='d-flex justify-content-between align-middle mt-1'>
        {ACTIVE}
        <DropdownButton className='ml-2 align-middle' id="" title="" size='sm'style={darkMode ? {} : boxStyle} variant='info' value={props.showStatus} onSelect={props.selectStatus}  menuAlign="right" >
        <Dropdown.Item default value="" disabled={!props.showStatus}>{props.showStatus ? 'Clear filter' : 'Choose Status'}</Dropdown.Item>
          {statusList.map((status, index) => 
            <Dropdown.Item key={index} eventKey={status} active={props.showStatus === status}>{status}</Dropdown.Item>
          )}
        </DropdownButton>
       </span> 
      </th>
      <th scope="col" id="projects__inv" className='align-middle'>
        <span className='d-flex justify-content-between'>
          {INVENTORY}
        </span> 
      </th>
      <th scope="col" id="projects__members" className='align-middle'>
        <span className='d-flex'>
          {MEMBERS}
          <Button size='sm' className='ml-2' id='SortingByRecentEditedMembers' onClick={props.handleSort}>
          <FontAwesomeIcon 
            icon={props.sorted === 'SortingByRecentEditedMembers' ? faSort : faSortDown} 
            pointerEvents="none"
          />
          </Button>
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

const mapStateToProps = state => ({
  role: state.userProfile.role, // Map 'role' from Redux state to 'role' prop
});

export default connect(mapStateToProps, { hasPermission })(ProjectTableHeader);

