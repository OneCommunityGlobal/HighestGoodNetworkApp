import React from 'react'
import { Row, Label, Input, Col } from 'reactstrap'
import moment from 'moment'
import { capitalize } from 'lodash'

const StartDate = props => {
  if (!props.isUserAdmin) {
    return <p>{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</p>
  }
  return (
    <Input
      type="date"
      name="StartDate"
      id="startDate"
      value={moment(props.userProfile.createdDate).format('YYYY-MM-DD')}
      onChange={props.handleUserProfile}
      placeholder="Start Date"
      invalid={!props.isUserAdmin}
    />
  )
}
const WeeklyCommitedHours = props => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.weeklyComittedHours}</p>
  }
  return (
    <Input
      type="number"
      name="weeklyComittedHours"
      id="weeklyComittedHours"
      value={props.userProfile.weeklyComittedHours}
      onChange={props.handleUserProfile}
      placeholder="weeklyCommittedHours"
      invalid={!props.isUserAdmin}
    />
  )
}

const TotalCommittedHours = props => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.totalTangibleHrs}</p>
  }
  return (
    <Input
      type="number"
      name="totalTangibleHours"
      id="totalTangibleHours"
      value={
        props.userProfile.totalTangibleHrs.toFixed !== undefined
          ? props.userProfile.totalTangibleHrs.toFixed(2)
          : props.userProfile.totalTangibleHrs
      }
      onChange={props.handleUserProfile}
      placeholder="Total Tangible Time Logged"
      invalid={!props.isUserAdmin}
    />
  )
}

/**
 * 
 * @param {Integer} props.hoursByCategory.housing
 * @param {Integer} props.hoursByCategory.food
 * @param {Integer} props.hoursByCategory.education
 * @param {Integer} props.hoursByCategory.society
 * @param {Integer} props.hoursByCategory.energy
 * @param {*} props.userProfile
 * @param {*} props.timeEntries
 * @param {*} props.isUserAdmin
 * @param {*} props.isUserSelf
 * @param {Function} handleUserProfile
 * 
 * @returns 
 */
const ViewTab = props => {
  const { userProfile, timeEntries, isUserAdmin, isUserSelf, handleUserProfile } = props
  const weeklyHoursReducer = (acc, val) =>
    acc + (parseInt(val.hours, 10) + parseInt(val.minutes, 10) / 60)
  //const canEdit = isUserAdmin || isUserSelf;

  return (
    <div data-testid="volunteering-time-tab">
      <Row>
        <Col md="6">
          <Label>Start Date</Label>
        </Col>
        <Col md="6">
          <StartDate
            isUserAdmin={isUserAdmin}
            userProfile={userProfile}
            handleUserProfile={handleUserProfile}
          />
        </Col>
      </Row>
      
      <Row>
        <Col md="6">
          <Label>End Date</Label>
        </Col>
        <Col md="6">
          <p>{userProfile.endDate ? moment(userProfile.endDate).format('YYYY-MM-DD') : 'N/A'}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md="6">
          <Label>Total Hours This Week</Label>
        </Col>
        <Col md="6">
          <p>{timeEntries.weeks[0].reduce(weeklyHoursReducer, 0).toFixed(2)}</p>
        </Col>
      </Row>
      
      <Row>
        <Col md="6">
          <Label>Weekly Summary Required </Label>
        </Col>
        <Col md="6">
          <WeeklySummaryReqd isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Weekly Committed Hours </Label>
        </Col>
        <Col md="6">
          <WeeklyCommitedHours
            isUserAdmin={isUserAdmin}
            userProfile={userProfile}
            handleUserProfile={handleUserProfile}
          />
        </Col>
      </Row>
      
      <Row>
        <Col md="6">
          <Label>Total Tangible Hours </Label>
        </Col>
        <Col md="6">
          <TotalCommittedHours
            isUserAdmin={isUserAdmin}
            userProfile={userProfile}
            handleUserProfile={handleUserProfile}
          />
        </Col>
      </Row>
      
      {Object.keys(props.hoursByCategory).map(key => (
        <>
          <Row key={'hours-by-category-' + key}>
            <Col md="6">
              <Label>Total Tangible {capitalize(key)} Hours </Label>
            </Col>
            <Col md="6">{props.hoursByCategory[key]}</Col>
          </Row>
          
        </>
      ))}

    </div>
  )
}

export default ViewTab
