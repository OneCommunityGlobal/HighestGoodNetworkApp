import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
import {
  getInfoCollections,
  addInfoCollection,
  updateInfoCollection,
  deleteInfoCollectionById,
} from '../../../actions/information';
import RichTextEditor from './RichTextEditor';

const options = [
  { value: '0', label: 'All (default)' },
  { value: '1', label: 'Admin + Owner User Classes Only' },
  { value: '2', label: 'Everyone But Volunteer Class' },
];

export class EditableInfoModal extends Component {
  state = {
    editableModalOpen: false,
    infoElements: [],
    fetchError: null,
    loading: true,
    editing: false,
    CanRead: false,
    CanEdit: false,
    infoName: '',
    infoContent: '',
    visibility: '',
    fontSize: 24,
  };

  _isMounted = false;

  async componentDidMount() {
    this._isMounted = true;
    await this.props.getInfoCollections();
    const { infoCollections, role, areaTitle, areaName, fontSize, isPermissionPage } = this.props;

    let content = '';
    let visible = '0';

    if (Array.isArray(infoCollections)) {
      infoCollections.forEach(info => {
        if (info.infoName === areaName) {
          content = info.infoContent;
          visible = info.visibility;
        }
      });
    }

    content = content.replace(/<ul>/g, "<ul class='custom-ul'>");
    const CanRead =
      visible === '0' ||
      (visible === '1' && (role === 'Owner' || role === 'Administrator')) ||
      (visible === '2' && role !== 'Volunteer');
    const CanEdit = role === 'Owner';

    if (this._isMounted) {
      this.setState({
        infoElements: Array.isArray(infoCollections) ? [...infoCollections] : [],
        fetchError: this.props.fetchError,
        loading: this.props.loading,
        infoName: areaName,
        infoContent: content || 'Please input information!',
        visibility: visible,
        CanRead,
        CanEdit,
        fontSize,
        isPermissionPage,
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.infoCollections !== prevState.infoElements) {
      return { infoElements: nextProps.infoCollections };
    }
    return null;
  }

  toggleEditableModal = () => {
    this.setState({ editableModalOpen: false });
  };

  handleEdit = edit => {
    if (this.state.CanEdit) {
      this.setState({ editing: edit });
    }
  };

  handleSaveSuccess = async () => {
    toast.success('✔ The info was saved successfully!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  };

  handleSaveError = () => {
    toast.error('✘ The info could not be saved!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  };

  handleInputChange = (content, editor) => {
    const { infoContent } = this.state;
    this.setState({ infoContent: content });
  };

  handleChangeInInfos = () => {
    let newInfoElements = [...this.state.infoElements];
    let findIndex = false;
    let foundInfoId;

    newInfoElements = newInfoElements.map(index => {
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
  };

  handleSelectChange = selectedOption => {
    this.setState({ visibility: selectedOption.value });
  };

  // Updates user profile and weekly summaries
  updateUserData = async () => {
    try {
      await this.props.getInfoCollections();
    } catch (error) {
      console.error(error);
      // Handle error appropriately here
    }
  };

  mainSaveHandler = async () => {
    const { findIndex: updatedInfo, infoId } = this.handleChangeInInfos();
    const newInfo = {
      infoName: this.state.infoName,
      infoContent: this.state.infoContent,
      visibility: this.state.visibility,
    };
    let saveResult;
    if (!updatedInfo) {
      saveResult = await this.props.addInfoCollection(newInfo);
    } else {
      saveResult = await this.props.updateInfoCollection(infoId, newInfo);
    }
    if (saveResult === 200 || saveResult === 201) {
      await this.handleSaveSuccess();
    } else {
      this.handleSaveError();
    }
  };

  handleDelete = async () => {
    const { infoId } = this.handleChangeInInfos();
    const deleteResult = await this.props.deleteInfoCollectionById(infoId);
  };

  handleClose = () => {
    this.toggleEditableModal();
    this.handleEdit(false);
  };

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

    const { darkMode } = this.props;
    return (
      CanRead && (
        <div>
          <i
            data-toggle="tooltip"
            data-placement="right"
            title="Click for information about this"
            style={{ fontSize, cursor: 'pointer', color: '#00CCFF', marginRight: '8px' }}
            aria-hidden="true"
            className="fa fa-info-circle"
            onClick={() => this.setState({ editableModalOpen: true })}
          />
          {editableModalOpen && (
            <Modal
              isOpen={editableModalOpen}
              toggle={this.toggleEditableModal}
              size="lg"
              className={darkMode ? 'text-light' : ''}
            >
              <ModalHeader
                className={`d-flex justify-content-center ${darkMode ? 'bg-space-cadet' : ''}`}
              >
                Welcome to the {this.props.areaTitle} Information Page!
              </ModalHeader>
              <ModalBody
                className={`${darkMode ? 'bg-yinmn-blue' : ''} text-center`}
                style={{ padding: '20px 40px' }}
              >
                {this.state.editing ? (
                  <RichTextEditor
                    disabled={!this.state.editing}
                    value={infoContent}
                    onEditorChange={this.handleInputChange}
                  />
                ) : (
                  <div
                    style={{ paddingLeft: '20px' }}
                    dangerouslySetInnerHTML={{ __html: infoContent }}
                    onClick={() => this.handleEdit(true)}
                  />
                )}
              </ModalBody>
              <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                <Row className="no-gutters">
                  {this.state.editing && (
                    <Col md={6} style={{ paddingRight: '2px' }}>
                      <Select
                        options={options}
                        onChange={this.handleSelectChange}
                        value={options.find(option => option.value === this.state.visibility)}
                      />
                    </Col>
                  )}

                  {CanEdit && this.state.editing && (
                    <Col md={3} style={{ paddingLeft: '4px' }}>
                      <Button
                        className="saveBtn"
                        onClick={this.handleSave}
                        color="primary"
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        Save
                      </Button>
                    </Col>
                  )}
                  <Col md={3} className="d-flex justify-content-center">
                    <Button
                      onClick={this.handleClose}
                      color="danger"
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      Close
                    </Button>
                  </Col>
                </Row>
              </ModalFooter>
            </Modal>
          )}
        </div>
      )
    );
  }
}

EditableInfoModal.propTypes = {
  fetchError: PropTypes.any,
  getInfoCollections: PropTypes.func.isRequired,
  addInfoCollection: PropTypes.func.isRequired,
  updateInfoCollection: PropTypes.func.isRequired,
  deleteInfoCollectionById: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = ({ infoCollections }) => ({
  loading: infoCollections?.loading,
  fetchError: infoCollections?.error,
  infoCollections: infoCollections?.infos,
});

const mapDispatchToProps = dispatch => {
  return {
    getInfoCollections: () => dispatch(getInfoCollections()),
    updateInfoCollection: (infoId, updatedInfo) =>
      dispatch(updateInfoCollection(infoId, updatedInfo)),
    addInfoCollection: newInfo => dispatch(addInfoCollection(newInfo)),
    deleteInfoCollectionById: infoId => dispatch(deleteInfoCollectionById(infoId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModal);
