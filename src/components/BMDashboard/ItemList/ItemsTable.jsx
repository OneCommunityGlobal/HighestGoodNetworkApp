import { useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import RecordsModal from './RecordsModal';
import styles from './ItemListView.module.css';

const rowsPerPageOptions = [25, 50, 100];

function generatePageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
  darkMode = false,
  sortConfig,
  onSort,
  totalItems,
  currentPage,
  totalPages,
  rowsPerPage,
  startRow,
  endRow,
  onPageChange,
  onRowsPerPageChange,
}) {
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);

  const handleEditRecordsClick = (selectedEl, type) => {
    if (type === 'Update') {
      setUpdateModal(true);
      setUpdateRecord(selectedEl);
    }
  };

  const handleViewRecordsClick = (data, type) => {
    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  };

  const getIconFor = key => {
    if (!sortConfig?.key || sortConfig.key !== key) return faSort;
    return sortConfig.direction === 'asc' ? faSortUp : faSortDown;
  };

  const dynamicSortKeyByLabel = {
    Bought: 'bought',
    Used: 'used',
    Available: 'available',
    Wasted: 'wasted',
    Hold: 'hold',
  };

  return (
    <>
      <RecordsModal
        modal={modal}
        setModal={setModal}
        record={record}
        setRecord={setRecord}
        recordType={recordType}
      />
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />

      <div className={`${styles.itemsTableContainer} ${darkMode ? styles.darkTableWrapper : ''}`}>
        <Table className={darkMode ? styles.darkTable : ''}>
          <thead className={styles.stickyThead}>
            <tr>
              <th onClick={() => onSort?.('project')} className={styles.sortableTh}>
                Project <FontAwesomeIcon icon={getIconFor('project')} size="lg" />
              </th>

              <th onClick={() => onSort?.('name')} className={styles.sortableTh}>
                Name <FontAwesomeIcon icon={getIconFor('name')} size="lg" />
              </th>

              {dynamicColumns.map(({ label }) => {
                const sortKey = dynamicSortKeyByLabel[label];
                const clickable = Boolean(sortKey);

                return (
                  <th
                    key={label}
                    onClick={clickable ? () => onSort?.(sortKey) : undefined}
                    className={clickable ? styles.sortableTh : undefined}
                  >
                    {label} {clickable && <FontAwesomeIcon icon={getIconFor(sortKey)} size="lg" />}
                  </th>
                );
              })}

              <th>Usage Record</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map(el => (
                <tr key={el._id}>
                  <td>{el.project?.name}</td>
                  <td>{el.itemType?.name}</td>

                  {dynamicColumns.map(({ label, key }) => (
                    <td key={label}>{getNestedValue(el, key)}</td>
                  ))}

                  <td className={`${styles.itemsCell}`}>
                    <button
                      type="button"
                      onClick={() => handleEditRecordsClick(el, 'UsageRecord')}
                      aria-label="Edit Record"
                    >
                      <BiPencil />
                    </button>
                    <Button
                      color="primary"
                      outline
                      size="sm"
                      onClick={() => handleViewRecordsClick(el, 'UsageRecord')}
                    >
                      View
                    </Button>
                  </td>

                  <td className={`${styles.itemsCell}`}>
                    <button
                      type="button"
                      onClick={() => handleEditRecordsClick(el, 'Update')}
                      aria-label="Edit Record"
                    >
                      <BiPencil />
                    </button>
                    <Button
                      color="primary"
                      outline
                      size="sm"
                      onClick={() => handleViewRecordsClick(el, 'Update')}
                    >
                      View
                    </Button>
                  </td>

                  <td>
                    <Button
                      color="primary"
                      outline
                      size="sm"
                      onClick={() => handleViewRecordsClick(el, 'Purchase')}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={dynamicColumns.length + 5} style={{ textAlign: 'center' }}>
                  No items data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <div className={styles.paginationBar}>
        <div className={styles.rowsPerPage}>
          <span>Rows per page:</span>
          <select
            value={String(rowsPerPage)}
            onChange={e => onRowsPerPageChange?.(Number(e.target.value))}
          >
            {rowsPerPageOptions.map(opt => (
              <option key={opt} value={String(opt)}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.rangeInfo}>
          {startRow}-{endRow} of {totalItems}
        </div>

        <div className={styles.pageButtons}>
          <button type="button" onClick={() => onPageChange?.(1)} disabled={currentPage === 1}>
            {'<<'}
          </button>

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {'<'}
          </button>

          {generatePageNumbers(currentPage, totalPages).map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                className={p === currentPage ? styles.activePage : ''}
                onClick={() => onPageChange?.(p)}
                disabled={p === currentPage}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className={styles.ellipsis}>
                ...
              </span>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {'>'}
          </button>

          <button
            type="button"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage === totalPages}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </>
  );
}
