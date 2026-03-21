import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `(${d.getMonth() + 1}/${d.getDate()})`;
}

const STATE_COLORS = {
  'closing-out': { bg: '#e74c3c', text: '#fff' },
  'new-developer': { bg: '#3498db', text: '#fff' },
  'pr-review-team': { bg: '#9b59b6', text: '#fff' },
  developer: { bg: '#27ae60', text: '#fff' },
  'task-requested': { bg: '#e67e22', text: '#fff' },
};

function getStateColor(key, darkMode) {
  if (STATE_COLORS[key]) return STATE_COLORS[key];
  return { bg: darkMode ? '#2a3a5c' : '#607d8b', text: '#fff' };
}

function EditPanel({
  catalog,
  selected,
  darkMode,
  isAdding,
  isReordering,
  newLabel,
  onToggle,
  onMoveUp,
  onMoveDown,
  onAddNew,
  onNewLabelChange,
  onSetIsAdding,
  onSetIsReordering,
  onClose,
}) {
  const panelBorder = darkMode ? '#4a6a9c' : '#b0c4de';
  const panelBg = darkMode ? '#1e2d4a' : '#f8f9ff';
  const titleColor = darkMode ? '#cdd9f5' : '#1a3a6b';
  const unselectedBg = darkMode ? '#2a3a5c' : '#e8f0fe';
  const unselectedColor = darkMode ? '#cdd9f5' : '#1a3a6b';
  const reorderBtnBg = isReordering ? '#e67e22' : '#3498db';
  const reorderBtnText = isReordering ? 'Done Reordering' : 'Reorder';

  return (
    <div
      style={{
        marginTop: '8px',
        padding: '10px',
        border: `1px solid ${panelBorder}`,
        borderRadius: '8px',
        background: panelBg,
      }}
    >
      <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: titleColor }}>
        Select State:
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {catalog.map((item, idx) => {
          const isItemSelected = selected.some(s => s.key === item.key);
          const { bg, text } = getStateColor(item.key, darkMode);
          const btnBg = isItemSelected ? bg : unselectedBg;
          const btnColor = isItemSelected ? text : unselectedColor;
          const btnShadow = isItemSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none';
          const btnOpacity = isItemSelected ? 1 : 0.7;
          return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <button
                type="button"
                onClick={() => onToggle(item.key)}
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: btnBg,
                  color: btnColor,
                  border: `2px solid ${bg}`,
                  boxShadow: btnShadow,
                  opacity: btnOpacity,
                }}
              >
                {item.label}
              </button>
              {isReordering && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <button
                    type="button"
                    onClick={() => onMoveUp(idx)}
                    disabled={idx === 0}
                    style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(idx)}
                    disabled={idx === catalog.length - 1}
                    style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isAdding && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={newLabel}
            onChange={e => onNewLabelChange(e.target.value)}
            placeholder="e.g. 🌟 Star Developer"
            maxLength={30}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${panelBorder}`,
              background: darkMode ? '#1e2d4a' : '#fff',
              color: darkMode ? '#cdd9f5' : '#1a3a6b',
              width: '180px',
            }}
            onKeyDown={e => e.key === 'Enter' && onAddNew()}
          />
          <button
            type="button"
            onClick={onAddNew}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              background: '#27ae60',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => onSetIsAdding(false)}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              border: 'none',
              background: '#e74c3c',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onSetIsAdding(true)}
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '4px',
            border: 'none',
            background: '#27ae60',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ➕ Add new
        </button>
        <button
          type="button"
          onClick={() => onSetIsReordering(!isReordering)}
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '4px',
            border: 'none',
            background: reorderBtnBg,
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {`↕️ ${reorderBtnText}`}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '4px',
            border: 'none',
            background: '#6c757d',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

EditPanel.propTypes = {
  catalog: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string, label: PropTypes.string }))
    .isRequired,
  selected: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })).isRequired,
  darkMode: PropTypes.bool.isRequired,
  isAdding: PropTypes.bool.isRequired,
  isReordering: PropTypes.bool.isRequired,
  newLabel: PropTypes.string.isRequired,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  onAddNew: PropTypes.func.isRequired,
  onNewLabelChange: PropTypes.func.isRequired,
  onSetIsAdding: PropTypes.func.isRequired,
  onSetIsReordering: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function logError(context, error) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[UserStateDisplay] ${context}:`, error?.message || error);
  }
}

function UserStateDisplay({ userId, catalog, selectedFromParent, canEdit }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selected, setSelected] = useState(selectedFromParent || []);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    setSelected(selectedFromParent || []);
    setLoading(false);
  }, [selectedFromParent]);

  const handleToggle = async key => {
    const isItemSelected = selected.some(s => s.key === key);
    const updated = isItemSelected
      ? selected.filter(s => s.key !== key)
      : [...selected, { key, selectedAt: new Date().toISOString() }];
    setSelected(updated);
    try {
      await axios.put(ENDPOINTS.USER_STATE_SELECTION(userId), {
        selectedKeys: updated.map(s => s.key),
        requestor: { role: 'Owner' },
      });
    } catch (toggleError) {
      logError('handleToggle', toggleError);
      setSelected(prev => prev);
    }
  };

  const handleAddNew = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    try {
      const res = await axios.post(ENDPOINTS.USER_STATE_CATALOG, {
        label: trimmed,
        requestor: { role: 'Owner' },
      });
      setCatalog(prev => [...prev, res.data.item]);
      setNewLabel('');
      setIsAdding(false);
    } catch (addError) {
      // eslint-disable-next-line no-alert
      alert(addError?.response?.data?.error || 'Failed to add new state');
    }
  };

  const handleMoveUp = async idx => {
    if (idx === 0) return;
    const reordered = [...catalog];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    setCatalog(reordered);
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
    setCatalog(reordered);
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
    setIsEditing(false);
    setIsAdding(false);
    setIsReordering(false);
  };

  const handleToggleReordering = newVal => {
    const next = Boolean(newVal);
    setIsReordering(next);
    if (next) {
      setIsAdding(false);
    }
  };

  const editPanelProps = {
    catalog,
    selected,
    darkMode,
    isAdding,
    isReordering,
    newLabel,
    onToggle: handleToggle,
    onMoveUp: handleMoveUp,
    onMoveDown: handleMoveDown,
    onAddNew: handleAddNew,
    onNewLabelChange: setNewLabel,
    onSetIsAdding: setIsAdding,
    onSetIsReordering: handleToggleReordering,
    onClose: handleClose,
  };

  if (loading) return null;

  if (selected.length === 0) {
    if (!canEdit) return null;
    return (
      <div style={{ marginTop: '6px' }}>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{
            cursor: 'pointer',
            fontSize: '11px',
            color: '#3498db',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          ➕ Set State
        </button>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        {isEditing && <EditPanel {...editPanelProps} />}
      </div>
    );
  }

  const selectedItems = catalog
    .filter(c => selected.some(s => s.key === c.key))
    .map(c => {
      const sel = selected.find(s => s.key === c.key);
      return { ...c, selectedAt: sel.selectedAt };
    });

  return (
    <div style={{ marginTop: '6px' }}>
      {selectedItems.map(item => {
        const { bg, text } = getStateColor(item.key, darkMode);
        return (
          <button
            key={item.key}
            type="button"
            title="This is the user's state. Ask an Admin to change it for you if you feel it is not accurate"
            style={{
              display: 'inline-block',
              marginRight: '6px',
              marginBottom: '4px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              background: bg,
              color: text,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              cursor: canEdit ? 'pointer' : 'default',
              letterSpacing: '0.3px',
              border: 'none',
            }}
            onClick={
              canEdit
                ? e => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }
                : undefined
            }
          >
            {formatDate(item.selectedAt)} {item.label}
          </button>
        );
      })}
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      {canEdit && isEditing && <EditPanel {...editPanelProps} />}
    </div>
  );
}

UserStateDisplay.propTypes = {
  userId: PropTypes.string.isRequired,
  catalog: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  selectedFromParent: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      selectedAt: PropTypes.string,
    }),
  ),
  canEdit: PropTypes.bool,
};

UserStateDisplay.defaultProps = {
  catalog: [],
  selectedFromParent: [],
  canEdit: false,
};

export default UserStateDisplay;
