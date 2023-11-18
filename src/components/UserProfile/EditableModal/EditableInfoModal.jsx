import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Col,
 } from 'reactstrap';
 import Select from 'react-select'
 import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { getInfoCollections, addInfoCollection, updateInfoCollection, deleteInfoCollectionById} from '../../../actions/information';
import styles from './EditableInfoModal.css';
import { boxStyle } from 'styles';

// New RichTextEditor component
const RichTextEditor = ({ disabled, value, onEditorChange }) => (
  <Editor
    init={{
      menubar: false,
      placeholder: 'Please input infos',
      plugins: 'advlist autolink autoresize lists link charmap table paste help wordcount',
      toolbar: 'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
      branding: false,
      min_height: 180,
      max_height: 500,
      autoresize_bottom_margin: 1,
    }}
    disabled={disabled}
    value={value}
    onEditorChange={onEditorChange}
  />
);

const options = [
  { value: '0', label: 'All (default)' },
  { value: '1', label: 'Admin + Owner User Classes Only' },
  { value: '2', label: 'Everyone But Volunteer Class' }
]

export class EditableInfoModal extends Component {
  state = {
    editableModalOpen:false,
    infoElements: [],
    fetchError: null,
    loading: true,
    editing: false,
    CanRead: false,
    CanEdit: false,
    infoName:'',
    infoContent:'',
    visibility: '',
    fontSize: 24,
  };
  
  
  async componentDidMount() {
    await this.props.getInfoCollections();
    const {infoCollections, role, areaTitle, areaName, fontSize, isPermissionPage} = this.props;

    let content = '';
    let visible = '0';
    if (Array.isArray(infoCollections)) {
      infoCollections.forEach((info) => {
        if (info.infoName === areaName) {
          content = info.infoContent;
          visible = info.visibility;
        }
      });
    } 
    
    content = content.replace(/<ul>/g, "<ul class='custom-ul'>");
    let CanRead = (visible === '0') || 
                    (visible === '1' && (role ==='Owner' || role ==='Administrator')) ||
                    (visible === '2' && (role !== 'Volunteer'));
    let CanEdit = role === 'Owner';
    this.setState({
      infoElements: Array.isArray(infoCollections) ? [...infoCollections] : [],
      fetchError: this.props.fetchError,
      loading: this.props.loading,
      infoName: areaName,
      infoContent: content || 'Please input information!',
      visibility: visible,
      CanRead,
      CanEdit,
      fontSize: fontSize,
      isPermissionPage,
    });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.infoCollections !== prevState.infoElements) {
      return { infoElements: nextProps.infoCollections };
    } else {
      return null;
    }
  }

  toggleEditableModal = () => {
    this.setState({editableModalOpen: false});
  }

  handleEdit = (edit) => {
    if(this.state.CanEdit){
      this.setState({editing:edit});
    }
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

    newInfoElements = newInfoElements.map((index) => {
      if (index.infoName === this.state.infoName) {
        findIndex = true;
        foundInfoId = index._id;
        return { ...index, infoContent: this.state.infoContent };
      }
      return index;
    });

    this.setState({ infoElements: newInfoElements });

    return {
      findIndex,
      infoId: foundInfoId,
    };
  }
  
  handleSelectChange = (selectedOption) => {
    this.setState({visibility:selectedOption.value});
  };
  
  
    // Updates user profile and weekly summaries 
  updateUserData = async () => {
    try {
      await this.props.getInfoCollections();
    } catch (error) {
      console.error(error);
      // Handle error appropriately here
    }
  }

  mainSaveHandler = async () => {
    const { findIndex: updatedInfo, infoId } = this.handleChangeInInfos();
    const newInfo = {
      infoName: this.state.infoName,
      infoContent: this.state.infoContent,
      visibility: this.state.visibility,
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
  handleDelete = async () => {
    const { infoId } = this.handleChangeInInfos();
    const deleteResult = await this.props.deleteInfoCollectionById(infoId);
  };

  handleClose = () => {
    this.toggleEditableModal();
    this.handleEdit(false);

  }
  

  handleSave = async event => {
    this.handleEdit(false);
    if (event) {
      event.preventDefault();
    }
    await this.mainSaveHandler();
  };
  render() {
    const { 
      infoContent,
      editableModalOpen,
      fontSize,
      CanRead,
      CanEdit,
      isPermissionPage,
     } = this.state;

    return (
    (CanRead)&&(
      <div>
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for information about this"
          style={{ fontSize: fontSize, cursor: 'pointer', color: '#00CCFF', marginRight: '10px'}}
          aria-hidden="true"
          className="fa fa-info-circle"
          onClick={()=>this.setState({editableModalOpen: true})}
        />
        {editableModalOpen && (
          <Modal isOpen={editableModalOpen} toggle={this.toggleEditableModal} size="lg">
          <ModalHeader>Welcome to the {this.props.areaTitle} Information Page!</ModalHeader>
          <ModalBody>
          {this.state.editing
                ? <RichTextEditor
                    disabled={!this.state.editing}
                    value={infoContent}
                    onEditorChange={this.handleInputChange}
                  />
                : <div 
                style={{ paddingLeft: '20px' }} 
                dangerouslySetInnerHTML={{ __html: infoContent }}
                onClick={() => this.handleEdit(true)} />
              }
          {isPermissionPage && CanEdit&&
            (
              <div style={{ paddingLeft: '20px' }}> 
                <p>Click above to edit this content. (Note: Only works on Permissions Management Page)</p>
              </div>
              
            )
          }
          </ModalBody>
          <ModalFooter>
          <Row>
            <Col md={{ size: 5, offset:4}}>
            {(this.state.editing)&&
            (
                <Select 
                  options={options} 
                  onChange={this.handleSelectChange}
                  value={options.find(option => option.value === this.state.visibility)} 
                  />
            )
            }
             </Col>
            {(CanEdit&&this.state.editing)&&
            (
              <Col md={{ size: 1}} style={{paddingLeft:'5px'}}>
                <Button
                  className='saveBtn' 
                  onClick={this.handleSave}
                  style={boxStyle}>Save</Button>
              </Col>)
            }
          <Col 
            md={{ size: 1}}
            >
            <Button onClick={this.handleClose} style={boxStyle}>Close</Button>
          </Col>
          </Row>
          </ModalFooter>
          </Modal>
        )}
    </div>)   
    )
    };
  }

EditableInfoModal.propTypes = {
  fetchError: PropTypes.any,
  getInfoCollections:PropTypes.func.isRequired,
  addInfoCollection:PropTypes.func.isRequired,
  updateInfoCollection:PropTypes.func.isRequired,
  deleteInfoCollectionById: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,

};

  
const mapStateToProps = ({infoCollections }) => ({
  loading: infoCollections?.loading,
  fetchError: infoCollections?.error,
  infoCollections: infoCollections?.infos,
});
  
const mapDispatchToProps = dispatch => {
  return {
    getInfoCollections: () => dispatch(getInfoCollections()),
    updateInfoCollection: (infoId, updatedInfo) => dispatch(updateInfoCollection(infoId, updatedInfo)),
    addInfoCollection: (newInfo) => dispatch(addInfoCollection(newInfo)),
    deleteInfoCollectionById: (infoId) => dispatch(deleteInfoCollectionById(infoId)), 
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModal);
