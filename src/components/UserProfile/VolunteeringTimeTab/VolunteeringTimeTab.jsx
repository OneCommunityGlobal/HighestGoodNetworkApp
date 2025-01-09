/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col, Button, FormGroup, FormFeedback } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import './timeTab.css';
import { boxStyle, boxStyleDark } from 'styles';
import { formatDateYYYYMMDD, formatDateMMDDYYYY, CREATED_DATE_CRITERIA } from 'utils/formatDate';
import { Alert } from 'reactstrap';
import HistoryModal from './HistoryModal';

const MINIMUM_WEEK_HOURS = 0;
const MAXIMUM_WEEK_HOURS = 168;

const startEndDateValidation = props => {
  return (
    props.userProfile.startDate > props.userProfile.endDate && props.userProfile.endDate !== ''
  );
};

function StartDate(props) {
  const { darkMode, startDateAlert } = props;

  if (!props.canEdit) {
    return (
      <p className={darkMode ? 'text-azure' : ''}>
        {!props.userProfile.startDate ? 'N/A' : formatDateYYYYMMDD(props.userProfile.startDate)}
      </p>
    );
  }
  return (
    <FormGroup>
      <Input
        type="date"
        name="StartDate"
        id="startDate"
        className={startEndDateValidation(props) ? 'border-error-validation' : null}
        value={props.userProfile.startDate}
        min={
          props.userProfile.createdDate < CREATED_DATE_CRITERIA ? '' : props.userProfile.createdDate
        }
        onChange={e => {
          props.setUserProfile({ ...props.userProfile, startDate: e.target.value });
          props.onStartDateComponent(e.target.value);
        }}
        placeholder="Start Date"
        invalid={!props.canEdit}
        max={
          props.userProfile.endDate ? formatDateYYYYMMDD(props.userProfile.endDate) : '9999-12-31'
        }
      />
      {startDateAlert && <FormFeedback style={{ display: 'block' }}>{startDateAlert}</FormFeedback>}
    </FormGroup>
  );
}

function EndDate(props) {
  const { darkMode, endDateAlert } = props;

  if (!props.canEdit) {
    return (
      <p className={darkMode ? 'text-azure' : ''}>
        {props.userProfile.endDate ? formatDateYYYYMMDD(props.userProfile.endDate) : 'N/A'}
      </p>
    );
  }

  return (
    <FormGroup>
      <Input
        className={startEndDateValidation(props) ? 'border-error-validation' : null}
        type="date"
        name="EndDate"
        id="endDate"
        value={props.userProfile.endDate ? props.userProfile.endDate : ''}
        onChange={e => {
          props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
          props.onEndDateComponent(e.target.value);
        }}
        placeholder="End Date"
        invalid={!props.canEdit}
        min={props.userProfile.startDate ? props.userProfile.startDate : ''}
        max="9999-12-31"
      />
      {endDateAlert && <FormFeedback style={{ display: 'block' }}>{endDateAlert}</FormFeedback>}
    </FormGroup>
  );
}

function WeeklySummaryOptions(props) {
  const { darkMode } = props;

  if (!props.canEdit) {
    return (
      <p className={darkMode ? 'text-azure' : ''}>
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
    { value: 'Team Skye', text: 'Team Skye (Blue)' },
    { value: 'Team Azure', text: 'Team Azure (Indigo)' },
    { value: 'Team Amethyst', text: 'Team Amethyst (Purple)' },
  ];

  const handleOnChange = e => {
    const temp = { ...props.userProfile };
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
}

function WeeklyCommittedHours(props) {
  // Do Not change the property name "weeklycommittedHours"
  // Otherwise it will not update in the backend.

  const { darkMode } = props;
  const [alert, setAlert] = useState({ message: '', color: '', visible: false });

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{props.userProfile.weeklycommittedHours}</p>;
  }
  const handleChange = e => {
    const value = parseInt(e.target.value, 10);

    if (value > MAXIMUM_WEEK_HOURS) {
      setAlert({
        message: `You can't commit more than ${MAXIMUM_WEEK_HOURS} hours per week.`,
        color: 'danger', // Use color mapping defined in your project
        visible: true,
      });
      props.setUserProfile({
        ...props.userProfile,
        weeklycommittedHours: MAXIMUM_WEEK_HOURS,
      });
    } else if (value < MINIMUM_WEEK_HOURS) {
      setAlert({
        message: `You can't commit less than ${MINIMUM_WEEK_HOURS} hours per week.`,
        color: 'warning',
        visible: true,
      });
      props.setUserProfile({
        ...props.userProfile,
        weeklycommittedHours: MINIMUM_WEEK_HOURS,
      });
    } else {
      setAlert({ ...alert, visible: false }); // Hide alert if input is valid
      props.setUserProfile({
        ...props.userProfile,
        weeklycommittedHours: value,
      });
    }
  };

  return (
    <>
      {alert.visible && (
        <Alert color={alert.color} toggle={() => setAlert({ ...alert, visible: false })}>
          {alert.message}
        </Alert>
      )}
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
    </>
  );
}

function MissedHours(props) {
  const { darkMode } = props;

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{props.userProfile.missedHours ?? 0}</p>;
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
}

function TotalIntangibleHours(props) {
  const { darkMode } = props;

  if (!props.canEdit) {
    return <p className={darkMode ? 'text-azure' : ''}>{props.userProfile.totalIntangibleHrs}</p>;
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
        const newValue = Math.max(Number(e.target.value), 0).toFixed(2);
        props.setUserProfile({
          ...props.userProfile,
          totalIntangibleHrs: Number(newValue),
        });
      }}
      placeholder="Total Intangible Hours"
    />
  );
}

/**
 *
 * @param {*} props.userProfile
 * @param {*} props.isUserSelf
 * @param {Function} handleUserProfile
 *
 * @returns
 */
function ViewTab(props) {
  const {
    userProfile,
    setUserProfile,
    role,
    canEdit,
    canUpdateSummaryRequirements,
    darkMode,
  } = props;
  const [totalTangibleHoursThisWeek, setTotalTangibleHoursThisWeek] = useState(0);
  const [totalTangibleHours, setTotalTangibleHours] = useState(0);
  const { hoursByCategory } = userProfile;
  const [historyModal, setHistoryModal] = useState(false);
  const [startDateAlert, setStartDateAlert] = useState('');
  const [endDateAlert, setEndDateAlert] = useState('');

  const handleStartDates = async startDate => {
    // if(!userProfile.isFirstTimelog) {
    //   alert('This user has already logged time in the system. Are you sure you want to change the start date?');
    // }
    props.onStartDate(startDate);
  };

  const handleEndDates = async endDate => {
    props.onEndDate(endDate);
  };

  const calculateTotalHrsForPeriod = timeEntries => {
    const hours = { totalTangibleHrs: 0, totalIntangibleHrs: 0 };
    if (timeEntries.length < 1) return hours;

    for (let i = 0; i < timeEntries.length; i += 1) {
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

  // This function is return totalTangibleHours which is the sum of all the tangible categories
  const sumOfCategoryHours = () => {
    const hours = Object.values(hoursByCategory).reduce((prev, curr) => prev + curr, 0);
    setTotalTangibleHours(hours.toFixed(2));
  };

  useEffect(() => {
    sumOfCategoryHours();
  }, [hoursByCategory]);

  const toggleHistoryModal = () => {
    setHistoryModal(!historyModal);
  };

  useEffect(() => {
    // Get Total Tangible Hours this week
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

    // Get total tangible & intangible hours
    const createdDate = formatDateYYYYMMDD(userProfile.createdDate);
    const today = moment().format('YYYY-MM-DD');

    axios
      .get(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, createdDate, today))
      .then(() => {
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
    let { value } = e.target;
    if (!value) value = 0;
    setUserProfile({
      ...userProfile,
      hoursByCategory: {
        ...userProfile.hoursByCategory,
        [key]: Number(value),
      },
    });
  };

  useEffect(() => {
    if (userProfile.startDate === '') {
      setStartDateAlert('Invalid date');
    } else if (
      userProfile.createdDate >= CREATED_DATE_CRITERIA &&
      userProfile.startDate < userProfile.createdDate
    ) {
      setStartDateAlert('The start date is before the account created date');
    } else {
      setStartDateAlert('');
    }
  }, [userProfile.startDate, userProfile.createdDate]);

  useEffect(() => {
    if (userProfile.endDate !== '' && userProfile.endDate < userProfile.startDate) {
      setEndDateAlert('The end date is before the start date');
    } else {
      setEndDateAlert('');
    }
  }, [userProfile.startDate, userProfile.endDate]);

  return (
    <div data-testid="volunteering-time-tab">
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
            Account Created Date
          </Label>
        </Col>
        <Col md="6">
          <p className={darkMode ? 'text-azure' : ''}>
            {formatDateMMDDYYYY(userProfile.createdDate)}
          </p>
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>Start Date</Label>
        </Col>
        <Col md="6">
          <StartDate
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            onStartDateComponent={handleStartDates}
            darkMode={darkMode}
            startDateAlert={startDateAlert}
          />
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>End Date</Label>
        </Col>
        <Col md="6">
          <EndDate
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            onEndDateComponent={handleEndDates}
            darkMode={darkMode}
            endDateAlert={endDateAlert}
          />
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
            Total Tangible Hours This Week
          </Label>
        </Col>
        <Col md="6">
          <p className={`hours-totalTangible-thisWeek ${darkMode ? 'text-azure' : ''}`}>
            {totalTangibleHoursThisWeek}
          </p>
        </Col>
      </Row>

      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
            Weekly Summary Options{' '}
          </Label>
        </Col>
        <Col md="6">
          <WeeklySummaryOptions
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit && canUpdateSummaryRequirements}
            darkMode={darkMode}
          />
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
            Weekly Committed Hours{' '}
          </Label>
        </Col>
        <Col md="6" className="d-flex align-items-center">
          <WeeklyCommittedHours
            role={role}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            darkMode={darkMode}
          />
          <HistoryModal
            isOpen={historyModal}
            toggle={toggleHistoryModal}
            userName={userProfile.firstName}
            userHistory={userProfile.weeklycommittedHoursHistory}
          />
          <span className="history-icon">
            <i className="fa fa-history" aria-hidden="true" onClick={toggleHistoryModal} />
          </span>
        </Col>
      </Row>
      {userProfile.role === 'Core Team' && (
        <Row className="volunteering-time-row">
          <Col md="6">
            <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
              Additional Make-up Hours This Week{' '}
            </Label>
          </Col>
          <Col md="6">
            <MissedHours
              role={role}
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              canEdit={canEdit}
              darkMode={darkMode}
            />
          </Col>
        </Row>
      )}
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
            Total Intangible Hours{' '}
          </Label>
        </Col>
        <Col md="6">
          <TotalIntangibleHours
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            canEdit={canEdit}
            darkMode={darkMode}
          />
        </Col>
      </Row>
      <Row className="volunteering-time-row">
        <Col md="6">
          <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
            Total Tangible Hours{' '}
          </Label>
        </Col>
        <Col md="6" className="tangible-hrs-group">
          <p className={`hours-totalTangible ${darkMode ? 'text-azure' : ''}`}>
            {totalTangibleHours}
          </p>
          <Button
            size="sm"
            color="info"
            className="refresh-btn"
            onClick={() => props.loadUserProfile()}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Refresh
          </Button>
        </Col>
      </Row>
      {props?.userProfile?.hoursByCategory
        ? Object.keys(userProfile.hoursByCategory).map(key => (
            <React.Fragment key={`hours-by-category-${key}`}>
              <Row className="volunteering-time-row">
                <Col md="6">
                  <Label className={`hours-label ${darkMode ? 'text-light' : ''}`}>
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
                    <p className={darkMode ? 'text-azure' : ''}>
                      {userProfile.hoursByCategory[key]?.toFixed(2)}
                    </p>
                  )}
                </Col>
              </Row>
            </React.Fragment>
          ))
        : []}
    </div>
  );
}

export default ViewTab;
