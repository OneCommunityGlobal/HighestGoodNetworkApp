import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col, Button } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './timeTab.css';

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
  return (
    <Input
      type="number"
      name="weeklyComittedHours"
      id="weeklyComittedHours"
      min="0"
      data-testid="weeklyCommittedHours"
      value={props.userProfile.weeklycommittedHours}
      onChange={e => {
        props.setUserProfile({
          ...props.userProfile,
          weeklycommittedHours: Math.max(Number(e.target.value), 0),
        });
      }}
      placeholder="Weekly Committed Hours"
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
      placeholder={`Total Intangible Hours`}
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
          <Label className="hours-label">Weekly Summary Required </Label>
        </Col>
        <Col md="6">
          <WeeklySummaryReqd
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
          <Button outline onClick={() => props.loadUserProfile()}>
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
