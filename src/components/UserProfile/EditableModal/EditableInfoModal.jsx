import React, { Component } from 'react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import {
  getInfoCollections,
  addInfoCollection,
  updateInfoCollection,
  deleteInfoCollectionById,
} from '../../../actions/information';
import { boxStyle, boxStyleDark } from '~/styles';
import RichTextEditor from './RichTextEditor';
import styles from './EditableInfoModal.module.css';

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
    visibility: '0',
    fontSize: 24,
    isPermissionPage: false,
  };

  _isMounted = false;

  // Sanitize HTML content to prevent XSS attacks
  sanitizeHTML = htmlContent => {
    if (!htmlContent || typeof htmlContent !== 'string') return '';

    return DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'a',
        'span',
        'div',
      ],
      ALLOWED_ATTR: ['href', 'class'], // Removed 'style' to prevent CSS injection
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^https?:\/\//, // Only allow http/https URLs
    });
  };

  // Sanitize text content to prevent XSS in props
  sanitizeText = textContent => {
    if (!textContent || typeof textContent !== 'string') return '';
    return DOMPurify.sanitize(textContent, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  // ✅ Centralized: derive modal state from collections + props
  deriveFromCollections = infoCollections => {
    const { role, areaName, fontSize, isPermissionPage } = this.props;

    let content = '';
    let visible = '0';

    if (Array.isArray(infoCollections)) {
      infoCollections.forEach(info => {
        if (info.infoName === areaName) {
          content = this.sanitizeHTML(info.infoContent);
          visible = info.visibility ?? '0';
        }
      });
    }

    // Safely add custom class to ul elements WITHIN the sanitized content
    content = this.sanitizeHTML(content.replace(/<ul>/g, "<ul class='custom-ul'>"));

    const CanRead =
      visible === '0' ||
      (visible === '1' && (role === 'Owner' || role === 'Administrator')) ||
      (visible === '2' && role !== 'Volunteer');

    const CanEdit = role === 'Owner';

    return {
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
    };
  };

  async componentDidMount() {
    this._isMounted = true;

    // Fire fetch; do NOT assume await means props have data (depends on thunk impl)
    this.props.getInfoCollections();

    // Initialize from whatever we currently have (maybe empty)
    if (this._isMounted) {
      this.setState(this.deriveFromCollections(this.props.infoCollections));
    }
  }

  componentDidUpdate(prevProps) {
    // ✅ When collections arrive/update, recompute content/visibility/permissions
    if (prevProps.infoCollections !== this.props.infoCollections) {
      this.setState(this.deriveFromCollections(this.props.infoCollections));
    }

    // ✅ Also recompute if role changes (auth may load async on refresh)
    if (prevProps.role !== this.props.role) {
      this.setState(this.deriveFromCollections(this.props.infoCollections));
    }

    // ✅ Recompute if the areaName changes (same component reused for different page)
    if (prevProps.areaName !== this.props.areaName) {
      this.setState(this.deriveFromCollections(this.props.infoCollections));
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
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

  handleInputChange = content => {
    const sanitizedContent = this.sanitizeHTML(content);
    this.setState({ infoContent: sanitizedContent });
  };

  handleChangeInInfos = () => {
    const { infoElements, infoName, infoContent, visibility } = this.state;
  
    let findIndex = false;
    let foundInfoId;
  
    const newInfoElements = (infoElements || []).map(info => {
      if (info.infoName === infoName) {
        findIndex = true;
        foundInfoId = info._id;
        return { ...info, infoContent, visibility };
      }
      return info;
    });
  
    this.setState({ infoElements: newInfoElements });
  
    return { findIndex, infoId: foundInfoId };
  };

  handleSelectChange = selectedOption => {
    this.setState({ visibility: selectedOption.value });
  };

  // Updates user profile and weekly summaries
  updateUserData = async () => {
    try {
      await this.props.getInfoCollections();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  mainSaveHandler = async () => {
    const { findIndex: updatedInfo, infoId } = this.handleChangeInInfos();

    const newInfo = {
      infoName: this.sanitizeText(this.state.infoName),
      infoContent: this.sanitizeHTML(this.state.infoContent),
      visibility: this.sanitizeText(this.state.visibility),
    };

    let saveResult;
    if (!updatedInfo) {
      saveResult = await this.props.addInfoCollection(newInfo);
    } else {
      saveResult = await this.props.updateInfoCollection(infoId, newInfo);
    }

    if (saveResult === 200 || saveResult === 201) {
      await this.handleSaveSuccess();
      // ✅ Refresh collections so UI is always in sync
      this.props.getInfoCollections();
    } else {
      this.handleSaveError();
    }
  };

  handleDelete = async () => {
    const { infoId } = this.handleChangeInInfos();
    await this.props.deleteInfoCollectionById(infoId);
    // Refresh collections after delete
    this.props.getInfoCollections();
  };

  handleClose = () => {
    this.toggleEditableModal();
    this.handleEdit(false);
  };

  handleSave = async event => {
    this.handleEdit(false);
    if (event) event.preventDefault();
    await this.mainSaveHandler();
  };

  render() {
    const { infoContent, editableModalOpen, fontSize, CanRead, CanEdit } = this.state;
    const { darkMode } = this.props;

    const sanitizedContent = infoContent;

    return (
      CanRead && (
        <div>
          <i
            data-toggle="tooltip"
            data-placement="right"
            title="Click for information about this"
            style={{ fontSize: fontSize, cursor: 'pointer', color: '#00CCFF', marginRight: '8px' }}
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
              <ModalHeader className={`d-flex justify-content-center ${darkMode ? 'bg-space-cadet' : ''}`}>
                Welcome to the {this.sanitizeText(this.props.areaTitle)} Information Page!
              </ModalHeader>

              <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ padding: '20px 40px' }}>
                {this.state.editing ? (
                  <RichTextEditor
                    disabled={!this.state.editing}
                    value={infoContent}
                    onEditorChange={this.handleInputChange}
                    darkMode={darkMode}
                  />
                ) : (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                  <div
                    className={darkMode ? `${styles.infoModalContent} ${styles.forceWhiteText}` : ''}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    onClick={() => this.handleEdit(true)}
                  />
                )}
              </ModalBody>

              <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  {this.state.editing && (
                    <div style={{ minWidth: 260 }}>
                      <div style={{ marginBottom: 6, fontWeight: 600, lineHeight: 1.2 }}>
                        Who can view this information?
                      </div>
                      <Select
                        options={options}
                        onChange={this.handleSelectChange}
                        value={options.find(option => option.value === this.state.visibility)}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {CanEdit && this.state.editing && (
                      <Button
                        className="saveBtn"
                        onClick={this.handleSave}
                        color="primary"
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        Save
                      </Button>
                    )}

                    <Button onClick={this.handleClose} color="danger" style={darkMode ? boxStyleDark : boxStyle}>
                      Close
                    </Button>
                  </div>
                </div>
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
  loading: PropTypes.bool,
  infoCollections: PropTypes.array,
  role: PropTypes.string,
  areaTitle: PropTypes.string,
  areaName: PropTypes.string,
  fontSize: PropTypes.number,
  isPermissionPage: PropTypes.bool,
  darkMode: PropTypes.bool,
};

EditableInfoModal.defaultProps = {
  loading: false,
  infoCollections: [],
  role: '',
  areaTitle: '',
  areaName: '',
  fontSize: 24,
  isPermissionPage: false,
  darkMode: false,
};

const mapStateToProps = ({ infoCollections }) => ({
  loading: infoCollections?.loading,
  fetchError: infoCollections?.error,
  infoCollections: infoCollections?.infos,
});

const mapDispatchToProps = dispatch => ({
  getInfoCollections: () => dispatch(getInfoCollections()),
  updateInfoCollection: (infoId, updatedInfo) => dispatch(updateInfoCollection(infoId, updatedInfo)),
  addInfoCollection: newInfo => dispatch(addInfoCollection(newInfo)),
  deleteInfoCollectionById: infoId => dispatch(deleteInfoCollectionById(infoId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModal);