/* eslint-disable */

import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col, Button, FormGroup } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import HistoryModal from './HistoryModal';
import './timeTab.css';
import { boxStyle } from 'styles';

const MINIMUM_WEEK_HOURS = 0;
const MAXIMUM_WEEK_HOURS = 168;

const startEndDateValidation = props => {
  return (
    props.userProfile.createdDate > props.userProfile.endDate && props.userProfile.endDate !== ''
  );
};

const StartDate = props => {
  if (!props.canEdit) {
    return <p>{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</p>;
  }
  return (
    <Input
      type="date"
      name="StartDate"
      id="startDate"
      className={startEndDateValidation(props) ? 'border-error-validation' : null}
      value={moment(props.userProfile.createdDate).format('YYYY-MM-DD')}
      onChange={e => {
        props.setUserProfile({ ...props.userProfile, createdDate: e.target.value });
        props.onStartDateComponent(e.target.value);
      }}
      placeholder="Start Date"
      invalid={!props.canEdit}
      max={props.userProfile.endDate ? moment(props.userProfile.endDate).format('YYYY-MM-DD') : ''}
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
      className={startEndDateValidation(props) ? 'border-error-validation' : null}
      type="date"
      name="EndDate"
      id="endDate"
      value={
        props.userProfile.endDate ? props.userProfile.endDate.toLocaleString().split('T')[0] : ''
      }
      onChange={e => {
        props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
        props.onEndDateComponent(e.target.value);
      }}
      placeholder="End Date"
      invalid={!props.canEdit}
      min={
        props.userProfile.createdDate
          ? moment(props.userProfile.createdDate).format('YYYY-MM-DD')
          : ''
      }
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

  const summaryOptions = [
    { value: 'Required', text: 'Required' },
    { value: 'Not Required', text: 'Not Required (Slate Gray)' },
    { value: 'Team Fabulous', text: 'Team Fabulous (Fuschia)' },
    { value: 'Team Marigold', text: 'Team Marigold (Orange)' },
    { value: 'Team Luminous', text: 'Team Luminous (Yellow)' },
    { value: 'Team Lush', text: 'Team Lush (Green)' },
    { value: 'Team Sky', text: 'Team Sky (Blue)' },
    { value: 'Team Azure', text: 'Team Azure (Indigo)' },
    { value: 'Team Amethyst', text: 'Team Amethyst (Purple)' },
  ];

  const handleOnChange = e => {
    let temp = { ...props.userProfile };
    temp.weeklySummaryOption = e.target.value;
    if (e.target.value === 'Not Required') {
      temp.weeklySummaryNotReq = true;
    } else {
      temp.weeklySummaryNotReq = false;
    }
    props.setUserProfile(temp);
  };

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
        onChange={handleOnChange}
      >
        {summaryOptions.map(({ value, text }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </FormGroup>
  );
};

const WeeklyCommittedHours = props => {
  //Do Not change the property name "weeklycommittedHours"
  //Otherwise it will not update in the backend.
  if (!props.canEdit) {
    return <p>{props.userProfile.weeklycommittedHours}</p>;
  }
  const handleChange = e => {
    // Max: 168 hrs  Min: 0 hr
    // Convert value from string into easy number
    const value = parseInt(e.target.value);
    if (value > MAXIMUM_WEEK_HOURS) {
      // Check if Value is greater than maximum hours and set it to maximum hours if needed
      alert(`You can't commit more than ${MAXIMUM_WEEK_HOURS} hours per week.`);
      props.setUserProfile({ ...props.userProfile, weeklycommittedHours: MAXIMUM_WEEK_HOURS });
    } else if (value < MINIMUM_WEEK_HOURS) {
      //Check if value is less than minimum hours and set it to minimum hours if needed
      alert(`You can't commit less than ${MINIMUM_WEEK_HOURS} hours per week.`);
      props.setUserProfile({ ...props.userProfile, weeklycommittedHours: MINIMUM_WEEK_HOURS });
    } else {
      //update weekly hours whatever numbers in the input
      props.setUserProfile({ ...props.userProfile, weeklycommittedHours: value });
    }
  };

  return (
    <Input
      type="number"
      min={MINIMUM_WEEK_HOURS - 1}
      max={MAXIMUM_WEEK_HOURS + 1}
      name="weeklycommittedHours"
      id="weeklycommittedHours"
      data-testid="weeklycommittedHours"
      value={props.userProfile.weeklycommittedHours}
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
  const [historyModal, setHistoryModal] = useState(false);

  const handleStartDates = async startDate => {
    props.onStartDate(startDate);
  };

  const handleEndDates = async endDate => {
    props.onEndDate(endDate);
  };

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

  const toggleHistoryModal = () => {
    setHistoryModal(!historyModal);
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
            onStartDateComponent={handleStartDates}
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
            onEndDateComponent={handleEndDates}
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
        <Col md="6" className="d-flex align-items-center">
          <WeeklyCommittedHours
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
          />
          <HistoryModal
            isOpen={historyModal}
            toggle={toggleHistoryModal}
            userName={userProfile.firstName}
            userHistory={userProfile.weeklycommittedHoursHistory}
          />
          <span className="history-icon">
            <i class="fa fa-history" aria-hidden="true" onClick={toggleHistoryModal}></i>
          </span>
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
            style={boxStyle}
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
