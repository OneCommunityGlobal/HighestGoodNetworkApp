import React, { useState } from 'react';
import { Row, Label, Input, Col } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { useEffect } from 'react';

const StartDate = (props) => {
  if (!props.isUserAdmin) {
    return <p>{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</p>;
  }
  return (
    <Input
      type="date"
      name="StartDate"
      id="startDate"
      value={moment(props.userProfile.createdDate).format('YYYY-MM-DD')}
      onChange={(e) => {
        props.setChanged(true);
        props.setUserProfile({ ...props.userProfile, createdDate: e.target.value });
      }}
      placeholder="Start Date"
      invalid={!props.isUserAdmin}
    />
  );
};

const EndDate = (props) => {
  if (!props.isUserAdmin) {
    return (
      <p>
        {props.userProfile.endDate
          ? props.userProfile.endDate.toLocaleString().split('T')[0]
          : 'N/A'}
      </p>
    );
  }
  return (
    <Input
      type="date"
      name="EndDate"
      id="endDate"
      value={
        props.userProfile.endDate ? props.userProfile.endDate.toLocaleString().split('T')[0] : ''
      }
      onChange={(e) => {
        props.setChanged(true);
        props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
      }}
      placeholder="End Date"
      invalid={!props.isUserAdmin}
    />
  );
};

const WeeklyCommitedHours = (props) => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.weeklyComittedHours}</p>;
  }
  return (
    <Input
      type="number"
      name="weeklyComittedHours"
      id="weeklyComittedHours"
      data-testid="weeklyCommittedHours"
      value={props.userProfile.weeklyComittedHours}
      onChange={(e) => {
        props.setUserProfile({ ...props.userProfile, weeklyComittedHours: e.target.value });
        props.setChanged(true);
      }}
      placeholder="Weekly Committed Hours"
      invalid={!props.isUserAdmin}
    />
  );
};

const TotalCommittedHours = (props) => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.totalTangibleHrs}</p>;
  }
  return (
    <Input
      type="number"
      name="totalTangibleHours"
      id="totalTangibleHours"
      value={props.userProfile.totalTangibleHrs}
      onChange={(e) => {
        props.setUserProfile({ ...props.userProfile, totalTangibleHrs: e.target.value });
        props.setChanged(true);
      }}
      placeholder="Total Tangible Time Logged"
      invalid={!props.isUserAdmin}
    />
  );
};

const WeeklySummaryReqd = (props) => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required'}</p>;
  }
  return (
    <div className={style.switchContainer}>
      Required
      <input
        id="weeklySummaryNotReqd"
        data-testid="weeklySummary-switch"
        type="checkbox"
        className={style.toggle}
        onChange={(e) => {
          props.setUserProfile({
            ...props.userProfile,
            weeklySummaryNotReq: !props.userProfile.weeklySummaryNotReq,
          });
          props.setChanged(true);
        }}
        checked={props.userProfile.weeklySummaryNotReq}
      />
      Not Required
    </div>
  );
};

/**
 *
 * @param {*} props.userProfile
 * @param {*} props.isUserAdmin
 * @param {*} props.isUserSelf
 * @param {Function} handleUserProfile
 *
 * @returns
 */
const ViewTab = (props) => {
  const { userProfile, setUserProfile, setChanged, isUserAdmin, handleUserProfile } = props;

  const [totalTangibleHoursThisWeek, setTotalTangibleHoursThisWeek] = useState('Loading...');
  useEffect(() => {
    const startOfWeek = moment().tz('America/Los_Angeles').startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment().tz('America/Los_Angeles').endOf('week').format('YYYY-MM-DD');
    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, startOfWeek, endOfWeek))
      .then((res) => {
        let output = 0;
        for (let i = 0; i < res.data.length; i++) {
          const timeEntry = res.data[i];
          if (timeEntry.isTangible === true) {
            output += timeEntry.hours + timeEntry.minutes / 60;
          }
        }

        setTotalTangibleHoursThisWeek(parseFloat(output).toFixed(2));
      })
      .catch((err) => {});
  }, []);

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
            setUserProfile={setUserProfile}
            setChanged={setChanged}
          />
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <Label>End Date</Label>
        </Col>
        <Col md="6">
          <EndDate
            isUserAdmin={isUserAdmin}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setChanged={setChanged}
          />
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
            setUserProfile={setUserProfile}
            setChanged={setChanged}
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
            setUserProfile={setUserProfile}
            setChanged={setChanged}
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
            setUserProfile={setUserProfile}
            setChanged={setChanged}
          />
        </Col>
      </Row>

      {props?.userProfile?.hoursByCategory
        ? Object.keys(props.userProfile.hoursByCategory).map((key) => (
            <React.Fragment key={'hours-by-category-' + key}>
              <Row>
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
                      onChange={(e) => {
                        setUserProfile({
                          ...props.userProfile,
                          hoursByCategory: {
                            ...props.userProfile.hoursByCategory,
                            [key]: e.target.value,
                          },
                        });
                      }}
                      placeholder={`Total Tangible ${capitalize(key)} Hours`}
                    />
                  ) : (
                    <p>{props.userProfile.hoursByCategory[key]}</p>
                  )}
                </Col>
              </Row>
            </React.Fragment>
          ))
        : []}
    </div>
  );
};

export default ViewTab;
