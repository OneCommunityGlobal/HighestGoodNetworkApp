import { useState } from "react"
import { Nav, NavItem, NavLink, TabPane, TabContent } from 'reactstrap'
import classNames from 'classnames'

import TeamsTab from 'components/UserProfile/TeamsAndProjects/TeamsTab'
import ProjectsTab from 'components/UserProfile/TeamsAndProjects/ProjectsTab'

/**
   *
   * @param {*} props.allProjects Complete list of every project in the HGN system
   * @param {*} props.allTeams
   * @returns
   */
   const ProjectsAndTeams = props => {

    const { allTeams, teams, setTeams, allProjects, projects, setProjects} = props

    const [activeTab, setActiveTab] = useState('1')

      return (
        <>
          <div className="profile-tabs">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classNames({ active: activeTab === '1' }, 'nav-link')}
                  onClick={() => setActiveTab('1')}
                >
                  Project
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classNames({ active: activeTab === '2' }, 'nav-link')}
                  onClick={() => setActiveTab('2')}
                >
                  Team
                </NavLink>
              </NavItem>
            </Nav>
          </div>
          <TabContent
            activeTab={activeTab}
            className="tab-content profile-tab"
            id="myTabContent"
            style={{ border: 0 }}
          >
            <TabPane tabId="1">
              <ProjectsTab
                userProjects={projects}
                allProjects={allProjects || []}
                onAssignProject={project => setProjects([...projects, project])}
                onDeleteProject={projectId => {
                  setProjects(projects.filter(project => project.id !== projectId))
                }}
                isUserAdmin={true}
                edit
              />
            </TabPane>
            <TabPane tabId="2">
              <TeamsTab
                userTeams={teams}
                allTeams={allTeams || []}
                onAssignTeam={team => setTeams([...teams, team])}
                onDeleteTeam={teamId => {
                  setTeams(teams.filter(team => team.id !== teamId))
                }}
                isUserAdmin={true}
                edit
              />
            </TabPane>
          </TabContent>
        </>
      )
  }

  export default ProjectsAndTeams