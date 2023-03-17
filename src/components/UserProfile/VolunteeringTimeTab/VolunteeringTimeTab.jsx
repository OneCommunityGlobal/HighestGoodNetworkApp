import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import styles from './VolunteeringTimeTab.css';

const MINIMUM_WEEK_HOURS = 0;
const MAXIMUM_WEEK_HOURS = 168;

const StartDate = props => {
  if (!props.canEdit) {
    return <p>{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</p>;
  }
  return (
    <Input
      type="date"
      name="StartDate"
      id="startDate"
      value={moment(props.userProfile.createdDate).format('YYYY-MM-DD')}
      onChange={e => {
        props.setChanged(true);
        props.setUserProfile({ ...props.userProfile, createdDate: e.target.value });
      }}
      placeholder="Start Date"
      invalid={!props.canEdit}
    />
  );
};

const EndDate = props => {
  if (!props.canEdit) {
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
      onChange={e => {
        props.setChanged(true);
        props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
      }}
      placeholder="End Date"
      invalid={!props.canEdit}
    />
  );
};

const WeeklySummaryReqd = props => {
  if (!props.canEdit) {
    return <p>{props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required'}</p>;
  }
  return (
    <div className={style.switchContainer} style={{ justifyContent: 'left', marginBottom: '10px' }}>
      Required
      <input
        id="weeklySummaryNotReqd"
        data-testid="weeklySummary-switch"
        type="checkbox"
        className={style.toggle}
        onChange={e => {
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

const WeeklyCommittedHours = props => {
  if (!props.canEdit) {
    return <p>{props.userProfile.weeklycommittedHours}</p>;
  }
  const handleChange = e => {
    // Maximum and minimum constants on lines 9 & 10
    // Convert value from string into easy number variable
    const value = parseInt(e.target.value);
    if (value > MAXIMUM_WEEK_HOURS) {
      // Check if Value is greater than total hours in one week
      alert(`You can't commit more than ${MAXIMUM_WEEK_HOURS} hours per week.`);
      if (value === 169) {
        props.setUserProfile({ ...props.userProfile, weeklyComittedHours: MAXIMUM_WEEK_HOURS });
        props.setChanged(true);
      } else {
        props.setChanged(true);
      }
    } else if (value < MINIMUM_WEEK_HOURS) {
      //Check if value is less than minimum hours and set it to minimum hours if needed
      alert(`You can't commit less than ${MINIMUM_WEEK_HOURS} hours per week.`);
      props.setUserProfile({ ...props.userProfile, weeklyComittedHours: MINIMUM_WEEK_HOURS });
      props.setChanged(true);
    } else {
      props.setUserProfile({ ...props.userProfile, weeklyComittedHours: value });
      props.setChanged(true);
    }
  };

  return (
    <Input
      type="number"
      min={MINIMUM_WEEK_HOURS - 1}
      max={MAXIMUM_WEEK_HOURS + 1}
      name="weeklyComittedHours"
      id="weeklyComittedHours"
      data-testid="weeklyCommittedHours"
      value={props.userProfile.weeklyComittedHours}
      onChange={e => handleChange(e)}
      placeholder="Weekly Committed Hours"
    />
  );
};

const TotalTangibleHours = props => {
  //isUserAdmin is currently a value of Undefined. Therefore, !props.isUserAdmin is set to true all the time.
  //Therefore, I have chosen to comment out the other return statement section as it is not being rendered.
  /*
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.totalTangibleHrs}</p>;
  }
  return (
    <Input
      type="number"
      name="totalTangibleHours"
      id="totalTangibleHours"
      value={props.userProfile.totalTangibleHrs}
      onChange={e => {
        props.setUserProfile({ ...props.userProfile, totalTangibleHrs: e.target.value });
        props.setChanged(true);
      }}
      placeholder="Total Tangible Time Logged"
      invalid={!props.isUserAdmin}
    />
  );
  */
  return <p>{props.userProfile.totalTangibleHrs.toFixed(2)}</p>;
};

/**
 *
 * @param {*} props.userProfile
 * @param {*} props.isUserSelf
 * @param {Function} handleUserProfile
 *
 * @returns
 */
const ViewTab = props => {
  const { userProfile, setUserProfile, setChanged, role, canEdit } = props;
  const [totalTangibleHoursThisWeek, setTotalTangibleHoursThisWeek] = useState(0);
  const [totalIntangibleHours, setTotalIntangibleHours] = useState(0);
  const [totalTangibleHours, setTotalTangibleHours] = useState(0);
  const { hoursByCategory } = userProfile;

  useEffect(() => {
    sumOfCategoryHours();
  }, [hoursByCategory]);

  const calculateTotalHrsForPeriod = timeEntries => {
    let hours = { totalTangibleHrs: 0, totalIntangibleHrs: 0 };
    if (timeEntries.length < 1) return hours;

    for (let i = 0; i < timeEntries.length; i++) {
      const timeEntry = timeEntries[i];
      if (timeEntry.isTangible) {
        hours.totalTangibleHrs += parseFloat(timeEntry.hours) + parseFloat(timeEntry.minutes) / 60;
      } else {
        hours.totalIntangibleHrs +=
          parseFloat(timeEntry.hours) + parseFloat(timeEntry.minutes) / 60;
      }
    }
    return hours;
  };

  //This function is return totalTangibleHours which is the sum of all the tangible categories
  const sumOfCategoryHours = () => {
    const hours = Object.values(hoursByCategory).reduce((prev, curr) => prev + curr, 0);
    setTotalTangibleHours(hours.toFixed(2));
  };

  useEffect(() => {
    //Get Total Tangible Hours this week
    const startOfWeek = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .format('YYYY-MM-DD');
    const endOfWeek = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .format('YYYY-MM-DD');

    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, startOfWeek, endOfWeek))
      .then(res => {
        const timeEntries = res.data;
        const output = calculateTotalHrsForPeriod(timeEntries);
        setTotalTangibleHoursThisWeek(output.totalTangibleHrs.toFixed(2));
      })
      .catch(err => {
        console.log(err.message);
      });

    //Get total tangible & intangible hours
    const createdDate = moment(userProfile.createdDate).format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');

    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, createdDate, today))
      .then(res => {
        const timeEntries = res.data;
        const output = calculateTotalHrsForPeriod(timeEntries);
        setTotalIntangibleHours(output.totalIntangibleHrs.toFixed(2));
        sumOfCategoryHours();
      })
      .catch(err => {
        console.log(err.message);
      });
  }, []);

  return (
    <div>
      <div data-testid="volunteering-time-tab" className="volunteering-time-tab-desktop">
        <Row>
          <Col md="6">
            <Label>Start Date</Label>
          </Col>
          <Col md="6">
            <StartDate
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Row>

        <Row>
          <Col md="6">
            <Label>End Date</Label>
          </Col>
          <Col md="6">
            <EndDate
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
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
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Label>Weekly Committed Hours </Label>
          </Col>
          <Col md="6">
            <WeeklyCommittedHours
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Label>Total Intangible Hours </Label>
          </Col>
          <Col md="6">
            <p>{totalIntangibleHours}</p>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Label>Total Tangible Hours </Label>
          </Col>
          <Col md="6">
            <p>{totalTangibleHours}</p>
          </Col>
        </Row>

        {props?.userProfile?.hoursByCategory
          ? Object.keys(userProfile.hoursByCategory).map(key => (
              <React.Fragment key={'hours-by-category-' + key}>
                <Row>
                  <Col md="6">
                    <Label>
                      {key !== 'unassigned' ? (
                        <>Total Tangible {capitalize(key)} Hours</>
                      ) : (
                        <>Total Unassigned Category Hours</>
                      )}
                    </Label>
                  </Col>
                  <Col md="6">
                    {canEdit ? (
                      <Input
                        type="number"
                        id={`${key}Hours`}
                        step=".01"
                        value={parseFloat(userProfile.hoursByCategory[key])?.toFixed(2)}
                        onChange={e => {
                          setUserProfile({
                            ...userProfile,
                            hoursByCategory: {
                              ...userProfile.hoursByCategory,
                              [key]: Number(e.target.value),
                            },
                          });
                          setChanged(true);
                        }}
                        placeholder={`Total Tangible ${capitalize(key)} Hours`}
                      />
                    ) : (
                      <p>{userProfile.hoursByCategory[key]?.toFixed(2)}</p>
                    )}
                  </Col>
                </Row>
              </React.Fragment>
            ))
          : []}
      </div>
      <div data-testid="volunteering-time-tab" className="volunteering-time-tab-tablet">
        <Col>
          <Col md="6">
            <Label>Start Date</Label>
          </Col>
          <Col md="6">
            <StartDate
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Col>

        <Col>
          <Col md="6">
            <Label>End Date</Label>
          </Col>
          <Col md="6">
            <EndDate
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Col>

        <Col>
          <Col md="6">
            <Label>Total Tangible Hours This Week</Label>
          </Col>
          <Col md="6">
            <p>{totalTangibleHoursThisWeek}</p>
          </Col>
        </Col>

        <Col>
          <Col md="6">
            <Label>Weekly Summary Required </Label>
          </Col>
          <Col md="6">
            <WeeklySummaryReqd
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Col>
        <Col>
          <Col md="6">
            <Label>Weekly Committed Hours </Label>
          </Col>
          <Col md="6">
            <WeeklyCommittedHours
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              setChanged={setChanged}
              canEdit={canEdit}
            />
          </Col>
        </Col>
        <Col>
          <Col md="6">
            <Label>Total Intangible Hours </Label>
          </Col>
          <Col md="6">
            <p>{totalIntangibleHours}</p>
          </Col>
        </Col>
        <Col>
          <Col md="6">
            <Label>Total Tangible Hours </Label>
          </Col>
          <Col md="6">
            <p>{totalTangibleHours}</p>
          </Col>
        </Col>

        {props?.userProfile?.hoursByCategory
          ? Object.keys(userProfile.hoursByCategory).map(key => (
              <React.Fragment key={'hours-by-category-' + key}>
                <Col>
                  <Col md="6">
                    <Label>
                      {key !== 'unassigned' ? (
                        <>Total Tangible {capitalize(key)} Hours</>
                      ) : (
                        <>Total Unassigned Category Hours</>
                      )}
                    </Label>
                  </Col>
                  <Col md="6">
                    {canEdit ? (
                      <Input
                        type="number"
                        id={`${key}Hours`}
                        step=".01"
                        value={parseFloat(userProfile.hoursByCategory[key])?.toFixed(2)}
                        onChange={e => {
                          setUserProfile({
                            ...userProfile,
                            hoursByCategory: {
                              ...userProfile.hoursByCategory,
                              [key]: Number(e.target.value),
                            },
                          });
                          setChanged(true);
                        }}
                        placeholder={`Total Tangible ${capitalize(key)} Hours`}
                      />
                    ) : (
                      <p>{userProfile.hoursByCategory[key]?.toFixed(2)}</p>
                    )}
                  </Col>
                </Col>
              </React.Fragment>
            ))
          : []}
      </div>
    </div>
  );
};

export default ViewTab;
