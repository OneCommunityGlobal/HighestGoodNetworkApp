import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
} from 'reactstrap';
import { connect } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { getInfos, updateInfos } from '../../actions/infoCollections';
import Loading from '../common/Loading';
import { getUserProfile } from '../../actions/userProfile';
import { components } from 'react-select';
// import { boxStyle } from 'styles';
export class EditableInfoModal extends Component{
  state = {
    infos: {
      areaName: '',
      areaContent: '',
    },
    role:'',
    editable: false,
  };
  
  async componentDidMount() {
    await this.props.getInfos(this.props.asUser|| this.props.currentUser.userid);
  };

  render(){

  return(
    <p>ok</p>
  )}};

  const mapStateToProps = ({ auth, weeklySummaries }) => ({
    currentUser: auth.user,
    summaries: weeklySummaries?.summaries,
    loading: weeklySummaries.loading,
    fetchError: weeklySummaries.fetchError,
  });
  
  const mapDispatchToProps = dispatch => {
    return {
      getInfos: getInfos,
      updateInfos: updateInfos,
      getInfos: userId => getInfos(userId)(dispatch),
      getUserProfile: userId => getUserProfile(userId)(dispatch),
    };
  };
  
  export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModal);
  