import { Stub } from 'components/common/Stub';
import React, { useEffect, useState } from 'react';
import './ProjectMemberTable.css';
import { Link } from 'react-router-dom';

export const ProjectMemberTable = ({ projectMembers, skip, take }) => {
  const [allMemberList, setAllMemberList] = useState([]);
  const [activeMemberList, setActiveMemberList] = useState([]);
  const [memberFilter, setMemberFilter] = useState('active');

  let activeMemberTable = [];
  let allMemberTable = [];

  useEffect(() => {
    let memberList = [];
    let activeList = [];
    let currentActive = [];
    if (projectMembers.fetched) {
      if (projectMembers.foundUsers.length > 0) {
        projectMembers.foundUsers.map(member => {
          currentActive.push(member._id);
        });
      }
      projectMembers.members.map(member => {
        if (currentActive.includes(member._id)) {
          memberList.push({ ...member, active: true });
          activeList.push({ ...member, active: true });
        } else {
          memberList.push({ ...member, active: false });
        }
      });
      setAllMemberList(memberList);
      setActiveMemberList(activeList);
    }
  }, [projectMembers.fetched]);

  if (activeMemberList.length > 0) {
    activeMemberTable = activeMemberList.slice(skip, skip + take).map((member, index) => (
      <div className="project-member-table-row" id={'tr_' + member._id} key={'ac_' + member._id}>
        <div>
          <div>{skip + index + 1}</div>
        </div>
        <Link to={`/userprofile/${member._id}`} title="View Profile">
          <div>
            {member.firstName} {member.lastName}
          </div>
        </Link>
        <div className="projects__active--input">
          {member.active ? (
            <tasks className="isActive">
              <i className="fa fa-circle" aria-hidden="true"></i>
            </tasks>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true"></i>
            </div>
          )}
        </div>
        <div>{member._id}</div>
      </div>
    ));
  }

  if (allMemberList.length > 0) {
    allMemberTable = allMemberList.slice(skip, skip + take).map((member, index) => (
      <div className="project-member-table-row" id={'tr_' + member._id} key={'al_' + member._id}>
        <div>
          <div>{skip + index + 1}</div>
        </div>
        <Link to={`/userprofile/${member._id}`} title="View Profile">
          <div>
            {member.firstName} {member.lastName}
          </div>
        </Link>
        <div className="projects__active--input">
          {member.active ? (
            <tasks className="isActive">
              <i className="fa fa-circle" aria-hidden="true"></i>
            </tasks>
          ) : (
            <div className="isNotActive">
              <i className="fa fa-circle-o" aria-hidden="true"></i>
            </div>
          )}
        </div>

        <div>{member._id}</div>
      </div>
    ));
  }

  let memberList = [];

  return (
    <div className="project-member-table">
      <h5 className="project-member-table-title">Members</h5>
      <div className="project-member-count-head">
        <div
          onChange={e => {
            setMemberFilter(e.target.value);
          }}
        >
          <input type="radio" name="memberFilter" value="active" id="active" defaultChecked />
          <label htmlFor="active" id="project-active-member-count" className="project-member-count">
            ACTIVE: {projectMembers.foundUsers.length}
          </label>
          <input type="radio" name="memberFilter" value="all-time" id="all-time" />
          <label htmlFor="all-time" id="project-all-member-count" className="project-member-count">
            ALL-TIME: {projectMembers.members.length}
          </label>
        </div>
      </div>
      <div className="project-member-table-row reports-table-head">
        <div id="projects__order">#</div>
        <div>Name</div>
        <div>Active</div>
        <div>ID</div>
      </div>
      <div>
        {memberFilter == 'all-time' ? (
          allMemberTable.length > 0 ? (
            allMemberTable
          ) : (
            <Stub />
          )
        ) : activeMemberTable.length > 0 ? (
          activeMemberTable
        ) : (
          <Stub />
        )}
      </div>
    </div>
  );
};

