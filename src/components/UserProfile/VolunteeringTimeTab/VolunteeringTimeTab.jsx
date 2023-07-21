import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col, Button, FormGroup } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './timeTab.css';

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
        props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
      }}
      placeholder="End Date"
      invalid={!props.canEdit}
    />
  );
};

const WeeklySummaryOptions = props => {
  if (!props.canEdit) {
    return (
      <p>
        {props.userProfile.weeklySummaryOption ??
          (props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required')}
      </p>
    );
  }
  return (
    <FormGroup>
      <select
        name="WeeklySummaryOptions"
        id="weeklySummaryOptions"
        className="form-control"
        disabled={!props.canEdit}
        value={
          props.userProfile.weeklySummaryOption ??
          (props.userProfile.weeklySummaryNotReq ? 'Not Required' : 'Required')
        }
        onChange={e => {
          props.setUserProfile({ ...props.userProfile, weeklySummaryOption: e.target.value });
        }}
      >
        <option value="Required">Required</option>
        <option value="Not Required">Not Required</option>
        <option value="Team">Team</option>
      </select>
    </FormGroup>
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
      if (value === MAXIMUM_WEEK_HOURS + 1) {
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

const MissedHours = props => {
  if (!props.canEdit) {
    return <p>{props.userProfile.missedHours ?? 0}</p>;
  }
  return (
    <Input
      type="number"
      name="missedHours"
      id="missedHours"
      data-testid="missedHours"
      value={props.userProfile.missedHours ?? 0}
      onChange={e => {
        props.setUserProfile({
          ...props.userProfile,
          missedHours: Math.max(Number(e.target.value), 0),
        });
      }}
      placeholder="Additional Make-up Hours This Week"
    />
  );
};

const TotalIntangibleHours = props => {
  if (!props.canEdit) {
    return <p>{props.userProfile.totalIntangibleHrs}</p>;
  }
  return (
    <Input
      type="number"
      name="totalIntangibleHours"
      id="totalIntangibleHours"
      step=".01"
      data-testid="totalIntangibleHours"
      value={props.userProfile.totalIntangibleHrs ?? 0}
      onChange={e => {
        props.setUserProfile({
          ...props.userProfile,
          totalIntangibleHrs: Math.max(Number(e.target.value), 0),
        });
      }}
      placeholder="Total Intangible Hours"
    />
  );
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
  const { userProfile, setUserProfile, role, canEdit } = props;
  const [totalTangibleHoursThisWeek, setTotalTangibleHoursThisWeek] = useState(0);
  const [totalTangibleHours, setTotalTangibleHours] = useState(0);
  const { hoursByCategory, totalIntangibleHrs } = userProfile;

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
        sumOfCategoryHours();
      })
      .catch(err => {
        console.log(err.message);
      });
  }, []);

  const roundToTwo = num => {
    return +(Math.round(num * 100) / 100);
  };

  const handleOnChangeHours = (e, key) => {
    let value = e.target.value;
    if (!value) value = 0;
    setUserProfile({
      ...userProfile,
      hoursByCategory: {
        ...userProfile.hoursByCategory,
        [key]: Number(value),
      },
    });
  };

  return (
    <div data-testid="volunteering-time-tab">
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">Start Date</Label>
        </Col>
        <Col md="6">
          <StartDate
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
          />
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">End Date</Label>
        </Col>
        <Col md="6">
          <EndDate
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
          />
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">Total Tangible Hours This Week</Label>
        </Col>
        <Col md="6">
          <p className="hours-totalTangible-thisWeek">{totalTangibleHoursThisWeek}</p>
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">Weekly Summary Options </Label>
        </Col>
        <Col md="6">
          <WeeklySummaryOptions
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
          />
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">Weekly Committed Hours </Label>
        </Col>
        <Col md="6">
          <WeeklyCommittedHours
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
          />
        </Col>
      </Row>
      {userProfile.role === 'Core Team' && (
        <Row className="volunteering-time-row">
          <Col md="6">
            <Label className="hours-label">Additional Make-up Hours This Week </Label>
          </Col>
          <Col md="6">
            <MissedHours
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              canEdit={canEdit}
            />
          </Col>
        </Row>
      )}
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">Total Intangible Hours </Label>
        </Col>
        <Col md="6">
          <TotalIntangibleHours
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
          />
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className="hours-label">Total Tangible Hours </Label>
        </Col>
        <Col md="6" className="tangible-hrs-group">
          <p className="hours-totalTangible">{totalTangibleHours}</p>
          <Button
            size="sm"
            color="info"
            className="refresh-btn"
            onClick={() => props.loadUserProfile()}
          >
            Refresh
          </Button>
        </Col>

        {props?.userProfile?.hoursByCategory
          ? Object.keys(userProfile.hoursByCategory).map(key => (
              <React.Fragment key={'hours-by-category-' + key}>
                <Row className="volunteering-time-row">
                  <Col md="6">
                    <Label className="hours-label">
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
                        pattern="^\d*\.?\d{0,2}$"
                        id={`${key}Hours`}
                        step=".01"
                        min="0"
                        value={roundToTwo(userProfile.hoursByCategory[key])}
                        onChange={e => handleOnChangeHours(e, key)}
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
      </Row>
    </div>
  );
};

export default ViewTab;
