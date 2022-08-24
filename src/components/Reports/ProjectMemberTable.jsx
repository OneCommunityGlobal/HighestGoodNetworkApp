import React from 'react';
import './reports.css';

const ProjectMemberTable = ({ projectMembers, skip, take }) => {
  let memberList = [];
  if (projectMembers.fetched) {
    if (projectMembers.members.length > 0) {
      memberList = projectMembers.members.slice(skip, skip + take).map((member, index) => (
        <tr id={'tr_' + member._id} key={member._id}>
          <th scope="row">
            <div>{index + 1}</div>
          </th>
          <td>
            {member.firstName} {member.lastName}
          </td>
          <td>{member._id}</td>
        </tr>
      ));
    }
  }
  return (
    <table className="center">
      <table className="table table-bordered table-responsive-sm">
        <thead>
          <tr>
            <th scope="col" id="projects__order">
              #
            </th>
            <th scope="col">Member_NAME</th>
            <th scope="col">Member_ID</th>
          </tr>
        </thead>
        <tbody>{memberList}</tbody>
      </table>
    </table>
  );
};

export default ProjectMemberTable;
