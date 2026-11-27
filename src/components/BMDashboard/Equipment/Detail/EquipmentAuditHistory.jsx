import { Button, Table } from 'reactstrap';
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

function csvCell(value) {
  const text = String(value ?? '');
  // Prevent spreadsheets from interpreting exported user data as a formula.
  const safeText = /^\s*[=+@-]|^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function downloadAuditHistory(equipmentId, entries) {
  const rows = [
    ['Timestamp (UTC)', 'User', 'Field', 'Old value', 'New value'],
    ...entries.map(({ timestamp, actor, field, oldValue, newValue }) => [
      new Date(timestamp).toISOString(),
      actorName(actor),
      fieldLabels[field] || field,
      oldValue,
      newValue,
    ]),
  ];
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `equipment-${equipmentId}-audit-history.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function EquipmentAuditHistory({ equipmentId, entries = [], projectOptions = [] }) {
  const newestFirst = [...entries].reverse();
  const projectNames = new Map(projectOptions.map(({ value, label }) => [value, label]));
  const displayValue = (field, value) => {
    if (!value) return '—';
    return field === 'project' ? projectNames.get(value) || value : value;
  };
  return (
    <section className={styles.recordSections} aria-labelledby="equipment-audit-history">
      <div className={styles.recordSection}>
        <h2 id="equipment-audit-history">Audit History</h2>
        <Button
          type="button"
          color="secondary"
          outline
          disabled={entries.length === 0}
          onClick={() => downloadAuditHistory(equipmentId, newestFirst)}
        >
          Export CSV
        </Button>
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
              {newestFirst.map(({ _id, timestamp, actor, field, oldValue, newValue }) => (
                <tr key={_id}>
                  <td>
                    <time dateTime={timestamp}>{new Date(timestamp).toLocaleString()}</time>
                  </td>
                  <td>{actorName(actor)}</td>
                  <td>{field === 'project' ? 'Project' : fieldLabels[field] || field}</td>
                  <td>{displayValue(field, oldValue)}</td>
                  <td>{displayValue(field, newValue)}</td>
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
