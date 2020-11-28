import React from 'react';
import {
  Row,
  Label,
  Input,
  CardTitle,
  Col,
  Container,
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Badge,
  Collapse,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import moment from 'moment';

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
      placeholder="weeklyComittedHours"
      invalid={!props.isUserAdmin}
    />
  );
};

const TotalCommittedHours = (props) => {
  if (!props.isUserAdmin) {
    return <p>{props.userProfile.totalComittedHours}</p>;
  }
  return (
    <Input
      type="number"
      name="totalComittedHours"
      id="totalComittedHours"
      value={props.userProfile.totalComittedHours}
      onChange={props.handleUserProfile}
      placeholder="TotalComittedHours"
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
  const canEdit = isUserAdmin || isUserSelf;

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
          <p>N/A</p>
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
          <Label>Weekly Commited Hours </Label>
        </Col>
        <Col md="6">
          <WeeklyCommitedHours isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Hours </Label>
        </Col>

        <Col md="6">
          <TotalCommittedHours isUserAdmin={isUserAdmin} userProfile={userProfile} handleUserProfile={handleUserProfile} />
        </Col>
      </Row>
    </div>
  );
};

export default ViewTab;
