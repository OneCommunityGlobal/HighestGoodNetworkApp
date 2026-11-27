import { useState } from 'react';
import { Button, Table } from 'reactstrap';
import EquipmentRecordModal from './EquipmentRecordModal';
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
  (Array.isArray(records) ? records : [])
    .map((record, index) => ({ ...record, index }))
    .sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0));

function EquipmentRecordSections({ equipment, onSaved }) {
  const [editor, setEditor] = useState(null);
  const updates = newestFirst(equipment?.updateRecord);
  const purchases = newestFirst(equipment?.purchaseRecord);
  const openEditor = (kind, record) => setEditor({ kind, record });

  return (
    <section className={styles.recordSections} aria-label="Equipment records">
      <details className={styles.recordSection}>
        <summary>Updates ({updates.length})</summary>
        {onSaved && <Button onClick={() => openEditor('updates')}>Add update</Button>}
        {updates.length === 0 ? (
          <p className={styles.emptyRecords}>No updates recorded.</p>
        ) : (
          <Table responsive className={styles.recordTable}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Updated by</th>
                <th scope="col">Condition</th>
                {onSaved && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {updates.map((record, index) => (
                <tr key={record._id || `${record.date}-${index}`}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatPerson(record.createdBy)}</td>
                  <td>{record.condition || 'Not available'}</td>
                  {onSaved && (
                    <td>
                      <Button size="sm" onClick={() => openEditor('updates', record)}>
                        Edit update
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </details>

      <details className={styles.recordSection}>
        <summary>Purchases ({purchases.length})</summary>
        {onSaved && <Button onClick={() => openEditor('purchases')}>Add purchase</Button>}
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
                {onSaved && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {purchases.map((record, index) => (
                <tr key={record._id || `${record.date}-${index}`}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatPerson(record.requestedBy)}</td>
                  <td>{record.status || 'Not available'}</td>
                  <td>{record.priority || 'Not available'}</td>
                  {onSaved && (
                    <td>
                      <Button size="sm" onClick={() => openEditor('purchases', record)}>
                        Edit purchase
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </details>
      {editor && (
        <EquipmentRecordModal
          equipmentId={equipment._id}
          editor={editor}
          onClose={() => setEditor(null)}
          onSaved={onSaved}
        />
      )}
    </section>
  );
}

export default EquipmentRecordSections;
