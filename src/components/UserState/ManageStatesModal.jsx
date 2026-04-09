import axios from 'axios';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faArrowsUpDown,
  faCheck,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { ENDPOINTS } from '~/utils/URL';
import { boxStyle, boxStyleDark } from '~/styles';
import { DEFAULT_COLOR, DEFAULT_EMOJI, getStateColor } from './constants';
import ColorPicker from './ColorPicker';
import EmojiPicker from './EmojiPicker';
import styles from './UserState.module.css';

function logError(context, error) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[ManageStatesModal] ${context}:`, error?.message || error);
  }
}

function ManageStatesModal({ isOpen, onClose, catalog, onCatalogChange, darkMode }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newEmoji, setNewEmoji] = useState(DEFAULT_EMOJI);
  const [editEmoji, setEditEmoji] = useState(DEFAULT_EMOJI);

  const [editingKey, setEditingKey] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const boxStyling = darkMode ? boxStyleDark : boxStyle;
  const fontColor = darkMode ? 'text-light' : '';
  const themeClass = darkMode ? styles.dark : styles.light;

  const handleEmojiSelect = emoji => {
    setNewEmoji(emoji);
    setShowEmojiPicker(false);
  };
  const handleEditEmojiSelect = emoji => {
    setEditEmoji(emoji);
    setShowEditEmojiPicker(false);
  };

  const handleStartEdit = item => {
    setEditEmoji(item.emoji || DEFAULT_EMOJI);
    setEditLabel(item.label);
    setEditColor(item.color || DEFAULT_COLOR);
    setEditingKey(item.key);
    setShowEditEmojiPicker(false);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditLabel('');
    setEditColor(DEFAULT_COLOR);
    setEditEmoji(DEFAULT_EMOJI);
    setShowEditEmojiPicker(false);
  };

  const handleAddNew = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    try {
      const res = await axios.post(ENDPOINTS.USER_STATE_CATALOG, {
        label: trimmed,
        emoji: newEmoji,
        color: selectedColor,
        requestor: { role: 'Owner' },
      });
      onCatalogChange(prev => [...prev, res.data.item]);
      setNewLabel('');
      setNewEmoji(DEFAULT_EMOJI);
      setSelectedColor(DEFAULT_COLOR);
      setIsAdding(false);
      setShowEmojiPicker(false);
      toast.success(`State "${trimmed}" created successfully!`);
    } catch (addError) {
      // eslint-disable-next-line no-alert
      toast.error(addError?.response?.data?.error || 'Failed to add new state');
    }
  };

  const handleSaveEdit = async key => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    try {
      await axios.patch(ENDPOINTS.USER_STATE_CATALOG_ITEM(key), {
        label: trimmed,
        emoji: editEmoji,
        color: editColor,
        requestor: { role: 'Owner' },
      });
      onCatalogChange(prev =>
        prev.map(c =>
          c.key === key ? { ...c, label: trimmed, emoji: editEmoji, color: editColor } : c,
        ),
      );
      handleCancelEdit();
      toast.success(`State "${trimmed}" updated successfully!`);
    } catch (editError) {
      logError('handleSaveEdit', editError);
      // eslint-disable-next-line no-alert
      toast.error(editError?.response?.data?.error || 'Failed to update state');
    }
  };

  const handleDelete = async key => {
    const item = catalog.find(c => c.key === key);
    try {
      const res = await axios.get(ENDPOINTS.USER_STATE_CATALOG_USAGE(key));
      const { count } = res.data;
      if (count > 0) {
        setDeleteConfirm({ key, label: item?.label, count });
      } else {
        await confirmDelete(key);
      }
    } catch (err) {
      logError('handleDelete check', err);
    }
  };

  const confirmDelete = async key => {
    onCatalogChange(prev => prev.filter(c => c.key !== key));
    setDeleteConfirm(null);
    try {
      await axios.patch(ENDPOINTS.USER_STATE_CATALOG_ITEM(key), {
        isActive: false,
        requestor: { role: 'Owner' },
      });
      toast.success(`State deleted successfully`);
    } catch (deleteError) {
      logError('confirmDelete', deleteError);
    }
  };

  const handleMoveUp = async idx => {
    if (idx === 0) return;
    const reordered = [...catalog];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    onCatalogChange(reordered);
    try {
      await axios.put(ENDPOINTS.USER_STATE_CATALOG_REORDER, {
        orderedKeys: reordered.map(c => c.key),
        requestor: { role: 'Owner' },
      });
    } catch (moveError) {
      logError('handleMoveUp', moveError);
    }
  };

  const handleMoveDown = async idx => {
    if (idx === catalog.length - 1) return;
    const reordered = [...catalog];
    [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
    onCatalogChange(reordered);
    try {
      await axios.put(ENDPOINTS.USER_STATE_CATALOG_REORDER, {
        orderedKeys: reordered.map(c => c.key),
        requestor: { role: 'Owner' },
      });
    } catch (moveError) {
      logError('handleMoveDown', moveError);
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    setIsReordering(false);
    setNewLabel('');
    setNewEmoji(DEFAULT_EMOJI);
    setSelectedColor(DEFAULT_COLOR);
    setShowEmojiPicker(false);
    handleCancelEdit();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      size="lg"
      className={darkMode ? 'text-light' : ''}
      centered
    >
      <ModalHeader toggle={handleClose} className={darkMode ? 'bg-space-cadet' : ''}>
        Manage States
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p
          className={fontColor}
          style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}
        >
          Existing States
        </p>

        <div className={`${styles.existingStatesList} ${themeClass}`}>
          {catalog.map((item, idx) => {
            const { bg, text } = getStateColor(item.color, darkMode);
            const isEditing = editingKey === item.key;
            return (
              <div key={item.key}>
                <div
                  className={`${styles.catalogRow} ${
                    isEditing ? styles.catalogRowEditing : ''
                  } ${themeClass}`}
                >
                  <span className={styles.previewBadge} style={{ background: bg, color: text }}>
                    {item.emoji ? `${item.emoji} ${item.label}` : item.label}
                  </span>
                  <div className={styles.catalogRowActions}>
                    {isReordering && (
                      <div className={styles.reorderBtns}>
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          style={boxStyling}
                          title="Move up"
                        >
                          <FontAwesomeIcon icon={faChevronUp} />
                        </Button>
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === catalog.length - 1}
                          style={boxStyling}
                          title="Move down"
                        >
                          <FontAwesomeIcon icon={faChevronDown} />
                        </Button>
                      </div>
                    )}
                    <Button
                      color="info"
                      size="sm"
                      onClick={() => (isEditing ? handleCancelEdit() : handleStartEdit(item))}
                      style={boxStyling}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(item.key)}
                      style={boxStyling}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {isEditing && (
                  <div className={`${styles.inlineEditForm} ${themeClass}`}>
                    <FormGroup>
                      <Label className={fontColor}>Label</Label>
                      <div className={styles.labelInputRow}>
                        <Button
                          color="secondary"
                          size="sm"
                          onClick={() => setShowEditEmojiPicker(prev => !prev)}
                          title="Pick an emoji"
                          style={{
                            ...boxStyling,
                            width: '38px',
                            height: '38px',
                            padding: 0,
                            fontSize: '20px',
                            flexShrink: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {editEmoji}
                        </Button>
                        {showEditEmojiPicker && (
                          <div className={styles.emojiPickerDropdown}>
                            <EmojiPicker darkMode={darkMode} onSelect={handleEditEmojiSelect} />
                          </div>
                        )}
                        <Input
                          type="text"
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          maxLength={30}
                          onKeyDown={e => e.key === 'Enter' && handleSaveEdit(item.key)}
                          className={darkMode ? 'bg-yinmn-blue text-light' : ''}
                        />
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label className={fontColor}>Color</Label>
                      <ColorPicker selectedColor={editColor} onSelect={setEditColor} />
                    </FormGroup>
                    {editLabel.trim() && (
                      <FormGroup>
                        <Label className={fontColor}>Preview</Label>
                        <div>
                          <span className={styles.previewBadge} style={{ background: editColor }}>
                            {editEmoji} {editLabel.trim()}
                          </span>
                        </div>
                      </FormGroup>
                    )}
                    <div className={styles.formActionBtns}>
                      <Button
                        color="success"
                        onClick={() => handleSaveEdit(item.key)}
                        style={boxStyling}
                      >
                        Save
                      </Button>
                      <Button color="danger" onClick={handleCancelEdit} style={boxStyling}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdding && (
          <div className={`${styles.addNewForm} ${themeClass}`}>
            <p
              className={fontColor}
              style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}
            >
              New State
            </p>
            <FormGroup>
              <Label className={fontColor}>Label</Label>
              <div className={styles.labelInputRow}>
                <Button
                  color="secondary"
                  size="sm"
                  onClick={() => setShowEmojiPicker(prev => !prev)}
                  title="Pick an emoji"
                  style={{
                    ...boxStyling,
                    width: '38px',
                    height: '38px',
                    padding: 0,
                    fontSize: '20px',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {newEmoji}
                </Button>
                {showEmojiPicker && (
                  <div className={styles.emojiPickerDropdown}>
                    <EmojiPicker darkMode={darkMode} onSelect={handleEmojiSelect} />
                  </div>
                )}
                <Input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. Star Developer"
                  maxLength={30}
                  onKeyDown={e => e.key === 'Enter' && handleAddNew()}
                  className={darkMode ? 'bg-yinmn-blue text-light' : ''}
                />
              </div>
            </FormGroup>
            <FormGroup>
              <Label className={fontColor}>Color</Label>
              <ColorPicker selectedColor={selectedColor} onSelect={setSelectedColor} />
            </FormGroup>
            {newLabel.trim() && (
              <FormGroup>
                <Label className={fontColor}>Preview</Label>
                <div>
                  <span className={styles.previewBadge} style={{ background: selectedColor }}>
                    {newEmoji} {newLabel.trim()}
                  </span>
                </div>
              </FormGroup>
            )}
            <div className={styles.formActionBtns}>
              <Button color="success" onClick={handleAddNew} style={boxStyling}>
                Save
              </Button>
              <Button
                color="danger"
                onClick={() => {
                  setIsAdding(false);
                  setNewLabel('');
                  setNewEmoji(DEFAULT_EMOJI);
                  setSelectedColor(DEFAULT_COLOR);
                  setShowEmojiPicker(false);
                }}
                style={boxStyling}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className={`${styles.deleteConfirmBox} ${themeClass}`}>
            <p className={fontColor} style={{ fontWeight: 600, marginBottom: '8px' }}>
              ⚠️ Delete &quot;{deleteConfirm.label}&quot;?
            </p>
            <p className={fontColor} style={{ fontSize: '13px', marginBottom: '12px' }}>
              This state is currently assigned to{' '}
              <strong>
                {deleteConfirm.count} user{deleteConfirm.count !== 1 ? 's' : ''}
              </strong>
              . Deleting it will remove it from all of them.
            </p>
            <div className={styles.formActionBtns}>
              <Button
                color="danger"
                onClick={() => confirmDelete(deleteConfirm.key)}
                style={boxStyling}
              >
                Delete & Remove from All Users
              </Button>
              <Button color="secondary" onClick={() => setDeleteConfirm(null)} style={boxStyling}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className="d-flex w-100 align-items-center">
          <div className={styles.footerLeft}>
            {!isAdding && (
              <Button
                color="success"
                onClick={() => {
                  setIsAdding(true);
                  handleCancelEdit();
                }}
                style={boxStyling}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add New State
              </Button>
            )}
            <Button
              color={isReordering ? 'warning' : 'info'}
              onClick={() => setIsReordering(prev => !prev)}
              style={boxStyling}
            >
              <FontAwesomeIcon icon={isReordering ? faCheck : faArrowsUpDown} className="mr-1" />
              {isReordering ? 'Done Reordering' : 'Reorder'}
            </Button>
          </div>
          <div className="ml-auto">
            <Button color="primary" onClick={handleClose} style={boxStyling}>
              Close
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}

ManageStatesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  catalog: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      emoji: PropTypes.string,
      color: PropTypes.string,
    }),
  ).isRequired,
  onCatalogChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default ManageStatesModal;
