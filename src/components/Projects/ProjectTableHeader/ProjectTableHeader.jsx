import React from 'react';
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

const ProjectTableHeader = props => {
  const canDeleteProject = props.hasPermission('deleteProject');
  const { role } = props; // Access the 'role' prop

  return (
    <tr>
      <th scope="col" id="projects__order">
        #
      </th>
      <th scope="col">{PROJECT_NAME}</th>
      <th scope="col" id="projects__category">
        {PROJECT_CATEGORY}
      </th>
      <th scope="col" id="projects__active">
        {ACTIVE}
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

