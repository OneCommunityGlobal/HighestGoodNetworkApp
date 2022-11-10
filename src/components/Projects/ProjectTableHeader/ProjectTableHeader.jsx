/*********************************************************************************
 * Component: Project Table Header
 * Author: Henry Ng - 01/17/20
 * This component is the top of the table. It displays titles.
 ********************************************************************************/
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

const ProjectTableHeader = props => {
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
        {WBS}
      </th>
      {hasPermission(props.role, 'deleteProject', props.roles, props.userPermissions) ? (
        <th scope="col" id="projects__delete">
          {DELETE}
        </th>
      ) : null}
    </tr>
  );
};

export default ProjectTableHeader;
