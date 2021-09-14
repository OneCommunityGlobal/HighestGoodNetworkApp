import { useFormik } from 'formik'
import React, { useState } from 'react'
import * as yup from 'yup'

import {
  Container,
  Row,
  Col,
  Input,
  FormFeedback,
  FormGroup,
  Form,
  Label,
  Button,
  TabPane,
  TabContent,
  NavItem,
  NavLink,
  Nav,
} from 'reactstrap'

import CollaborationPreference from './inputs/CollaborationPreference'
import Email from './inputs/Email'
import Phone from './inputs/Phone'
import GoogleDoc from './inputs/GoogleDoc'
import JobTitle from './inputs/JobTitle'
import Name from './inputs/Name'
import Role from './inputs/Role'
import WeeklyCommittedHours from './inputs/WeeklyCommittedHours'
import TimeZone from './inputs/TimeZone'

/**
 *
 * @param {*} props.allProjects
 * @param {*} props.allTeams
 * @returns
 */
const ASDF = props => {
  const { formik } = props
  const [activeTab, setActiveTab] = useState('1')

  return (
    <>
      <div className="profile-tabs">
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' }, 'nav-link')}
              onClick={() => {
                this.toggleTab('1')
              }}
            >
              Project
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' }, 'nav-link')}
              onClick={() => {
                this.toggleTab('2')
              }}
            >
              Team
            </NavLink>
          </NavItem>
        </Nav>
      </div>
      <TabContent
        activeTab={this.state.activeTab}
        className="tab-content profile-tab"
        id="myTabContent"
        style={{ border: 0 }}
      >
        <TabPane tabId="1">
          <ProjectsTab
            userProjects={this.state.projects}
            projectsData={this.props ? this.props.allProjects.projects : []}
            onAssignProject={this.onAssignProject}
            onDeleteProject={this.onDeleteProject}
            isUserAdmin={true}
            edit
          />
        </TabPane>
        <TabPane tabId="2">
          <TeamsTab
            userTeams={this.state.teams}
            teamsData={this.props ? this.props.allTeams.allTeamsData : []}
            onAssignTeam={this.onAssignTeam}
            onDeleteteam={this.onDeleteTeam}
            isUserAdmin={true}
            edit
          />
        </TabPane>
      </TabContent>
    </>
  )
}

//const mapStateToProps = state => ({
//  auth: state.auth,
//  userProjects: state.userProjects,
//  allProjects: _.get(state, 'allProjects'),
//  allTeams: state,
//  state,
//  teams: state.teams,
//  projects: state.projects
//})
/**
 *
 * @param {*} props.auth
 * @param {*} props.userProjects
 * @param {*} props.allProjects
 * @param {*} props.allTeams
 * @param {*} props.teams
 * @param {*} ptops.projects
 * @returns
 */
const UserProfileAdd = props => {
  const FIELD_REQUIRED = 'This field is required'

  const validationSchema = yup.object().shape({
    firstName: yup.string().required(FIELD_REQUIRED),
    lastName: yup.string().required(FIELD_REQUIRED),
    jobTitle: yup.string().required(FIELD_REQUIRED),
    email: yup
      .string()
      .required(FIELD_REQUIRED)
      .email(),
    phoneNumber: yup
      .string()
      .required(FIELD_REQUIRED)
      .notOneOf(['+', '+1'], FIELD_REQUIRED),
    weeklyCommittedHours: yup
      .number()
      .integer()
      .min(0, 'Please enter a a positve number or 0')
      .required(),
  })

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '1',
      weeklyCommittedHours: 0,
      role: 'Volunteer',
      collaborationPreference: '',
      googleDoc: '',
      timeZone: 'America/Los_Angeles',
      timeZoneFilter: 'Los Angeles',
      privacySettings: {
        blueSquares: true,
        email: true,
        phoneNumber: true,
      },
    },
    onSubmit: values => {},
    validationSchema: validationSchema,
  })

  return (
    <>
      <Form onSubmit={formik.handleSubmit}>
        <Name formik={formik} />
        <JobTitle formik={formik} />
        <Email formik={formik} />
        <Phone formik={formik} />
        <WeeklyCommittedHours formik={formik} />
        <Role formik={formik} />
        <CollaborationPreference formik={formik} />
        <GoogleDoc formik={formik} />
        <TimeZone formik={formik} />
      </Form>
    </>
  )
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
  teams: state.teams,
  projects: state.projects,
  state,
})

export default UserProfileAdd

/**
 * export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
})(UserProfileAdd)
 */
