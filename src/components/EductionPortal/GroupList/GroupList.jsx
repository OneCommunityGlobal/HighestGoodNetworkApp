import React, { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import styles from './GroupList.module.css';
import GroupEditorModal from './GroupEditorModal.jsx';
import { useSelector } from 'react-redux';
import {
  getStudents,
  getGroups,
  getGroupMembers,
  hydrateGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  addGroupMembers,
  removeGroupMembers,
} from '~/services/studentGroupsService';

const GroupItem = memo(function GroupItem({ group, onEdit, membershipStatus, canEdit, learners }) {
  let memberLabel = 'Loading members…';
  if (membershipStatus === 'error') memberLabel = 'Failed to load members.';
  else if (Array.isArray(group.members)) memberLabel = `${group.members.length} students`;

  const memberNames =
    membershipStatus === 'ready' && Array.isArray(group.members)
      ? group.members
          .map(id => learners.find(learner => learner.id === id)?.displayName)
          .filter(Boolean)
      : [];

  return (
    <li className={styles.item}>
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{group.name || 'Untitled'}</div>
        <div className={styles.count} role={membershipStatus === 'error' ? 'alert' : undefined}>
          {memberLabel}
        </div>
        {memberNames.length > 0 && (
          <div className={styles.memberNames} aria-label="Group members">
            {memberNames.join(', ')}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editButton}
          onClick={() => onEdit(group)}
          disabled={!canEdit}
          aria-label={`Edit ${group.name || 'group'}`}
        >
          Edit
        </button>
      </div>
    </li>
  );
});

GroupItem.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    members: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  membershipStatus: PropTypes.oneOf(['loading', 'ready', 'error']),
  canEdit: PropTypes.bool.isRequired,
  learners: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, displayName: PropTypes.string }),
  ).isRequired,
};

export default function GroupList() {
  const [groups, setGroups] = useState([]);
  const [learners, setLearners] = useState([]);
  const [groupsStatus, setGroupsStatus] = useState('loading');
  const [learnersStatus, setLearnersStatus] = useState('loading');
  const [membershipStatusById, setMembershipStatusById] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pending, setPending] = useState(false);
  const [mutationError, setMutationError] = useState('');
  const [uncertainCreate, setUncertainCreate] = useState(false);
  const [unconfirmedById, setUnconfirmedById] = useState({});
  const [recoveryError, setRecoveryError] = useState('');
  const mutationLock = useRef(false);
  // Kept separate from the modal's opening snapshot so reconciliation preserves its draft.
  const baseline = useRef(null);

  const closeModal = useCallback(() => {
    if (!mutationLock.current) setShowModal(false);
  }, []);

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    let cancelled = false;

    const loadMembers = async group => {
      try {
        const memberships = await getGroupMembers(group.id);
        const hydrated = hydrateGroup(group, memberships);
        if (cancelled) return;
        setGroups(prev => prev.map(item => (item.id === group.id ? hydrated : item)));
        setMembershipStatusById(prev => ({ ...prev, [group.id]: 'ready' }));
      } catch {
        if (!cancelled) {
          setMembershipStatusById(prev => ({ ...prev, [group.id]: 'error' }));
        }
      }
    };

    const loadGroups = async () => {
      try {
        const loadedGroups = await getGroups();
        if (cancelled) return;
        setGroups(loadedGroups);
        setGroupsStatus('ready');
        setMembershipStatusById(
          Object.fromEntries(loadedGroups.map(group => [group.id, 'loading'])),
        );
        await Promise.all(loadedGroups.map(loadMembers));
      } catch {
        if (!cancelled) setGroupsStatus('error');
      }
    };

    const loadStudents = async () => {
      try {
        const students = await getStudents();
        if (cancelled) return;
        setLearners(students);
        setLearnersStatus('ready');
      } catch {
        if (!cancelled) setLearnersStatus('error');
      }
    };

    loadGroups();
    loadStudents();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalGroups = useMemo(() => groups.length, [groups]);
  const listsReady = groupsStatus === 'ready' && learnersStatus === 'ready';

  const openNew = useCallback(() => {
    if (!listsReady || mutationLock.current) return;
    baseline.current = null;
    setMutationError(
      uncertainCreate
        ? 'Creation could not be confirmed. Close this dialog and refresh groups before creating again.'
        : '',
    );
    setEditing(null);
    setShowModal(true);
  }, [listsReady, uncertainCreate]);

  const openEdit = useCallback(
    group => {
      if (!listsReady || mutationLock.current || !Array.isArray(group.members)) return;
      if (membershipStatusById[group.id] && membershipStatusById[group.id] !== 'ready') return;
      if (unconfirmedById[group.id]) return;
      baseline.current = group;
      setMutationError('');
      setEditing(group);
      setShowModal(true);
    },
    [listsReady, membershipStatusById, unconfirmedById],
  );

  const storeGroup = useCallback(group => {
    setGroups(prev =>
      prev.some(item => item.id === group.id)
        ? prev.map(item => (item.id === group.id ? group : item))
        : [...prev, group],
    );
  }, []);

  const refreshMembers = useCallback(
    async group => {
      setMembershipStatusById(prev => ({ ...prev, [group.id]: 'loading' }));
      try {
        const memberships = await getGroupMembers(group.id);
        const hydrated = hydrateGroup(group, memberships);
        storeGroup(hydrated);
        setMembershipStatusById(prev => ({ ...prev, [group.id]: 'ready' }));
        baseline.current = hydrated;
        return hydrated;
      } catch (error) {
        baseline.current = null;
        setMembershipStatusById(prev => ({ ...prev, [group.id]: 'error' }));
        throw error;
      }
    },
    [storeGroup],
  );

  const reconcile = useCallback(
    async group => {
      baseline.current = null;
      setUnconfirmedById(prev => ({ ...prev, [group.id]: true }));
      const [groupResult, memberResult] = await Promise.allSettled([
        getGroups(),
        getGroupMembers(group.id),
      ]);
      const confirmed =
        groupResult.status === 'fulfilled'
          ? groupResult.value.find(item => item.id === group.id)
          : null;
      const information = confirmed || group;
      if (memberResult.status === 'fulfilled') {
        const hydrated = hydrateGroup(information, memberResult.value);
        storeGroup(hydrated);
        setMembershipStatusById(prev => ({ ...prev, [group.id]: 'ready' }));
        // Both information and membership must be confirmed before retrying a save.
        if (confirmed) {
          baseline.current = hydrated;
          setUnconfirmedById(prev => ({ ...prev, [group.id]: false }));
        }
      } else {
        storeGroup(information);
        setMembershipStatusById(prev => ({ ...prev, [group.id]: 'error' }));
      }
      return baseline.current;
    },
    [storeGroup],
  );

  // Explicit read-only recovery; never replay an uncertain mutation.
  const refreshGroups = useCallback(async () => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setPending(true);
    setRecoveryError('');
    try {
      const loadedGroups = await getGroups();
      const results = await Promise.allSettled(
        loadedGroups.map(async group => hydrateGroup(group, await getGroupMembers(group.id))),
      );
      setGroups(
        loadedGroups.map((group, index) =>
          results[index].status === 'fulfilled' ? results[index].value : group,
        ),
      );
      setMembershipStatusById(
        Object.fromEntries(
          loadedGroups.map((group, index) => [
            group.id,
            results[index].status === 'fulfilled' ? 'ready' : 'error',
          ]),
        ),
      );
      setUnconfirmedById(
        Object.fromEntries(
          loadedGroups.map((group, index) => [group.id, results[index].status !== 'fulfilled']),
        ),
      );
      setUncertainCreate(false);
      setGroupsStatus('ready');
    } catch {
      setRecoveryError('Could not refresh groups. Unconfirmed operations remain blocked.');
    } finally {
      mutationLock.current = false;
      setPending(false);
    }
  }, []);

  const handleSave = useCallback(
    async draft => {
      if (mutationLock.current || (!draft.id && uncertainCreate)) return;
      mutationLock.current = true;
      setPending(true);
      setMutationError('');
      let confirmed = baseline.current;
      let created = null;
      try {
        if (!draft.id) {
          created = await createGroup({ name: draft.name.trim(), studentIds: draft.members });
          storeGroup(created);
          // Retain the server ID even if hydration fails; a later Save must never create again.
          setEditing({ ...created, name: draft.name, members: draft.members });
          await refreshMembers(created);
        } else {
          if (!confirmed)
            confirmed = await reconcile(groups.find(group => group.id === draft.id) || editing);
          if (!confirmed) {
            setMutationError(
              'Could not confirm the current group. No further changes were sent. Please try again.',
            );
            return;
          }
          const original = new Set(confirmed.members);
          const selected = new Set(draft.members);
          const additions = [...selected].filter(id => !original.has(id));
          const removals = [...original].filter(id => !selected.has(id));
          confirmed = await updateGroup(draft.id, {
            name: draft.name.trim(),
            description: confirmed.description,
          });
          if (additions.length) await addGroupMembers(draft.id, additions);
          if (removals.length) await removeGroupMembers(draft.id, removals);
          await refreshMembers(confirmed);
        }
        setShowModal(false);
      } catch (error) {
        const detail = error.response?.data?.error || error.message || 'Request error';
        if (created) {
          setMutationError(
            `Group created, but its members could not be loaded. Save will retry using this group. ${detail}`,
          );
        } else if (draft.id) {
          const reconciled = await reconcile(confirmed || draft);
          setMutationError(
            `Save did not complete. Some changes may already be saved. ${
              reconciled
                ? 'Current server data was reloaded; your draft is preserved.'
                : 'Current server data could not be fully confirmed.'
            } ${detail}`,
          );
        } else {
          // A rejected create may have reached the server. Do not risk a duplicate POST.
          setUncertainCreate(true);
          setMutationError(
            `Creation could not be confirmed. Refresh groups to check existing groups before creating again. ${detail}`,
          );
        }
      } finally {
        mutationLock.current = false;
        setPending(false);
      }
    },
    [uncertainCreate, storeGroup, refreshMembers, reconcile, groups, editing],
  );

  const handleDelete = useCallback(async id => {
    if (mutationLock.current) return;
    mutationLock.current = true;
    setPending(true);
    setMutationError('');
    try {
      await deleteGroup(id);
      setGroups(prev => prev.filter(group => group.id !== id));
      setMembershipStatusById(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      baseline.current = null;
      setShowModal(false);
    } catch (error) {
      baseline.current = null;
      setMutationError(
        `Deletion could not be confirmed. ${error.response?.data?.error ||
          error.message ||
          'Please try again.'}`,
      );
    } finally {
      mutationLock.current = false;
      setPending(false);
    }
  }, []);

  return (
    <section
      className={`${styles.container} ${darkMode ? styles.dark : ''}`}
      aria-labelledby="groups-heading"
    >
      <header className={styles.header}>
        <div>
          <h2 id="groups-heading" className={styles.title}>
            Student Groups
          </h2>
          <div className={styles.subtitle}>
            {groupsStatus === 'ready' ? `${totalGroups} groups` : 'Student groups'}
          </div>
        </div>

        <div>
          <button
            type="button"
            className={styles.newButton}
            onClick={openNew}
            disabled={!listsReady || pending}
            aria-haspopup="dialog"
          >
            + New Group
          </button>
        </div>
      </header>

      {learnersStatus === 'loading' && <div className={styles.empty}>Loading learners…</div>}
      {learnersStatus === 'error' && (
        <div className={styles.empty} role="alert">
          Failed to load learners.
        </div>
      )}

      {!showModal && (uncertainCreate || Object.values(unconfirmedById).some(Boolean)) && (
        <div className={styles.empty}>
          <div>Refresh groups to confirm server data before further changes.</div>
          <button
            type="button"
            className={styles.editButton}
            onClick={refreshGroups}
            disabled={pending}
          >
            Refresh groups
          </button>
          {recoveryError && <div role="alert">{recoveryError}</div>}
        </div>
      )}

      <ul className={styles.list} aria-live="polite">
        {groupsStatus === 'loading' && <li className={styles.empty}>Loading groups…</li>}
        {groupsStatus === 'error' && (
          <li className={styles.empty} role="alert">
            Failed to load groups.
          </li>
        )}
        {groupsStatus === 'ready' && groups.length === 0 && (
          <li className={styles.empty}>No groups yet. Create your first group.</li>
        )}
        {groups.map(g => (
          <GroupItem
            key={g.id}
            group={g}
            learners={learners}
            onEdit={openEdit}
            membershipStatus={membershipStatusById[g.id]}
            canEdit={
              listsReady &&
              !pending &&
              !unconfirmedById[g.id] &&
              Array.isArray(g.members) &&
              (!membershipStatusById[g.id] || membershipStatusById[g.id] === 'ready')
            }
          />
        ))}
      </ul>

      {showModal && (
        <GroupEditorModal
          key={editing?.id || 'new'}
          group={editing}
          learners={learners}
          onClose={closeModal}
          pending={pending}
          mutationError={mutationError}
          saveBlocked={!editing && uncertainCreate}
          onSave={handleSave}
          onDelete={handleDelete}
          existingGroups={groups}
        />
      )}
    </section>
  );
}
