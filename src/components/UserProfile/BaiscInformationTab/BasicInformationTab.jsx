import React, { Component } from 'react';
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
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import ViewTab from './ViewTab';
import EditForm from './EditForm';

const BasicInformationTab = (props) => {
  const {
    userProfile,
    isUserAdmin,
    isUserSelf,
    handleUserProfile,
    formValid,
  } = props;

  const whichToRender = () => {
    if (isUserAdmin || isUserSelf) {
      return (
        <EditForm
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      );
    }
    return (
      <ViewTab
        userProfile={userProfile}
        isUserAdmin={isUserAdmin}
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
      />
    );
  };
  return (
    <div>
      {whichToRender()}
    </div>
  );
};
export default BasicInformationTab;
