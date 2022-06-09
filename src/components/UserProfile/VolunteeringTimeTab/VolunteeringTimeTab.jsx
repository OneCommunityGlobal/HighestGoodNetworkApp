import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col } from 'reactstrap';
import moment from 'moment-timezone';
import { capitalize } from 'lodash';
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

const StartDate = (props) => {
  if (!props.canEdit) {
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
      invalid={!props.canEdit}
    />
  );
};

const EndDate = (props) => {
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
      onChange={(e) => {
        props.setChanged(true);
        props.setUserProfile({ ...props.userProfile, endDate: e.target.value });
      }}
      placeholder="End Date"
      invalid={!props.canEdit}
    />
  );
};

const WeeklySummaryReqd = (props) => {
  if (!props.canEdit) {
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

const WeeklyCommitedHours = (props) => {
  if (!props.canEdit) {
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
      // invalid={!props.isUserAdmin}
    />
  );
};
const TotalTangibleHours = (props) => {
  var sum=0;
  props.userProfile.categoryTangibleHrs.forEach(object=>{
    sum+=object.hrs;
  }) 
  console.log(props.userProfile);
  if (!props.isUserAdmin) {
    // return <p>{ (Object.values(props.userProfile.hoursByCategory).reduce((a,b)=>a+b))}</p>;
    return <p>
      {sum.toFixed(2)}
    </p>
  }
  return (
    <Input
      type="number"
      name="totalTangibleHours"
      id="totalTangibleHours"
      value={sum.toFixed(2)}
      // onChange={(e) => {
      //   props.setUserProfile({ ...props.userProfile, totalTangibleHrs: e.target.value });
      //   props.setChanged(true);
      // }}
      placeholder="Total Tangible Time Logged"
      invalid={!props.isUserAdmin}
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
const ViewTab = (props) => {
  const { userProfile, setUserProfile, setChanged, role, canEdit } = props;

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
            output += parseFloat(timeEntry.hours) + parseFloat(timeEntry.minutes) / 60;
          }
        }

        setTotalTangibleHoursThisWeek(output.toFixed(2));
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
          <WeeklyCommitedHours
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
          <Label>Total Tangible Hours </Label>
        </Col>
        <Col md="6">
          <TotalTangibleHours
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setChanged={setChanged}
            // canEdit={canEdit}
            role={role}
          />
        </Col>
      </Row>

      {props?.userProfile?.categoryTangibleHrs.map((key) => (
            
            <React.Fragment key={'hours-by-category-' + key.category}>
              <Row>
                <Col md="6">
                  <Label>
                    {key.category !== 'Other' ? (
                      <>Total Tangible {capitalize(key.category)} Hours</>
                    ) : (
                      <>Total Unassigned Category Hours</>
                    )}{' '}
                  </Label>
                </Col>
                <Col md="6">
                    <Input
                      type="number"
                      id={`${key}Hours`}
                      value={key.hrs.toFixed(2)}
                      onChange={(e) => {
                        setUserProfile({
                          ...props.userProfile,
                          categoryTangibleHrs: {
                            ...props.userProfile.categoryTangibleHrs,
                            [key.hrs]: e.target.value,
                          },
                        });
                        props.setChanged(true);
                      }}
                      placeholder={`Total Tangible ${capitalize(key.category)} Hours`}
                      // invalid={!props.isUserAdmin}
                      canEdit={canEdit}
                    />
                </Col>
              </Row>
            </React.Fragment>
          ))}
        {/* : []} */}
    </div>
  );
};

export default ViewTab;
