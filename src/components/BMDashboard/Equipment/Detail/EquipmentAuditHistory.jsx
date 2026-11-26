import { Table } from 'reactstrap';
import styles from './EquipmentDetailPage.module.css';

const fieldLabels = {
  project: 'Project ID',
  equipmentClass: 'Class',
  purchaseStatus: 'Ownership',
  currentUsage: 'Current usage',
  condition: 'Condition',
};

function actorName(actor) {
  if (typeof actor === 'string') return actor;
  return (
    [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') || actor?._id || 'Unknown user'
  );
}

function EquipmentAuditHistory({ entries = [] }) {
  return (
    <section className={styles.recordSections} aria-labelledby="equipment-audit-history">
      <div className={styles.recordSection}>
        <h2 id="equipment-audit-history">Audit History</h2>
        {entries.length === 0 ? (
          <p>No detail edits recorded yet.</p>
        ) : (
          <Table responsive className={styles.recordTable}>
            <thead>
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">User</th>
                <th scope="col">Field</th>
                <th scope="col">Old value</th>
                <th scope="col">New value</th>
              </tr>
            </thead>
            <tbody>
              {[...entries]
                .reverse()
                .map(({ _id, timestamp, actor, field, oldValue, newValue }) => (
                  <tr key={_id}>
                    <td>
                      <time dateTime={timestamp}>{new Date(timestamp).toLocaleString()}</time>
                    </td>
                    <td>{actorName(actor)}</td>
                    <td>{fieldLabels[field] || field}</td>
                    <td>{oldValue || '—'}</td>
                    <td>{newValue || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </div>
    </section>
  );
}

export default EquipmentAuditHistory;
