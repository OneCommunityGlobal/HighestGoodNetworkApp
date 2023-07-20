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
import { getInfoCollections, addInfoCollection, updateInfoCollection} from '../../../actions/information';
import { getUserProfile } from '../../../actions/userProfile';

export class EditableInfoModal extends Component {
  state = {
    infoElements: [],
    fetchError: null,
    loading: true,
    editing:false,
    CanRead:false,
    CanEdit: false,
    infoName:'',
    infoContent:'',
  };
  
  async componentDidMount() {
    await this.props.getInfoCollections();
    const {currentUser, infoCollections} = this.props;
    let content = '';
    if (Array.isArray(infoCollections)) {
      infoCollections.forEach((index) => {
        if (index.infoName === this.props.areaName) {
          content = index.infoContent;
        }
      });
    }    

    this.setState({
      infoElements: [
        ...infoCollections],
      fetchError: this.props.fetchError,
      loading: this.props.loading,
      infoName: this.props.areaName,
      infoContent: content || '',
      CanRead: this.props.CanRead,
      CanEdit: this.props.CanEdit,
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.infoCollections !== prevState.infoElements) {
      return { infoElements: nextProps.infoCollections };
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
  }

  handleSaveError = () => {
    toast.error('✘ The info could not be saved!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  }
  handleInputChange = (content, editor) => {
    const infoContent = this.state.infoContent;
    this.setState({infoContent:content});
  }


  handleChangeInInfos =  () => {

    let newInfoElements = [...this.state.infoElements]
    let findIndex = false;
    let foundInfoId;
    newInfoElements.forEach((index) => {
      if (index.infoName === this.state.infoName) {
        index.infoContent=this.state.infoContent;
        findIndex = true;
        foundInfoId = index._id
      }
    });
    return {
      findIndex,
      infoId: foundInfoId
    };
  }
  
  
    // Updates user profile and weekly summaries 
  updateUserData = async () => {
      await this.props.getInfoCollections();
  }

  mainSaveHandler = async () => {
    const { findIndex: updatedInfo, infoId } = this.handleChangeInInfos();
    const newInfo = {
      infoName: this.state.infoName,
      infoContent: this.state.infoContent,
    }
    let saveResult;
    if (!updatedInfo) {
      saveResult = await this.props.addInfoCollection(newInfo);
    }else{
      saveResult = await this.props.updateInfoCollection(infoId, newInfo);
    }
    if (saveResult === 200 || saveResult === 201) {
      await this.handleSaveSuccess();
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
      infoContent,
      infoName,
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
          value={this.state.infoContent}
          onEditorChange={this.handleInputChange}
          />
        </ModalBody>
        <ModalFooter>
        <Button onClick={this.props.toggle}>Close</Button>
        {(this.state.CanEdit && !this.state.editing)&&
        (<Button onClick={this.handleEdit}>Edit</Button>)

        }
        {(this.state.CanEdit&&this.state.editing)&&
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
  getInfoCollections:PropTypes.func.isRequired,
  addInfoCollection:PropTypes.func.isRequired,
  updateInfoCollection:PropTypes.func.isRequired,
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
    getInfoCollections: ()=> dispatch(getInfoCollections()),
    updateInfoCollection: (infoId, updatedInfo)=>dispatch(updateInfoCollection(infoId, updatedInfo)),
    addInfoCollection: (newInfo)=>dispatch(addInfoCollection(newInfo)),
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModal);
