/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import './ProjectMemberTable.css';
import { Link } from 'react-router-dom';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Stub } from '../../common/Stub';

export function ProjectMemberTable({ projectMembers, skip, take, handleMemberCount, darkMode, counts }) {
  const [allMemberList, setAllMemberList] = useState([]);
  const [activeMemberList, setActiveMemberList] = useState([]);
  const [memberFilter, setMemberFilter] = useState('active');
  const { fetched, foundUsers, members, allTimeMembers } = projectMembers;

  useEffect(() => {
    handleMemberCount(activeMemberList.length);
  }, [activeMemberList])

  useEffect(() => {
    if (fetched) {
      const memberList = [];
      const activeList = [];
      const currentActive = new Set();
      if (foundUsers.length > 0) {
        foundUsers.forEach(member => {
          currentActive.add(member._id);
        });
      }
      try {
        members.forEach(member => {
          if (currentActive.has(member._id)) {
            //memberList.push({ ...member, active: true });
            activeList.push({ ...member, active: true });
          } else {
            //memberList.push({ ...member, active: false });
          }
        });
        allTimeMembers.forEach(member => {
          if (currentActive.has(member._id)) {
            memberList.push({ ...member, active: member.isActive });
            //activeList.push({ ...member, active: true });
          } else {
            memberList.push({ ...member, active: member.isActive });
          }
        });
      }
      catch (error) {
        members.forEach(member => {
          if (currentActive.has(member._id)) {
            memberList.push({ ...member, active: true });
            activeList.push({ ...member, active: true });
          } else {
            memberList.push({ ...member, active: false });
          }
        });
      }

      setAllMemberList(memberList);
      setActiveMemberList(activeList);
    }
  }, [fetched]);

  const activeMemberTable = activeMemberList.slice(skip, skip + take).map((member, index) => (
    <div className="project-member-table-row" id={`tr_${  member._id}`} key={`ac_${  member._id}`}>
      <div>
        <div>{skip + index + 1}</div>
      </div>
      <Link to={`/userprofile/${member._id}`} title="View Profile"  className={`project-member-table-name-column ${darkMode ? "text-light" : ""}`}>
        <div>
        {window.innerWidth >= 1100 ? `${member.firstName} ${member.lastName}` : `${member.firstName.substring(0, 10)} ${member.lastName.substring(0, 1)}`}          
        </div>
      </Link>
      <div className="projects__active--input">
        {member.active ? (
          <div className="isActive">
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className='project-member-table-id-column'>
        <CopyToClipboard writeText={member._id} message={`Copied "${member._id}".`} />
        {member._id}
      </div> 
    </div>
  ));

  const allMemberTable = allMemberList.slice(skip, skip + take).map((member, index) => (
    <div className="project-member-table-row" id={`tr_${  member._id}`} key={`al_${  member._id}`}>
      <div>
        <div>{skip + index + 1}</div>
      </div>
      <Link to={`/userprofile/${member._id}`} title="View Profile" className={`project-member-table-name-column ${darkMode ? 'text-light' : ''}`}>
        <div>
        {window.innerWidth >= 1100 ? `${member.firstName} ${member.lastName}` : `${member.firstName.substring(0, 10)} ${member.lastName.substring(0, 1)}`} 
        </div>
      </Link>
      <div className="projects__active--input">
        {member.active ? (
          <div className="isActive">
            <i className="fa fa-circle" aria-hidden="true" />
          </div>
        ) : (
          <div className="isNotActive">
            <i className="fa fa-circle-o" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className='project-member-table-id-column'>
        <CopyToClipboard writeText={member._id} message={`Copied "${member._id}".`} />
        {member._id}
      </div>     
    </div>
  ));

  return (
    <div className={`project-member-table ${darkMode ? 'text-light' : ''}`}>
      <h5 className="project-member-table-title">Members</h5>
      <div className="project-member-count-head">
      <div className="filter-members-mobile"
        onChange={e => {
          setMemberFilter(e.target.value);
          if (e.target.value === 'all-time') {
            handleMemberCount(allMemberList.length);
          } else {
            handleMemberCount(activeMemberList.length);
          }
        }}
      >
        <input type="radio" name="memberFilter" value="active" id="active" defaultChecked />
        <label htmlFor="active" id="project-active-member-count" className={`project-member-count ${darkMode ? 'text-light' : ''}`}>
          ACTIVE: {activeMemberList.length}
        </label>
        <input type="radio" name="memberFilter" value="all-time" id="all-time" />
        <label htmlFor="all-time" id="project-all-member-count" className={`project-member-count ${darkMode ? 'text-light' : ''}`}>
          ALL-TIME: {allMemberList.length}
        </label>
      </div>
      </div>
      <div className={`reports-table-head-members ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className="reports-table-head-cell">#</div>
        <div className="reports-table-head-cell">Name</div>
        <div className="reports-table-head-cell project-member-table-active-column">Active</div>
        <div className="reports-table-head-cell">ID</div>
      </div>
      <div>
        {memberFilter === 'all-time' && allMemberTable.length > 0 && allMemberTable}
        {memberFilter === 'all-time' && allMemberTable.length === 0 && <Stub darkMode={darkMode}/>}
        {memberFilter !== 'all-time' && activeMemberTable.length > 0 && activeMemberTable}
        {memberFilter !== 'all-time' && activeMemberTable.length === 0 && <Stub darkMode={darkMode}/>}
      </div>
    </div>
  );
}