import { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Badge } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import RecordsModal from './RecordsModal';
import styles from './ItemListView.module.css';

const rowsPerPageOptions = [25, 50, 100];

function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 2) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
  darkMode = false,
  itemType,
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

  const getNestedValue = (obj, path) =>
    path ? path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj) : null;

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

  const numericKeys = new Set(['stockBought', 'stockUsed', 'stockAvailable', 'stockWasted']);

  const getColumnStyle = (key, isAction = false) => {
    const base = { verticalAlign: 'middle' };
    if (key && numericKeys.has(key)) base.textAlign = 'right';
    if (isAction) {
      base.borderLeft = '2px solid #dee2e6';
      base.textAlign = 'center';
    }
    return base;
  };

  return (
    <>
      <RecordsModal
        modal={modal}
        setModal={setModal}
        record={record}
        setRecord={setRecord}
        recordType={recordType}
        itemType={itemType}
      />
      {UpdateItemModal && (
        <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      )}

      <div className={`${styles.itemsTableContainer} ${darkMode ? styles.darkTableWrapper : ''}`}>
        <Table className={darkMode ? styles.darkTable : ''}>
          <thead className={styles.stickyThead}>
            <tr>
              <th
                onClick={() => onSort?.('project')}
                className={styles.sortableTh}
                style={{ verticalAlign: 'middle' }}
              >
                Project <FontAwesomeIcon icon={getIconFor('project')} size="lg" />
              </th>
              <th
                onClick={() => onSort?.('name')}
                className={styles.sortableTh}
                style={{ verticalAlign: 'middle' }}
              >
                Name <FontAwesomeIcon icon={getIconFor('name')} size="lg" />
              </th>
              {(dynamicColumns || []).map(({ label, key }) => {
                const sortKey = dynamicSortKeyByLabel[label];
                const clickable = Boolean(sortKey);
                return (
                  <th
                    key={label || key}
                    onClick={clickable ? () => onSort?.(sortKey) : undefined}
                    className={clickable ? styles.sortableTh : undefined}
                    style={getColumnStyle(key)}
                  >
                    {label} {clickable && <FontAwesomeIcon icon={getIconFor(sortKey)} size="lg" />}
                  </th>
                );
              })}
              <th style={getColumnStyle(null, true)} title="View usage history and charts">
                Usage Record
              </th>
              <th
                style={{ verticalAlign: 'middle', textAlign: 'center' }}
                title="View history of manual updates"
              >
                Updates
              </th>
              <th
                style={{ verticalAlign: 'middle', textAlign: 'center' }}
                title="View procurement history"
              >
                Purchases
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map(el => (
                <tr key={el._id}>
                  <td style={{ verticalAlign: 'middle' }}>{el.project?.name}</td>
                  <td style={{ verticalAlign: 'middle' }}>{el.itemType?.name}</td>
                  {(dynamicColumns || []).map(({ label, key }) => {
                    const value = getNestedValue(el, key);
                    if (
                      key === 'stockAvailable' &&
                      value !== null &&
                      value !== undefined &&
                      Number(value) < 10
                    ) {
                      return (
                        <td key={label || key} style={getColumnStyle(key)}>
                          <Badge
                            color="danger"
                            pill
                            className="me-2"
                            style={{ marginRight: '8px' }}
                          >
                            Low
                          </Badge>
                          {value}
                        </td>
                      );
                    }
                    return (
                      <td key={label || key} style={getColumnStyle(key)}>
                        {value}
                      </td>
                    );
                  })}
                  <td className={styles.itemsCell} style={getColumnStyle(null, true)}>
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
                  <td
                    className={styles.itemsCell}
                    style={{ verticalAlign: 'middle', textAlign: 'center' }}
                  >
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
                  <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
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
                <td colSpan={(dynamicColumns?.length || 0) + 5} style={{ textAlign: 'center' }}>
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

ItemsTable.propTypes = {
  selectedProject: PropTypes.string,
  selectedItem: PropTypes.string,
  filteredItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      itemType: PropTypes.shape({
        name: PropTypes.string,
        unit: PropTypes.string,
      }),
      project: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
  ),
  UpdateItemModal: PropTypes.elementType,
  dynamicColumns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      key: PropTypes.string,
    }),
  ),
  darkMode: PropTypes.bool,
  itemType: PropTypes.string,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  onSort: PropTypes.func,
  totalItems: PropTypes.number,
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  rowsPerPage: PropTypes.number,
  startRow: PropTypes.number,
  endRow: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
};

ItemsTable.defaultProps = {
  selectedProject: '',
  selectedItem: '',
  filteredItems: [],
  UpdateItemModal: null,
  dynamicColumns: [],
  darkMode: false,
  itemType: '',
  sortConfig: { key: null, direction: 'asc' },
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  rowsPerPage: 25,
  startRow: 0,
  endRow: 0,
};
