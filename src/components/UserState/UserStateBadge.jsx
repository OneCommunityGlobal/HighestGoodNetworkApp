import PropTypes from 'prop-types';
import { getStateColor } from './constants';
import styles from './UserState.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `(${d.getMonth() + 1}/${d.getDate()})`;
}

function UserStateBadge({ item, darkMode, canEdit, onRemove, onClick }) {
  const { bg, text } = getStateColor(item.color, darkMode);
  return (
    <button
      type="button"
      title="This is the user's state. Ask an Admin to change it for you if you feel it is not accurate"
      onClick={onClick}
      className={styles.badge}
      style={{
        background: bg,
        color: text,
        cursor: canEdit ? 'pointer' : 'default',
      }}
    >
      {formatDate(item.selectedAt)} {item.emoji ? `${item.emoji} ${item.label}` : item.label}
      {canEdit && onRemove && (
        <button
          type="button"
          aria-label={`Remove ${item.label}`}
          onClick={e => {
            e.stopPropagation();
            onRemove(item.key);
          }}
          className={styles.badgeRemoveBtn}
        >
          ×
        </button>
      )}
    </button>
  );
}

UserStateBadge.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    emoji: PropTypes.string,
    color: PropTypes.string,
    selectedAt: PropTypes.string,
  }).isRequired,
  darkMode: PropTypes.bool.isRequired,
  canEdit: PropTypes.bool,
  onRemove: PropTypes.func,
  onClick: PropTypes.func,
};

UserStateBadge.defaultProps = {
  canEdit: false,
  onRemove: null,
  onClick: undefined,
};

export default UserStateBadge;
