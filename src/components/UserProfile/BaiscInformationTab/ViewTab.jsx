import React from 'react';
import {
  Row,
  Label,
  Input,
  Badge,
  Col,
  Container,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';

const ViewTab = (props) => {
  const {
    userProfile,
  } = props;
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    privacySettings,
  } = userProfile;
  const formatPhoneNumber = (str) => {
    // Filter only numbers from the input
    const cleaned = `${str}`.replace(/\D/g, '');
    if (cleaned.length == 10) {
      // Domestic (USA)
      return [
        '( ',
        cleaned.substring(0, 3),
        ' ) ',
        cleaned.substring(3, 6),
        ' - ',
        cleaned.substring(6, 10),
      ].join('');
    }
    if (cleaned.length == 11) {
      // International
      return [
        '+',
        cleaned.substring(0, 1),
        '( ',
        cleaned.substring(1, 4),
        ' ) ',
        cleaned.substring(4, 7),
        ' - ',
        cleaned.substring(7, 11),
      ].join('');
    }
    // Unconventional
    return str;
  };
  return (
    <div>
      <Row>
        <Col md="6">
          <Label>Name</Label>
        </Col>
        <Col md="6">
          <p>{`${firstName} ${lastName}`}</p>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Label>Prefered Title</Label>
        </Col>
        <Col md="6">
          <p>Admin</p>
        </Col>
      </Row>
      {privacySettings.email && (
      <Row>
        <Col md="6">
          <Label>Email</Label>
        </Col>
        <Col md="6">
          <p>{email}</p>
        </Col>
      </Row>
      )}
      {privacySettings.phoneNumber && (
      <Row>
        <Col md="6">
          <Label>Phone</Label>
        </Col>
        <Col md="6">
          <p>{formatPhoneNumber(phoneNumber)}</p>
        </Col>
      </Row>
      )}
      <Row>
        <Col md="6">
          <Label>Bio</Label>
        </Col>
        <Col md="6">
          <p>N/A</p>
        </Col>
      </Row>

    </div>
  );
};

export default ViewTab;
