import React, {useEffect, useState} from 'react';
import {
  Row,
  Label,
  Input,
  Col,
} from 'reactstrap';
import moment from 'moment';
import style from '../UserProfileEdit/ToggleSwitch/ToggleSwitch.module.scss'

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
      onChange={props.handleUserProfile}
      placeholder="Start Date"
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
      value={props.userProfile.weeklyComittedHours}
      onChange={props.handleUserProfile}
      placeholder="weeklyCommittedHours"
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
      onChange={props.handleUserProfile}
      placeholder="Total Tangible Time Logged"
      invalid={!props.isUserAdmin}
    />
  );
};

const WeeklySummaryReqd = (props) => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.weeklySummaryNotReq ? "Not Required" : "Required"}</p>;
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
  );
};




const TotalCategoryHours = (props) => {
  let catHrs = props.userProfile.categoryTangibleHrs;
  if (!catHrs) {
    props.handleUserProfile({target: {id: `total${props.category}CategoryHours`, value: 0}});
    return(<></>);
  } 
  let [index, setIndex] = useState( function () {

    for (let i = 0; i <catHrs.length; i++) {
      if (catHrs[i].category === props.category) {
        return i;
      }
    }
    return -1;
  }());
  let [isFirstTime, setIsFirstTime] = useState(true);

  
  useEffect(()=>{

    catHrs = props.userProfile.categoryTangibleHrs;

    for (let i = 0; i <catHrs?.length; i++) {
      if (catHrs[i].category === props.category) {
        index=i;
        setIndex(i);
      }
    }
    if (index == -1 && isFirstTime) {
      props.handleUserProfile({target: {id: `total${props.category}CategoryHours`, value: 0}})
    }
    setIsFirstTime(false);
  }, [props.userProfile] )

  if (index == -1) {
    return(<></>);
  }

  if (!props.isUserAdmin) {
    return <p>{catHrs && catHrs[index] ? catHrs[index]?.hrs || 0 : 0}</p>;
  }

  return (
    <Input
      type="number"
      name={`total${props.category}CategoryHours`}
      id={`${props.category}CategoryHours`}
      value={props?.userProfile?.categoryTangibleHrs[index]?.hrs}
      onChange={props.handleUserProfile}
      placeholder={`Total ${props.category} Tangible Hours`}
      invalid={!props.isUserAdmin}
    />
  );
};

const ViewTab = (props) => {
  const {
    userProfile,
    timeEntries,
    isUserAdmin,
    isUserSelf,
    handleUserProfile,
  } = props;
  const weeklyHoursReducer = (acc, val) => acc + (parseInt(val.hours, 10) + parseInt(val.minutes, 10) / 60);
  //const canEdit = isUserAdmin || isUserSelf;

  return (
    <div data-testid="volunteering-time-tab">
      <Row>
        <Col md="6">
          <Label>Start Date</Label>
        </Col>
        <Col md="6">
          <StartDate isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
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
          <WeeklyCommitedHours isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Tangible Hours </Label>
        </Col>

        <Col md="6">
          <TotalCommittedHours isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Food Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Food" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <Label>Total Energy Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Energy" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Housing Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Housing" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Education Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Education" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Society Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Society" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Economics Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Economics" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Stewardship Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Stewardship" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Other Category Hours </Label>
        </Col>

        <Col md="6">
          <TotalCategoryHours category="Other" isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
    </div>
  );
};

export default ViewTab;
