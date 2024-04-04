import React, { useState, useEffect  } from 'react';
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
import { connect, useDispatch } from 'react-redux';
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

/**
 * New version of the EditableInfoModal. Replace the legacy class component with a functional component wrapped in React.memo.
 */
export const EditableInfoModalWithMemo = React.memo(({ 
  infoCollections,
  role,
  areaTitle,
  areaName,
  fontSize = 24,
  isPermissionPage,
  getInfoCollections,
  updateInfoCollection,
  addInfoCollection,
  deleteInfoCollectionById,
  fetchError,
  loading,
}) => {
  const [editableModalOpen, setEditableModalOpen] = useState(false);
  const [infoElements, setInfoElements] = useState([]);

  const [editing, setEditing] = useState(false);
  const [canRead, setCanRead] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [infoName, setInfoName] = useState('');
  const [infoContent, setInfoContent] = useState('');
  const [visibility, setVisibility] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      await getInfoCollections();

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
        (visible === '1' && (role === 'Owner' || role === 'Administrator')) ||
        (visible === '2' && (role !== 'Volunteer'));
      let CanEdit = role === 'Owner';

    
      setInfoElements(Array.isArray(infoCollections) ? [...infoCollections] : []);
      setInfoContent(content || 'Please input information!');
      setVisibility(visible);
      setCanRead(CanRead);
      setCanEdit(CanEdit);
    };

    fetchData();
    return () => {

    };
  }, []);

  const toggleEditableModal = () => {
    setEditableModalOpen(false);
  };

  const handleEdit = (edit) => {
    if (canEdit) {
      setEditing(edit);
    }
  };

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

  const handleInputChange = (content) => {
    setInfoContent(content);
  };

  const handleChangeInInfos = () => {
    let newInfoElements = [...infoElements];
    let findIndex = false;
    let foundInfoId;

    newInfoElements = newInfoElements.map((index) => {
      if (index.infoName === infoName) {
        findIndex = true;
        foundInfoId = index._id;
        return { ...index, infoContent: infoContent };
      }
      return index;
    });

    setInfoElements(newInfoElements);

    return {
      findIndex,
      infoId: foundInfoId,
    };
  };

  const handleSelectChange = (selectedOption) => {
    setVisibility(selectedOption.value);
  };

  const updateUserData = async () => {
    try {
      await getInfoCollections();
    } catch (error) {
      console.error(error);
      // Handle error appropriately here
    }
  };

  const mainSaveHandler = async () => {
    const { findIndex: updatedInfo, infoId } = handleChangeInInfos();
    const newInfo = {
      infoName: infoName,
      infoContent: infoContent,
      visibility: visibility,
    };
    let saveResult;
    if (!updatedInfo) {
      saveResult = await addInfoCollection(newInfo);
    } else {
      saveResult = await updateInfoCollection(infoId, newInfo);
    }
    if (saveResult === 200 || saveResult === 201) {
      await handleSaveSuccess();
    } else {
      handleSaveError();
    }
  };

  const handleDelete = async () => {
    const { infoId } = handleChangeInInfos();
    const deleteResult = await deleteInfoCollectionById(infoId);
  };

  const handleClose = () => {
    setEditableModalOpen(false);
    handleEdit(false);
  };

  const handleSave = async (event) => {
    handleEdit(false);
    if (event) {
      event.preventDefault();
    }
    await mainSaveHandler();
  };

  return (
    (loading === true ? "Loading..." : fetchError ? "Fetch Information Error" : (canRead && (
      <div>
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for user class information"
          style={{ fontSize: fontSize, cursor: 'pointer', color: '#00CCFF', marginRight: '8px' }}
          aria-hidden="true"
          className="fa fa-info-circle"
          onClick={() => setEditableModalOpen(true)}
        />
        {editableModalOpen && (
          <Modal isOpen={editableModalOpen} toggle={toggleEditableModal} size="lg">
            <ModalHeader>Welcome to the {areaTitle} Information Page!</ModalHeader>
            <ModalBody>
              {editing ? (
                <RichTextEditor
                  disabled={!editing}
                  value={infoContent}
                  onEditorChange={handleInputChange}
                />
              ) : (
                <div
                  style={{ paddingLeft: '20px' }}
                  dangerouslySetInnerHTML={{ __html: infoContent }}
                  onClick={() => handleEdit(true)}
                />
              )}
              {isPermissionPage && canEdit && (
                <div style={{ paddingLeft: '20px' }}>
                  <p>Click above to edit this content. (Note: Only works on Permissions Management Page)</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Row className="no-gutters">
                {editing && (
                  <Col md={6} style={{ paddingRight: '2px' }}>
                    <Select
                      options={options}
                      onChange={handleSelectChange}
                      value={options.find((option) => option.value === visibility)}
                    />
                  </Col>
                )}

                {canEdit && editing && (
                  <Col md={3} style={{ paddingLeft: '4px' }}>
                    <Button className="saveBtn" onClick={handleSave} style={boxStyle}>
                      Save
                    </Button>
                  </Col>
                )}
                <Col md={3}>
                  <Button onClick={handleClose} style={boxStyle}>
                    Close
                  </Button>
                </Col>
              </Row>
            </ModalFooter>
          </Modal>
        )}
      </div>
    )))
  
    
  );

});

EditableInfoModalWithMemo.propTypes = {
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


export default connect(mapStateToProps, mapDispatchToProps)(EditableInfoModalWithMemo);
