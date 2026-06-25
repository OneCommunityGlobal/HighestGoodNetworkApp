import React, { useState , useEffect } from 'react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, connect } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Col, Row} from 'reactstrap';
import { updateInfoCollection, addInfoCollection } from '../../../actions/information'
import { boxStyle, boxStyleDark } from '~/styles';

import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';
import styles from './RoleInfoModal.module.css';

const RoleInfoModal = ({ info, auth, roleName}) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isOpen, setOpen] = useState(false);
  const [canEditInfoModal, setCanEditInfoModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Handle case where info doesn't exist in database
  const infoContent = info?.infoContent || 'Please input information!';
  const CanRead = info?.CanRead !== undefined ? info.CanRead : true; // Default to true if not specified
  
  const [infoContentModal, setInfoContentModal] = useState('');
  const dispatch = useDispatch();

  // XSS Protection: Sanitize HTML content
  const sanitizeHTML = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') return '';

    return DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'class'],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^https?:\/\//, // Only allow http/https URLs
    });
  };

  // XSS Protection: Sanitize text content
  const sanitizeText = (textContent) => {
    if (!textContent || typeof textContent !== 'string') return '';
    return DOMPurify.sanitize(textContent, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  };

  useEffect(() => {
    // Sanitize content when setting initial state
    setInfoContentModal(sanitizeHTML(infoContent));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infoContent]); // sanitizeHTML is stable, no need to include in deps

  const handleSaveSuccess = async () => {
    toast.success('✔ The info was saved successfully!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  };

  const handleSaveError = () => {
    toast.error('✘ The info could not be saved!', {
      pauseOnFocusLoss: false,
      autoClose: 3000,
    });
  };

  const handleMouseOver = () => {
    setOpen(true);

    if(auth?.user.role === "Owner"){
      setCanEditInfoModal(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (content) => {
    // Sanitize content from rich text editor
    const sanitizedContent = sanitizeHTML(content);
    setInfoContentModal(sanitizedContent);
  };

  const handleSave = async (e) => {
    setIsEditing(false);

    if (e) {
      e.preventDefault();
    }

    // Sanitize content before saving
    const sanitizedContent = sanitizeHTML(infoContentModal);
    const updateInfo = {infoContent: sanitizedContent};
    let saveResult;

    // If info doesn't exist in database, create new record
    if (!info || !info._id) {
      const newInfo = {
        infoName: sanitizeText(roleName) || 'UnknownRoleInfo',
        infoContent: sanitizedContent,
        visibility: '0'
      };
      saveResult = await dispatch(addInfoCollection(newInfo));
    } else {
      // Update existing record
      saveResult = await dispatch(updateInfoCollection(info._id, updateInfo));
    }
    
    setInfoContentModal(sanitizedContent);

    if (saveResult === 200 || saveResult === 201) {
      await handleSaveSuccess();
    } else {
      handleSaveError();
    }
  }

  if (CanRead) {
    return (
      <span>
         <i
           data-toggle="tooltip"
           data-placement="right"
           title="Click for user class information"
           style={{ fontSize: 24, cursor: 'pointer', color: '#00CCFF', marginLeft: '12px'}}
           aria-hidden="true"
           className="fa fa-info-circle"
           onClick={handleMouseOver}
         />
        {isOpen && (
          <Modal isOpen={isOpen} size="lg" className={darkMode ? 'text-light' : ''}>
            <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Welcome to Information Page!</ModalHeader>
            <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
              {canEditInfoModal && isEditing ?
                <RichTextEditor disabled={!isEditing} value={infoContentModal} onEditorChange={handleInputChange} darkMode={darkMode}/> :
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  className={`${styles['role-info-content']} ${darkMode ? styles['dark-mode'] : ''}`}
                  style={{ paddingLeft: '20px' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(infoContentModal) }}
                  onClick={() => setIsEditing(true)}
                />}
            </ModalBody>
            <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
              <Row className="no-gutters" style={{ gap: '10px', justifyContent: 'flex-end' }}>
                {canEditInfoModal && isEditing && (
                  <Col xs="auto">
                    <Button className="saveBtn" onClick={handleSave} style={darkMode ? boxStyleDark : boxStyle}>
                      Save
                    </Button>
                  </Col>
                )}
                <Col xs="auto">
                  <Button onClick={handleClose} style={darkMode ? boxStyleDark : boxStyle}>
                    Close
                  </Button>
                </Col>
              </Row>
            </ModalFooter>
          </Modal>
        )}
       </span>
    );
  }
  return <></>;
};

RoleInfoModal.propTypes = {
  info: PropTypes.object,
  auth: PropTypes.object,
  roleName: PropTypes.string,
  fetchError: PropTypes.any,
  updateInfoCollection: PropTypes.func.isRequired,
  addInfoCollection: PropTypes.func.isRequired,
};

const mapStateToProps = ({ infoCollections }) => ({
  loading: infoCollections?.loading,
  fetchError: infoCollections?.error,
  infoCollections: infoCollections?.infos,
});

const mapDispatchToProps = dispatch => {
  return {
    updateInfoCollection: (infoId, updatedInfo) => dispatch(updateInfoCollection(infoId, updatedInfo)),
    addInfoCollection: (newInfo) => dispatch(addInfoCollection(newInfo)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RoleInfoModal);
