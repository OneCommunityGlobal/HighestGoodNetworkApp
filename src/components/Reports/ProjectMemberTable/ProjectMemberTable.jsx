import { Stub } from 'components/common/Stub';
import React from 'react';
import './ProjectMemberTable.css';

export const ProjectMemberTable = ({ projectMembers, skip, take }) => {
  let memberList = [];
  if (projectMembers.fetched) {
    if (projectMembers.members.length > 0) {
      memberList = projectMembers.members.slice(skip, skip + take).map((member, index) => (
        <div className="project-member-table-row" id={'tr_' + member._id} key={member._id}>
          <div>
            <div>{skip + index + 1}</div>
          </div>
          <div>
            {member.firstName} {member.lastName}
          </div>
          <div className="project-member-table-row-id">{member._id}</div>
        </div>
      ));
    }
  }
  return (
    <div className="project-member-table">
      <h5 className="project-member-table-title">Members</h5>
      <div className="project-member-table-row reports-table-head">
        <div id="projects__order">#</div>
        <div>Name</div>
        <div>ID</div>
      </div>
      <div>{memberList.length > 0 ? memberList : <Stub />}</div>
    </div>
  );
};
