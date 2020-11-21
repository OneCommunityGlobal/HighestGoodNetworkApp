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

const ViewTab = (props) => {
  const {
    userProfile,
    timeEntries,
  } = props;
  const weeklyHoursReducer = (acc, val) => acc + (parseInt(val.hours, 10) + parseInt(val.minutes, 10) / 60);
  return (
    <div>
      <Row>
        <Col md="6">
          <Label>Start Date</Label>
        </Col>
        <Col md="6">
          <p>{moment(userProfile.createdDate).format('YYYY-MM-DD')}</p>
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
          <p>{timeEntries.weeks[0].reduce(weeklyHoursReducer, 0)}</p>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Weekly Commited Hours </Label>
        </Col>
        <Col md="6">
          <p>{userProfile.weeklyComittedHours}</p>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Total Hours </Label>
        </Col>
        <Col md="6">
          <p>{userProfile.totalComittedHours}</p>
        </Col>
      </Row>
    </div>
  );
};

export default ViewTab;
