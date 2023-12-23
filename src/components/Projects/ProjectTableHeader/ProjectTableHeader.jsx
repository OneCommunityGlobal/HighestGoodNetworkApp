import React from 'react';
import './../projects.css';
import {
  PROJECT_NAME,
  ACTIVE,
  MEMBERS,
  WBS,
  PROJECT_CATEGORY,
  INVENTORY,
  DELETE,
} from './../../../languages/en/ui';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { boxStyle } from 'styles';

const ProjectTableHeader = props => {
  const { role } = props; // Access the 'role' prop
  const canDeleteProject = props.hasPermission('deleteProject') || props.hasPermission('seeProjectManagement');
  
  return (
    <tr>
      <th scope="col" id="projects__order">
        #
      </th>
      <th scope="col">{PROJECT_NAME}</th>
      <th scope="col" id="projects__category">
        {/* This span holds the header-name and a dropDown component */}
       <span className='d-flex justify-content-between'>{PROJECT_CATEGORY}
        <DropdownButton id="" title="" size='sm'style={boxStyle} variant='info' value={props.selectedValue} onSelect={props.onChange} >
            <Dropdown.Item default value="Unspecified">Unspecified</Dropdown.Item>
            <Dropdown.Item eventKey="Food">Food</Dropdown.Item>
            <Dropdown.Item eventKey="Energy">Energy</Dropdown.Item>
            <Dropdown.Item eventKey="Housing">Housing</Dropdown.Item>
            <Dropdown.Item eventKey="Education">Education</Dropdown.Item>
            <Dropdown.Item eventKey="Society">Society</Dropdown.Item>
            <Dropdown.Item eventKey="Economics">Economics</Dropdown.Item>
            <Dropdown.Item eventKey="Stewardship">Stewardship</Dropdown.Item>
            <Dropdown.Item eventKey="Other">Other</Dropdown.Item>
      
        </DropdownButton>
       </span> 
        
      </th>
      <th scope="col" id="projects__active">
        
        <span className='d-flex justify-content-between'>{ACTIVE}
        <DropdownButton className='ml-2' id="" title="" size='sm'style={boxStyle} variant='info' value={props.showStatus} onSelect={props.selectStatus} >
        <Dropdown.Item default value="Unspecified">Choose Status</Dropdown.Item>
            <Dropdown.Item eventKey="Active">Active</Dropdown.Item>
            <Dropdown.Item eventKey="Inactive">Inactive</Dropdown.Item>
        </DropdownButton>
       </span> 
      </th>
      <th scope="col" id="projects__inv">
        {INVENTORY}
      </th>
      <th scope="col" id="projects__members">
        {MEMBERS}
      </th>
      <th scope="col" id="projects__wbs">
        <div className="d-flex align-items-center">
          <span className="mr-2">{WBS}</span>
          <EditableInfoModal
            areaName="ProjectTableHeaderWBS"
            areaTitle="WBS"
            fontSize={24}
            isPermissionPage={true}
            role={role}
            className="p-2" // Add Bootstrap padding class to the EditableInfoModal
          />
        </div>
      </th>
      {canDeleteProject ? (
        <th scope="col" id="projects__delete">
          {DELETE}
        </th>
      ) : null}
    </tr>
  );
};

const mapStateToProps = state => ({
  role: state.userProfile.role, // Map 'role' from Redux state to 'role' prop
});

export default connect(mapStateToProps, { hasPermission })(ProjectTableHeader);

