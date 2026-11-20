import { permissionLabelKeyMappingObj } from './PermissionsConst';
import { listPermissionChanges } from './permissionChanges';
import styles from './PermissionChangesList.module.css';

const labelOf = key => permissionLabelKeyMappingObj[key] || key;

// Live list of unsaved permission changes
function PermissionChangesList({
  saved,
  draft,
  roleDefaults = [],
  emptyText,
  extraLine,
  scrollable = false,
}) {
  const { added, removed } = listPermissionChanges(saved, draft);

  const removedName = key =>
    roleDefaults.includes(key) ? `${labelOf(key)} (role default)` : labelOf(key);

  // Names joined with semicolons, since one permission name has a comma
  // aria-live="off": the role page's role="alert" box would re-read the list on each change
  return (
    <div
      className={`${styles.permissionChangesList} ${
        scrollable ? styles.permissionChangesListScrollable : ''
      }`}
      data-testid="permission-changes"
      aria-live="off"
      role={scrollable ? 'region' : undefined}
      tabIndex={scrollable ? 0 : undefined}
      aria-label={scrollable ? 'Unsaved permission changes' : undefined}
    >
      {extraLine && <p className={styles.permissionChangesLine}>{extraLine}</p>}
      {added.length === 0 && removed.length === 0 && (
        <p className={styles.permissionChangesLine}>{emptyText}</p>
      )}
      {added.length > 0 && (
        <p className={styles.permissionChangesLine}>
          <strong>Permissions Added:</strong>{' '}
          <span data-testid="permissions-added">{added.map(labelOf).join('; ')}</span>
        </p>
      )}
      {removed.length > 0 && (
        <p className={styles.permissionChangesLine}>
          <strong>Permissions Removed:</strong>{' '}
          <span data-testid="permissions-removed">{removed.map(removedName).join('; ')}</span>
        </p>
      )}
    </div>
  );
}

export default PermissionChangesList;
