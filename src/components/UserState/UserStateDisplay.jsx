import axios from 'axios';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
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

function UserStateDisplay({ userId, canEdit }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [catalog, setCatalog] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catalogRes, selectionRes] = await Promise.all([
        axios.get(ENDPOINTS.USER_STATE_CATALOG),
        axios.get(ENDPOINTS.USER_STATE_SELECTION(userId)),
      ]);
      setCatalog(catalogRes.data.items || []);
      setSelected(selectionRes.data.stateIndicators || []);
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    } catch (e) {
      setSelected(selected);
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
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to add new state');
    }
  };

  const handleMoveUp = async idx => {
    if (idx === 0) return;
    const reordered = [...catalog];
    [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
    setCatalog(reordered);
    try {
      await axios.put(`${ENDPOINTS.USER_STATE_CATALOG}/reorder`, {
        orderedKeys: reordered.map(c => c.key),
        requestor: { role: 'Owner' },
      });
    } catch (e) {
      fetchData(); // revert on failure
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
    } catch (e) {
      fetchData();
    }
  };

  if (loading) return null;

  if (selected.length === 0) {
    if (!canEdit) return null;
    return (
      <div style={{ marginTop: '6px' }}>
        <span
          onClick={() => setIsEditing(true)}
          onKeyDown={e => e.key === 'Enter' && setIsEditing(true)}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer', fontSize: '11px', color: '#3498db' }}
        >
          ➕ Set State
        </span>
        {isEditing && (
          <div
            style={{
              marginTop: '8px',
              padding: '10px',
              border: `1px solid ${darkMode ? '#4a6a9c' : '#b0c4de'}`,
              borderRadius: '8px',
              background: darkMode ? '#1e2d4a' : '#f8f9ff',
            }}
          >
            <div
              style={{
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: darkMode ? '#cdd9f5' : '#1a3a6b',
              }}
            >
              Select State:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {catalog.map((item, idx) => {
                const isItemSelected = selected.some(s => s.key === item.key);
                const { bg, text } = getStateColor(item.key, darkMode);
                return (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span
                      onClick={() => handleToggle(item.key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && handleToggle(item.key)}
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: isItemSelected ? bg : darkMode ? '#2a3a5c' : '#e8f0fe',
                        color: isItemSelected ? text : darkMode ? '#cdd9f5' : '#1a3a6b',
                        border: `2px solid ${bg}`,
                        boxShadow: isItemSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                        opacity: isItemSelected ? 1 : 0.7,
                      }}
                    >
                      {item.label}
                    </span>
                    {isReordering && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            cursor: 'pointer',
                            lineHeight: 1,
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === catalog.length - 1}
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            cursor: 'pointer',
                            lineHeight: 1,
                          }}
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
              <div
                style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}
              >
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. 🌟 Star Developer"
                  maxLength={30}
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${darkMode ? '#4a6a9c' : '#b0c4de'}`,
                    background: darkMode ? '#1e2d4a' : '#fff',
                    color: darkMode ? '#cdd9f5' : '#1a3a6b',
                    width: '180px',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleAddNew()}
                />
                <button
                  type="button"
                  onClick={handleAddNew}
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
                  onClick={() => {
                    setIsAdding(false);
                    setNewLabel('');
                  }}
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
                onClick={() => {
                  setIsAdding(true);
                  setIsReordering(false);
                }}
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
                onClick={() => {
                  setIsReordering(prev => !prev);
                  setIsAdding(false);
                }}
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  background: isReordering ? '#e67e22' : '#3498db',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                ↕️ {isReordering ? 'Done Reordering' : 'Reorder'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsAdding(false);
                  setIsReordering(false);
                }}
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
        )}
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
      {/* Display selected state badges */}
      {selectedItems.map(item => {
        const { bg, text } = getStateColor(item.key, darkMode);
        return (
          <span
            key={item.key}
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
            }}
            onClick={
              canEdit
                ? e => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }
                : undefined
            }
            role={canEdit ? 'button' : undefined}
            tabIndex={canEdit ? 0 : undefined}
            onKeyDown={canEdit ? e => e.key === 'Enter' && setIsEditing(true) : undefined}
          >
            {formatDate(item.selectedAt)} {item.label}
          </span>
        );
      })}

      {/* Edit panel */}
      {canEdit && isEditing && (
        <div
          style={{
            marginTop: '8px',
            padding: '10px',
            border: `1px solid ${darkMode ? '#4a6a9c' : '#b0c4de'}`,
            borderRadius: '8px',
            background: darkMode ? '#1e2d4a' : '#f8f9ff',
          }}
        >
          <div
            style={{
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: darkMode ? '#cdd9f5' : '#1a3a6b',
            }}
          >
            Select State:
          </div>

          {/* State selection buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {catalog.map((item, idx) => {
              const isItemSelected = selected.some(s => s.key === item.key);
              const { bg, text } = getStateColor(item.key, darkMode);
              return (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span
                    onClick={() => handleToggle(item.key)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleToggle(item.key)}
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: isItemSelected ? bg : darkMode ? '#2a3a5c' : '#e8f0fe',
                      color: isItemSelected ? text : darkMode ? '#cdd9f5' : '#1a3a6b',
                      border: `2px solid ${bg}`,
                      boxShadow: isItemSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                      opacity: isItemSelected ? 1 : 0.7,
                    }}
                  >
                    {item.label}
                  </span>
                  {/* Reorder buttons */}
                  {isReordering && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
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
                        onClick={() => handleMoveDown(idx)}
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

          {/* Add new state input */}
          {isAdding && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. 🌟 Star Developer"
                maxLength={30}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${darkMode ? '#4a6a9c' : '#b0c4de'}`,
                  background: darkMode ? '#1e2d4a' : '#fff',
                  color: darkMode ? '#cdd9f5' : '#1a3a6b',
                  width: '180px',
                }}
                onKeyDown={e => e.key === 'Enter' && handleAddNew()}
              />
              <button
                type="button"
                onClick={handleAddNew}
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
                onClick={() => {
                  setIsAdding(false);
                  setNewLabel('');
                }}
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

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setIsReordering(false);
              }}
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
              onClick={() => {
                setIsReordering(prev => !prev);
                setIsAdding(false);
              }}
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '4px',
                border: 'none',
                background: isReordering ? '#e67e22' : '#3498db',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              ↕️ {isReordering ? 'Done Reordering' : 'Reorder'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsAdding(false);
                setIsReordering(false);
              }}
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
      )}
    </div>
  );
}

UserStateDisplay.propTypes = {
  userId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
};

UserStateDisplay.defaultProps = {
  canEdit: false,
};

export default UserStateDisplay;
