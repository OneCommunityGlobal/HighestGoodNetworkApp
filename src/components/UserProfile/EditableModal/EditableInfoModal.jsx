import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
 } from 'reactstrap';
 import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getInfos, updateInfos} from '../../../actions/infoCollections';
import { getUserProfile } from '../../../actions/userProfile';
// import { updateAllUserProfilesInfoCollections } from '../../../actions/userManagement';

export class EditableInfoModal extends Component {
  state = {
    infoElements: [],
    fetchError: null,
    loading: true,
    editing:false,
    role: '',
    areaName:'',
    areaContent:'',
  };
  
  async componentDidMount() {
    await this.props.getInfos(this.props.asUser || this.props.currentUser.userid);
    const {currentUser, infos } = this.props;
    let content ='';
    infos.forEach((index) => {
      if (index.areaName === this.props.areaName) {
        content = index.areaContent;
      }
    });
    this.setState({
      infoElements: {
        ...infos
      },
      fetchError: this.props.fetchError,
      loading: this.props.loading,
      areaName: this.props.areaName,
      areaContent: content || '',
      role: currentUser.role,
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.infos !== prevState.infoElements) {
      return { infoElements: nextProps.infos };
    } else {
      return null;
    }
  }
  handleEdit = () => {
    const edit = this.state.editing;
    this.setState({editing:!edit});
  }

  handleSaveSuccess = async () => {
    toast.success('✔ The info was saved successfully!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
    await this.updateUserData(this.props.currentUser.userid);
  }

  handleSaveError = () => {
    toast.error('✘ The info could not be saved!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  }
  handleInputChange = (content, editor) => {
    const areaContent = this.state.areaContent;
    this.setState({areaContent:content});
  }


  handleChangeInInfos = () => {
    const newObject = {
      areaName: this.state.areaName,
      areaContent: this.state.areaContent,
    }
    let newInfoElements = this.state.infoElements ? Object.values(this.state.infoElements) : [];
    let findIndex = -1;
    newInfoElements.forEach((index) => {
      if (index.areaName === this.state.areaName) {
        index.areaContent=this.state.areaContent;
        findIndex = 0;
      }
    });
    if(findIndex!==-1){
      return newInfoElements;
    }else{
      newInfoElements = [
        ...newInfoElements,
        newObject,
      ];
    }  
    return newInfoElements;
  }
  
    // Updates user profile and weekly summaries 
  updateUserData = async userId => {
      await this.props.getUserProfile(userId);
      await this.props.getInfos(userId);
  }

  mainSaveHandler = async () => {
    const updatedInfos = this.handleChangeInInfos();
    let saveResult;
    if (updatedInfos) {
      saveResult = await this.props.updateInfos(this.props.currentUser.userid, { infoCollections: updatedInfos });
    }
    if (saveResult === 200) {
      await this.handleSaveSuccess();
      this.props.updateAllUserProfilesInfoCollections(updatedInfos);
    } else {
      this.handleSaveError();
    }
  }

  handleSave = async event => {
    if (event) {
      event.preventDefault();
    }
    await this.mainSaveHandler();
  };

  render() {
    const { 
      loading,
      fetchError,
      infoElements,
      areaContent,
      areaName,
     } = this.state;
    return (
        <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="lg">
        <ModalHeader>Welcome to Information Page!</ModalHeader>
        <ModalBody>
        <Editor
        init={{
          menubar: false,
          placeholder:
          'Please input infos',
          plugins:
          'advlist autolink autoresize lists link charmap table paste help wordcount',
          toolbar:
          'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
          branding: false,
          min_height: 180,
          max_height: 500,
          autoresize_bottom_margin: 1,
          }}
          disabled={!this.state.editing}
          value={this.state.areaContent}
          onEditorChange={this.handleInputChange}
          />
        </ModalBody>
        <ModalFooter>
        <Button onClick={this.props.toggle}>Close</Button>
        {(this.state.role==='Owner' && !this.state.editing)&&
        (<Button onClick={this.handleEdit}>Edit</Button>)

        }
        {(this.state.role==='Owner' &&this.state.editing)&&
        (<Button onClick={this.handleSave}>Save</Button>)
        }
        </ModalFooter>
        </Modal>
        );

    };
  }

EditableInfoModal.propTypes = {
  currentUser: PropTypes.shape({
    userid: PropTypes.string.isRequired,
  }).isRequired,
  fetchError: PropTypes.any,
  getInfos: PropTypes.func.isRequired,
  updateInfos: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

  
const mapStateToProps = ({ auth, infoCollections }) => ({
  currentUser: auth.user,
  loading: infoCollections.loading,
  fetchError: infoCollections.error,
  infoCollections: infoCollections.infos,
});
  
const mapDispatchToProps = dispatch => {
  return {
    updateInfos: (userId, infos) => dispatch(updateInfos(userId, infos)),
    getInfos: userId => dispatch(getInfos(userId)),
    getUserProfile: userId => dispatch(getUserProfile(userId)),
    updateAllUserProfilesInfoCollections: (infoCollections) => dispatch(updateAllUserProfilesInfoCollections(infoCollections)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModal);
