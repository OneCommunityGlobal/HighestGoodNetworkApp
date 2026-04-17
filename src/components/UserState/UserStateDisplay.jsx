import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import UserStateBadge from './UserStateBadge';
import UserStateModal from './UserStateModal';
import ManageStatesModal from './ManageStatesModal';
import styles from './UserState.module.css';

function UserStateDisplay({
  userId,
  userName,
  canEdit,
  canManage,
  catalog,
  onCatalogChange,
  initialSelected,
  onSelectionChange,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selected, setSelected] = useState(initialSelected || []);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    setSelected(initialSelected || []);
  }, [initialSelected]);

  const handleSelectionChange = (uid, updated) => {
    setSelected(updated);
    onSelectionChange(uid, updated);
  };

  const selectedItems = selected
    .filter(s => catalog.some(c => c.key === s.key))
    .map(s => {
      const catalogItem = catalog.find(c => c.key === s.key);
      return { ...catalogItem, selectedAt: s.selectedAt };
    });

  return (
    <>
      <div className={styles.userStateWrapper}>
        {selectedItems.length > 0 ? (
          <>
            {selectedItems.map(item => (
              <UserStateBadge
                key={item.key}
                item={item}
                darkMode={darkMode}
                canEdit={canEdit}
                onRemove={
                  canEdit
                    ? async key => {
                        const updated = selected.filter(s => s.key !== key);
                        handleSelectionChange(userId, updated);
                        try {
                          await axios.put(ENDPOINTS.USER_STATE_SELECTION(userId), {
                            selectedKeys: updated.map(s => s.key),
                            requestor: { role: 'Owner' },
                          });
                        } catch (err) {
                          handleSelectionChange(userId, selected);
                        }
                      }
                    : null
                }
                onClick={canEdit ? () => setIsStateModalOpen(true) : undefined}
              />
            ))}
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsStateModalOpen(true)}
                title="Edit states"
                className={`${styles.setMoreBtn} ${darkMode ? styles.dark : styles.light}`}
              >
                <FontAwesomeIcon icon={faPlus} /> Set more
              </button>
            )}
          </>
        ) : (
          canEdit && (
            <button
              type="button"
              onClick={() => setIsStateModalOpen(true)}
              className={`${styles.setStateBtn} ${darkMode ? styles.dark : styles.light}`}
            >
              <FontAwesomeIcon icon={faPlus} /> Set State
            </button>
          )
        )}
      </div>

      <UserStateModal
        isOpen={isStateModalOpen}
        onClose={() => setIsStateModalOpen(false)}
        userId={userId}
        userName={userName}
        catalog={catalog}
        selected={selected}
        onSelectionChange={handleSelectionChange}
        darkMode={darkMode}
        canManage={canManage}
        onOpenManage={() => setIsManageModalOpen(true)}
      />

      <ManageStatesModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setIsStateModalOpen(true);
        }}
        catalog={catalog}
        onCatalogChange={onCatalogChange}
        darkMode={darkMode}
      />
    </>
  );
}

UserStateDisplay.propTypes = {
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string,
  canEdit: PropTypes.bool,
  canManage: PropTypes.bool,
  catalog: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      emoji: PropTypes.string,
      color: PropTypes.string,
    }),
  ),
  onCatalogChange: PropTypes.func,
  initialSelected: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })),
  onSelectionChange: PropTypes.func,
};

UserStateDisplay.defaultProps = {
  userName: '',
  canEdit: false,
  canManage: false,
  catalog: [],
  onCatalogChange: () => {},
  initialSelected: [],
  onSelectionChange: () => {},
};

export default UserStateDisplay;
