import React, { useState } from 'react'
import { Row, Label, Input, Col } from 'reactstrap'
import moment from 'moment-timezone'
import { capitalize } from 'lodash'
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss'
import { ENDPOINTS } from 'utils/URL'
import axios from 'axios'
import { useEffect } from 'react'

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
      data-testid='weeklyCommittedHours'
      value={props.userProfile.weeklyComittedHours}
      onChange={props.handleUserProfile}
      placeholder="Weekly Committed Hours"
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
      value={props.userProfile.totalTangibleHrs}
      onChange={props.handleUserProfile}
      placeholder="Total Tangible Time Logged"
      invalid={!props.isUserAdmin}
    />
  )
}

const WeeklySummaryReqd = props => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required'}</p>
  }
  return (
    <div className={style.switchContainer}>
      Required
      <input
        id="weeklySummaryNotReqd"
        data-testid="weeklySummary-switch"
        type="checkbox"
        className={style.toggle}
        onChange={props.handleUserProfile}
        checked={props.userProfile.weeklySummaryNotReq}
      />
      Not Required
    </div>
  )
}

/**
 *
 * @param {*} props.userProfile
 * @param {*} props.isUserAdmin
 * @param {*} props.isUserSelf
 * @param {Function} handleUserProfile
 *
 * @returns
 */
const ViewTab = props => {
  const { userProfile, isUserAdmin, handleUserProfile } = props

  const [totalTangibleHoursThisWeek, setTotalTangibleHoursThisWeek] = useState('Loading...')
  useEffect(() => {
    const startOfWeek = moment().tz('America/Los_Angeles').startOf('week').format('YYYY-MM-DD')
    const endOfWeek = moment().tz('America/Los_Angeles').endOf('week').format('YYYY-MM-DD')
    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, startOfWeek, endOfWeek))
      .then(res => {
        let output = 0
        for (let i = 0; i < res.data.length; i++) {
          const timeEntry = res.data[i]
          if (timeEntry.isTangible === true) {
            output += timeEntry.hours + timeEntry.minutes / 60
          }
        }

        setTotalTangibleHoursThisWeek(parseFloat(output).toFixed(2))
      })
      .catch(err => {
        console.log(err)
        alert('err')
      })
  }, [])

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
          <Label>Total Tangible Hours This Week</Label>
        </Col>
        <Col md="6">
          <p>{totalTangibleHoursThisWeek}</p>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <Label>Weekly Summary Required </Label>
        </Col>
        <Col md="6">
          <WeeklySummaryReqd
            isUserAdmin={isUserAdmin}
            userProfile={userProfile}
            handleUserProfile={handleUserProfile}
          />
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

      {Object.keys(props.userProfile.hoursByCategory).map(key => (
        <>
          <Row key={'hours-by-category-' + key}>
            <Col md="6">
              <Label>
                {key !== 'unassigned' ? (
                  <>Total Tangible {capitalize(key)} Hours</>
                ) : (
                  <>Total Unassigned Category Hours</>
                )}{' '}
              </Label>
            </Col>
            <Col md="6">
              {props.isUserAdmin ? (
                <Input
                  type="number"
                  id={`${key}Hours`}
                  value={props.userProfile.hoursByCategory[key]}
                  onChange={props.handleUserProfile}
                  placeholder={`Total Tangible ${capitalize(key)} Hours`}
                />
              ) : (
                <p>{props.userProfile.hoursByCategory[key]}</p>
              )}
            </Col>
          </Row>
        </>
      ))}
    </div>
  )
}

export default ViewTab
