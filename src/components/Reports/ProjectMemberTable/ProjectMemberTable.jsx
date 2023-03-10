import { Stub } from 'components/common/Stub';
import React from 'react';
import './ProjectMemberTable.css';

export const ProjectMemberTable = ({ projectMembers, skip, take }) => {
  //console.log("====projectMembers====",projectMembers);
  let activeMemberList = [];
  if (projectMembers.fetched) {
    if (projectMembers.foundUsers.length > 0) {
      activeMemberList = projectMembers.foundUsers.slice(skip, skip + take).map((member, index) => (
        <div className="project-member-table-row" id={'tr_' + member._id} key={member._id}>
          <div>
            <div>{skip + index + 1}</div>
          </div>
          <div>
            {member.firstName} {member.lastName}
          </div>
          <div>{member._id}</div>
        </div>
      ));
    }
  }
  return (
    <div className="project-member-table">
      <h5 className="project-member-table-title">Members</h5>
      <div className="project-member-count-head">
        <div id="project-member-count">
          <i className="fa fa-circle" aria-hidden="true"></i> ACTIVE:
          {projectMembers.foundUsers.length}
        </div>
        <div id="project-member-count">
          <i className="fa fa-circle-o" aria-hidden="true"></i> ALL-TIME:
          {projectMembers.members.length}
        </div>
      </div>
      <div className="project-member-table-row reports-table-head">
        <div id="projects__order">#</div>
        <div>Name</div>
        <div>ID</div>
      </div>
      <div>{activeMemberList.length > 0 ? activeMemberList : <Stub />}</div>
    </div>
  );
};
