import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';
import { PRONOUN_OPTIONS } from '~/utils/pronouns';
import styles from './PronounsDisplay.module.css';

/**
 * Shows a user's pronouns and, when `canEdit` is true, lets the viewer
 * add or change them. Saving calls PATCH /userProfile/:userId/pronouns,
 * which only allows the user themselves or an Administrator/Owner.
 */
function PronounsDisplay({ userId, pronouns, canEdit, isSelf, darkMode, onSaved, className }) {
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState(pronouns || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) setSelected(pronouns || '');
  }, [pronouns, isEditing]);

  const textClass = `${styles.pronouns} ${darkMode ? styles.dark : ''}`;
  const selectId = `pronouns-select-${userId}`;

  const handleSave = async () => {
    if (!PRONOUN_OPTIONS.includes(selected)) {
      toast.error('Please choose He/Him, She/Her, or They/Them.');
      return;
    }
    setIsSaving(true);
    try {
      const { data } = await httpService.patch(ENDPOINTS.USER_PROFILE_PRONOUNS(userId), {
        pronouns: selected,
      });
      toast.success('Pronouns saved');
      setIsEditing(false);
      if (onSaved) onSaved(data?.pronouns ?? selected);
    } catch (err) {
      const message = err?.response?.data?.error || 'Could not save pronouns. Please try again.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        <label htmlFor={selectId} className={styles.srOnly}>
          Pronouns
        </label>
        <select
          id={selectId}
          className={`${styles.select} ${darkMode ? styles.darkSelect : ''}`}
          value={selected}
          onChange={e => setSelected(e.target.value)}
          disabled={isSaving}
        >
          <option value="" disabled>
            Select pronouns
          </option>
          {PRONOUN_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`btn btn-sm btn-primary ${styles.button}`}
          onClick={handleSave}
          disabled={isSaving || !selected}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          className={`btn btn-sm btn-outline-secondary ${styles.button}`}
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    );
  }

  if (!pronouns) {
    if (!canEdit) return null;
    return (
      <div className={`${styles.wrapper} ${className}`}>
        <button
          type="button"
          className={`btn btn-sm btn-outline-primary ${styles.button}`}
          onClick={() => setIsEditing(true)}
        >
          {isSelf ? 'Choose your pronouns' : 'Add pronouns'}
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <span className={textClass}>({pronouns})</span>
      {canEdit && (
        <button
          type="button"
          className={`btn btn-link btn-sm ${styles.editLink}`}
          onClick={() => setIsEditing(true)}
          aria-label="Edit pronouns"
        >
          Edit
        </button>
      )}
    </div>
  );
}

PronounsDisplay.propTypes = {
  userId: PropTypes.string.isRequired,
  pronouns: PropTypes.string,
  canEdit: PropTypes.bool,
  isSelf: PropTypes.bool,
  darkMode: PropTypes.bool,
  onSaved: PropTypes.func,
  className: PropTypes.string,
};

PronounsDisplay.defaultProps = {
  pronouns: '',
  canEdit: false,
  isSelf: false,
  darkMode: false,
  onSaved: undefined,
  className: '',
};

export default PronounsDisplay;
