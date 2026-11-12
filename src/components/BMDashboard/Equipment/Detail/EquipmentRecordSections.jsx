import { Table } from 'reactstrap';
import styles from './EquipmentDetailPage.module.css';

const formatDate = value => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString();
};

const formatPerson = person => {
  if (!person || typeof person !== 'object') return 'Not available';
  return `${person.firstName || ''} ${person.lastName || ''}`.trim() || 'Not available';
};

const newestFirst = records =>
  [...(Array.isArray(records) ? records : [])].sort(
    (first, second) => new Date(second.date || 0) - new Date(first.date || 0),
  );

function EquipmentRecordSections({ equipment }) {
  const updates = newestFirst(equipment?.updateRecord);
  const purchases = newestFirst(equipment?.purchaseRecord);

  return (
    <section className={styles.recordSections} aria-label="Equipment records">
      <details className={styles.recordSection}>
        <summary>Updates ({updates.length})</summary>
        {updates.length === 0 ? (
          <p className={styles.emptyRecords}>No updates recorded.</p>
        ) : (
          <Table responsive className={styles.recordTable}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Updated by</th>
                <th scope="col">Condition</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((record, index) => (
                <tr key={record._id || `${record.date}-${index}`}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatPerson(record.createdBy)}</td>
                  <td>{record.condition || 'Not available'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </details>

      <details className={styles.recordSection}>
        <summary>Purchases ({purchases.length})</summary>
        {purchases.length === 0 ? (
          <p className={styles.emptyRecords}>No purchases recorded.</p>
        ) : (
          <Table responsive className={styles.recordTable}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Requested by</th>
                <th scope="col">Status</th>
                <th scope="col">Priority</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((record, index) => (
                <tr key={record._id || `${record.date}-${index}`}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatPerson(record.requestedBy)}</td>
                  <td>{record.status || 'Not available'}</td>
                  <td>{record.priority || 'Not available'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </details>
    </section>
  );
}

export default EquipmentRecordSections;
