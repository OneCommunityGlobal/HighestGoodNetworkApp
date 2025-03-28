
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, connect } from 'react-redux';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Col, Row} from 'reactstrap';
import { updateInfoCollection } from '../../../actions/information'
import { boxStyle, boxStyleDark } from 'styles';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

const RoleInfoModal = ({ info, auth}) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isOpen, setOpen] = useState(false);
  const [canEditInfoModal, setCanEditInfoModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { infoContent, CanRead } = { ...info };
  const [infoContentModal, setInfoContentModal] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    setInfoContentModal(infoContent);
  }, [infoContent]);

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
    setInfoContentModal(content);
  };

  const handleSave = async (e) => {
    setIsEditing(false);

    if (e) {
      e.preventDefault();
    }

    const updateInfo = {infoContent: infoContentModal}

    let saveResult = await dispatch(updateInfoCollection(info._id, updateInfo));
    setInfoContentModal(infoContentModal);

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
                <div
                  style={{ paddingLeft: '20px' }}
                  dangerouslySetInnerHTML={{ __html: infoContentModal }}
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
  fetchError: PropTypes.any,
  updateInfoCollection: PropTypes.func.isRequired,
};

const mapStateToProps = ({ infoCollections }) => ({
  loading: infoCollections?.loading,
  fetchError: infoCollections?.error,
  infoCollections: infoCollections?.infos,
});

const mapDispatchToProps = dispatch => {
  return {
    updateInfoCollection: (infoId, updatedInfo) => dispatch(updateInfoCollection(infoId, updatedInfo)),
  };
};

export default connect(mapDispatchToProps, mapStateToProps)(RoleInfoModal);
