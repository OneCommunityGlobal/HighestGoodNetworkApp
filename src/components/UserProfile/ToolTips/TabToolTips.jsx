import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';

const TabToolTips = () => {
  const [basicOpen, setBasicOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [teamsOpen, setTeamsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const toggleBasic = () => setBasicOpen(!basicOpen);
  const toggleTime = () => setTimeOpen(!timeOpen);
  const toggleTeams = () => setTeamsOpen(!teamsOpen);
  const toggleProjects = () => setProjectsOpen(!projectsOpen);
  return (
    <div>
      <Tooltip placement="top" isOpen={basicOpen} target="nabLink-basic" toggle={toggleBasic}>
        This is where your contact information and bio go
      </Tooltip>
      <Tooltip placement="top" isOpen={timeOpen} target="nabLink-time" toggle={toggleTime}>
        This shares your start and end dates, committed hours, total hours volunteered, etc.
      </Tooltip>
      <Tooltip placement="top" isOpen={teamsOpen} target="nabLink-teams" toggle={toggleTeams}>
        This shows any teams you are a member of. You will see all other members of your team in the
        Leaderboard on the Time Log page and have access to their Profiles and Time Logs from there.
      </Tooltip>
      <Tooltip
        placement="top"
        isOpen={projectsOpen}
        target="nabLink-projects"
        toggle={toggleProjects}
      >
        This shows all the projects and tasks you are assigned to.
      </Tooltip>
    </div>
  );
};

export default TabToolTips;
