/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CopyToClipboard from '~/components/common/Clipboard/CopyToClipboard';
import { Stub } from '../../common/Stub';
import styles from './ProjectMemberTable.module.css';

export function ProjectMemberTable({ projectMembers, skip, take, handleMemberCount, darkMode, counts }) {
  console.log('skip:', skip, 'take:', take);
  const [allMemberList, setAllMemberList] = useState([]);
  const [activeMemberList, setActiveMemberList] = useState([]);
  const [memberFilter, setMemberFilter] = useState('active');
  const { fetched, foundUsers, members } = projectMembers;

  useEffect(() => {
    setMemberFilter('active');
  }, [fetched]);

  useEffect(() => {
    handleMemberCount(activeMemberList.length);
  }, [activeMemberList, memberFilter]);

  useEffect(() => {
  // Reset lists when project changes or data is not yet fetched
  if (!fetched) {
    setAllMemberList([]);
    setActiveMemberList([]);
    return;
  }

  const memberList = [];
  const activeList = [];
  const currentActive = new Set();

  if (foundUsers.length > 0) {
    foundUsers.forEach(member => {
      currentActive.add(member._id);
    });
  }

  members.forEach(member => {
    if (currentActive.has(member._id)) {
      memberList.push({ ...member, active: true });
      activeList.push({ ...member, active: true });
    } else {
      memberList.push({ ...member, active: false });
    }
  });

  setAllMemberList(memberList);
  setActiveMemberList(activeList);
}, [fetched, members, foundUsers]);

  const activeMemberTable = activeMemberList.slice(skip, skip + take).map((member, index) => (
    <div className={styles['project-member-table-row']} id={`tr_${  member._id}`} key={`ac_${  member._id}`}>
      <div>
        <div>{skip + index + 1}</div>
      </div>
      <Link to={`/userprofile/${member._id}`} title="View Profile"  className={`${styles['project-member-table-name-column']} ${darkMode ? "text-light" : ""}`}>
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
      <div className={styles['project-member-table-id-column']}>
        <CopyToClipboard writeText={member._id} message={`Copied "${member._id}".`} />
        {member._id}
      </div> 
    </div>
  ));

  const allMemberTable = allMemberList.slice(skip, skip + take).map((member, index) => (
    <div className={styles['project-member-table-row']} id={`tr_${  member._id}`} key={`al_${  member._id}`}>
      <div>
        <div>{skip + index + 1}</div>
      </div>
      <Link to={`/userprofile/${member._id}`} title="View Profile" className={`${styles['project-member-table-name-column']} ${darkMode ? 'text-light' : ''}`}>
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
      <div className={styles['project-member-table-id-column']}>
        <CopyToClipboard writeText={member._id} message={`Copied "${member._id}".`} />
        {member._id}
      </div>     
    </div>
  ));

  return (
    <div className={`${styles['project-member-table']} ${darkMode ? 'text-light' : ''}`}>
      <h5 className={styles['project-member-table-title']}>Members</h5>
      <div className={styles['project-member-count-head']}>
        <div className={styles['filter-members-mobile']}
          onChange={e => {
            const val = e.target.value;
            setMemberFilter(val);
            handleMemberCount(val === 'all-time' ? allMemberList.length : activeMemberList.length);
          }
        }>
          <input type="radio" name="memberFilter" value="active" id="active" defaultChecked />
          <label htmlFor="active" id="project-active-member-count" className={`${styles['project-member-count']} ${darkMode ? 'text-light' : ''}`}>
            ACTIVE: {counts.activeMemberCount}
          </label>
          <input type="radio" name="memberFilter" value="all-time" id="all-time" />
          <label htmlFor="all-time" id="project-all-member-count" className={`${styles['project-member-count']} ${darkMode ? 'text-light' : ''}`}>
            ALL-TIME: {counts.memberCount}
          </label>
        </div>
      </div>
      <div className={`${styles['reports-table-head-members']} ${darkMode ? 'bg-space-cadet' : ''}`}>
        <div className={styles['reports-table-head-cell']}>#</div>
        <div className={styles['reports-table-head-cell']}>Name</div>
        <div className={`${styles['reports-table-head-cell']} ${styles['project-member-table-active-column']}`}>Active</div>
        <div className={styles['reports-table-head-cell']}>ID</div>
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