import { useFormik } from 'formik'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux';
import * as yup from 'yup'

import { getUserProfile, updateUserProfile, clearUserProfile } from 'actions/userProfile';
import { getAllUserTeams, updateTeam, deleteTeamMember, addTeamMember} from 'actions/allTeamsAction';
import { Form, FormGroup, TabPane, TabContent, NavItem, NavLink, Nav, Button } from 'reactstrap'

import CollaborationPreference from './inputs/CollaborationPreference'
import Email from './inputs/Email'
import Phone from './inputs/Phone'
import GoogleDoc from './inputs/GoogleDoc'
import JobTitle from './inputs/JobTitle'
import Name from './inputs/Name'
import Role from './inputs/Role'
import WeeklyCommittedHours from './inputs/WeeklyCommittedHours'
import TimeZone from './inputs/TimeZone'
import ProjectsAndTeams from './inputs/ProjectsAndTeams'

import { fetchAllProjects } from 'actions/projects' 

import { createUser } from 'services/userProfileService';
import {toast} from 'react-toastify';

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
const AddNewUserProfile = props => {

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    props.getAllUserTeams();
    props.fetchAllProjects()
  }, [])

  const onSubmit = values => {

    const userData = {
      password: '123Welcome!',
      role: values.role,
      firstName: values.firstName,
      lastName: values.lastName,
      jobTitle: values.jobTitle,
      phoneNumber: values.phoneNumber,
      bio: '',
      weeklyComittedHours: values.weeklyCommittedHours, //value on backend is misspelled
      personalLinks: [],
      adminLinks: [],
      teams: teams,
      projects: projects,
      email: values.email,
      privacySettings: values.privacySettings,
      collaborationPreference: values.collaborationPreference,
      timeZone: values.timeZone
    }

    if (values.googleDoc) {
      userData.adminLinks.push({ Name: 'Google Doc', Link: values.googleDoc })
    }

    createUser(userData)
      .then(res => {
        toast.success('User profile created.')
        props.userCreated()
      })
      .catch(err => {
        toast.error(
          err.response?.data?.error ||
            'An unknown error occurred while attempting to create this user.',
        )
      })

  }

  const FIELD_REQUIRED = 'This field is required'

  const validationSchema = yup.object().shape({
    firstName: yup.string().required(FIELD_REQUIRED),
    lastName: yup.string().required(FIELD_REQUIRED),
    jobTitle: yup.string().required(FIELD_REQUIRED),
    email: yup
      .string()
      .required(FIELD_REQUIRED)
      .email()
      .test((value) => {

      }),
    phoneNumber: yup
      .string()
      .required(FIELD_REQUIRED)
      .notOneOf(['+', '+1', '1'], 'That value is not permitted'),
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
      jobTitle: '',
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
      teams: [],
      projects: []
    },
    onSubmit,
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
        <ProjectsAndTeams
          formik={formik}
          allProjects={props.allProjects}
          allTeams={props.allTeams}
          teams={teams}
          setTeams={setTeams}
          projects={projects}
          setProjects={setProjects}
        />
        <FormGroup>
          <Button
            color='primary'
            onSubmit={formik.handleSubmit}
            type='submit'
          >
            Create User
          </Button>
        </FormGroup>
      </Form>
    </>
  )
}

const mapStateToProps = state => {

  console.log(state.allProjects);

  return ({
    auth: state.auth,
    userProfile: state.userProfile,
    user: state.user || {},
    timeEntries: state.timeEntries,
    userProjects: state.userProjects,
    allProjects: state.allProjects?.projects || [],
    allTeams: state.allTeamsData?.allTeams || [],
})
}

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getAllUserTeams,
  fetchAllProjects,
  updateTeam,
  deleteTeamMember,
  addTeamMember,

})(AddNewUserProfile);