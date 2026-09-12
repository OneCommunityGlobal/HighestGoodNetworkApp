import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Table,
  Button,
  Badge,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSortDown,
  faSort,
  faSortUp,
  faFileCsv,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchAllMaterials, postMaterialsBulkAction } from '~/actions/bmdashboard/materialsActions';
import RecordsModal from './RecordsModal';
import MaterialUsageChart from '../MaterialUsage/MaterialUsageChart';
import StockHealthIndicator from '../MaterialList/StockHealthIndicator';
import UsagePercentageBar from '../MaterialList/UsagePercentageBar';
import styles from './ItemListView.module.css';

const rowsPerPageOptions = [25, 50, 100];

function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 2) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
}

// The partial record a bulk action applies, used for the optimistic UI update.
function bulkActionPatch(action, notes) {
  if (action === 'hold') return { stockHold: true };
  if (action === 'review') return { isReviewed: true };
  if (action === 'notes') return { notes: (notes || '').trim() };
  return {};
}

// Unambiguous success message so the toast never shows a raw action code or "undefined".
function buildBulkActionMessage(action, count) {
  const noun = count === 1 ? 'material' : 'materials';
  if (action === 'hold') return `Marked ${count} ${noun} as On Hold.`;
  if (action === 'review') return `Marked ${count} ${noun} as Reviewed.`;
  if (action === 'notes') return `Added notes to ${count} ${noun}.`;
  return `Applied bulk action to ${count} ${noun}.`;
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
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionsDropdownOpen, setBulkActionsDropdownOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [bulkNotesValue, setBulkNotesValue] = useState('');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartProjectId, setChartProjectId] = useState(null);
  // Optimistic hold/review/note state keyed by material id, so the Bulk Status
  // column updates immediately; cleared once fresh server data arrives.
  const [statusOverrides, setStatusOverrides] = useState({});
  const isMaterialsView = itemType === 'Materials';
  const pageItems = filteredItems || [];

  // Reset selection whenever the visible rows change (filter, sort, or page change).
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
    setStatusOverrides({});
  }, [filteredItems]);

  useEffect(() => {
    setSelectAll(pageItems.length > 0 && selectedItems.size === pageItems.length);
  }, [selectedItems, pageItems]);

  const handleEditRecordsClick = (selectedEl, type) => {
    if (type === 'Update') {
      setUpdateModal(true);
      setUpdateRecord(selectedEl);
    }
  };

  const handleViewRecordsClick = (data, type) => {
    if (isMaterialsView && type === 'UsageRecord') {
      const projectId = data.project?._id || data.projectId;

      if (projectId) {
        setChartProjectId(projectId);
        setShowChartModal(true);
        return;
      }
    }

    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const handleSelectAll = () => {
    if (!pageItems.length) {
      setSelectedItems(new Set());
      setSelectAll(false);
      return;
    }

    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      setSelectedItems(new Set(pageItems.map(item => item._id)));
      setSelectAll(true);
    }
  };

  const handleSelectItem = itemId => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const formatValue = value => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === undefined || value === null || value === '') return '-';
    return value;
  };

  // Resolve a row's hold/review/note flags, merging any optimistic override.
  const getRowStatus = item => {
    const override = statusOverrides[item._id] || {};
    const noteText = override.notes ?? item.notes;
    return {
      hasHold: Boolean(item.stockHold || override.stockHold),
      hasReview: Boolean(item.isReviewed || override.isReviewed),
      hasNote: Boolean(noteText?.trim()),
    };
  };

  const bulkStatusText = item => {
    const { hasHold, hasReview, hasNote } = getRowStatus(item);
    const tags = [];
    if (hasHold) tags.push('On Hold');
    if (hasReview) tags.push('Reviewed');
    if (hasNote) tags.push('Has Note');
    return tags.length ? tags.join(', ') : '-';
  };

  // Round floats to 2 decimals to avoid noise like 1.806000000000001; pass other values through.
  const roundIfNumber = value =>
    typeof value === 'number' && !Number.isInteger(value) ? Number(value.toFixed(2)) : value;

  const getNestedValue = (obj, path) => {
    if (!path) return null;
    if (path === 'product id') return obj.productId ?? 'N/A';
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  };

  const filteredDynamicColumns = (dynamicColumns || []).filter(
    col => col.label !== 'Project' && col.label !== 'Name',
  );

  const emptyStateColSpan = 5 + filteredDynamicColumns.length + (isMaterialsView ? 4 : 0);

  const escapeCsv = value => {
    const str = String(value ?? '');
    // Prefix values that could be interpreted as spreadsheet formulas to prevent CSV
    // injection, but leave plain numbers (incl. negatives) and the empty placeholder intact.
    const isNumeric = str !== '' && !Number.isNaN(Number(str));
    const isFormulaRisk = !isNumeric && str !== '-' && /^[=+\-@]/.test(str);
    const sanitized = isFormulaRisk ? `'${str}` : str;
    return `"${sanitized.replaceAll('"', '""')}"`;
  };

  const exportToCsv = data => {
    if (data.length === 0) return;

    const headers = [
      'Project',
      'Name',
      ...filteredDynamicColumns.map(col => col.label),
      'Stock Available',
      ...(isMaterialsView ? ['Bulk Status'] : []),
    ];
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...data.map(item =>
        [
          item.project?.name || '',
          item.itemType?.name || '',
          ...filteredDynamicColumns.map(col => formatValue(getNestedValue(item, col.key))),
          item.stockAvailable || '',
          ...(isMaterialsView ? [bulkStatusText(item)] : []),
        ]
          .map(escapeCsv)
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${itemType}_selected_items.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportToPdf = data => {
    if (data.length === 0) return;

    // Landscape + line-wrapping keeps wide material tables readable instead of
    // squeezing headers like "Stock Available" into a single unreadable column.
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text(`${itemType} Selected Items`, 14, 16);

    const headers = [
      'Project',
      'Name',
      ...filteredDynamicColumns.map(col => col.label),
      'Stock Available',
      ...(isMaterialsView ? ['Bulk Status'] : []),
    ];
    const body = data.map(item => [
      item.project?.name || '',
      item.itemType?.name || '',
      ...filteredDynamicColumns.map(col =>
        formatValue(roundIfNumber(getNestedValue(item, col.key))),
      ),
      roundIfNumber(item.stockAvailable ?? 0),
      ...(isMaterialsView ? [bulkStatusText(item)] : []),
    ]);

    autoTable(doc, {
      startY: 24,
      head: [headers],
      body,
      headStyles: { fillColor: [0, 123, 255], halign: 'left' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });

    doc.save(`${itemType}_selected_items.pdf`);
  };

  const applyServerBulkAction = async (action, payload = {}) => {
    if (selectedItems.size === 0 || isBulkActionLoading) return;

    const selectedIds = Array.from(selectedItems);
    setIsBulkActionLoading(true);

    try {
      const result = await postMaterialsBulkAction({
        materialIds: selectedIds,
        action,
        ...payload,
      });
      // Prefer the real server count; fall back to the selection size if the
      // backend response omits it so the toast never reads "undefined".
      const count = result?.modifiedCount ?? result?.matchedCount ?? selectedIds.length;
      toast.success(buildBulkActionMessage(action, count));

      // Optimistically reflect the change in the Bulk Status column, then refetch
      // so the persisted server values become the source of truth.
      const patch = bulkActionPatch(action, payload.notes);
      setStatusOverrides(prev => {
        const next = { ...prev };
        selectedIds.forEach(id => {
          next[id] = { ...next[id], ...patch };
        });
        return next;
      });
      dispatch(fetchAllMaterials());

      setSelectedItems(new Set());
      setSelectAll(false);
      setBulkActionsDropdownOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to apply bulk action.');
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkAction = async action => {
    const selectedData = pageItems.filter(item => selectedItems.has(item._id));

    switch (action) {
      case 'exportCsv':
        exportToCsv(selectedData);
        break;
      case 'exportPdf':
        exportToPdf(selectedData);
        break;
      case 'markAsHold':
        await applyServerBulkAction('hold');
        break;
      case 'markAsReviewed':
        await applyServerBulkAction('review');
        break;
      case 'addUpdateNotes':
        setBulkNotesValue('');
        setNotesModalOpen(true);
        break;
      default:
        break;
    }
  };

  const submitBulkNotes = () => {
    const trimmedNotes = bulkNotesValue.trim();
    if (!trimmedNotes) {
      setNotesModalOpen(false);
      return;
    }

    applyServerBulkAction('notes', { notes: trimmedNotes });
    setNotesModalOpen(false);
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
      {showChartModal && chartProjectId && (
        <MaterialUsageChart
          projectId={chartProjectId}
          toggle={() => setShowChartModal(false)}
          darkMode={darkMode}
        />
      )}
      {UpdateItemModal && (
        <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      )}

      <Modal
        isOpen={notesModalOpen}
        toggle={() => setNotesModalOpen(false)}
        className={darkMode ? 'dark-modal' : ''}
        contentClassName={darkMode ? 'dark-oxford-modal' : ''}
      >
        <ModalHeader
          toggle={() => setNotesModalOpen(false)}
          className={darkMode ? 'dark-modal-header bg-space-cadet text-white' : ''}
        >
          Add / Update Notes
        </ModalHeader>
        <ModalBody className={darkMode ? 'dark-modal-body bg-yinmn-blue text-light' : ''}>
          <Input
            type="textarea"
            value={bulkNotesValue}
            onChange={e => setBulkNotesValue(e.target.value)}
            placeholder="Enter notes to apply to selected materials"
            rows={5}
          />
        </ModalBody>
        <ModalFooter className={darkMode ? 'dark-modal-footer bg-space-cadet text-white' : ''}>
          <Button color="secondary" outline onClick={() => setNotesModalOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={submitBulkNotes}>
            Apply Notes
          </Button>
        </ModalFooter>
      </Modal>

      {isMaterialsView && (
        <div className={`${styles.bulkActionsContainer} ${darkMode ? styles.darkBulkActions : ''}`}>
          <span className={styles.selectedCount}>
            {selectedItems.size} item{selectedItems.size === 1 ? '' : 's'} selected
          </span>
          <Dropdown
            disabled={selectedItems.size === 0 || isBulkActionLoading}
            isOpen={bulkActionsDropdownOpen}
            toggle={() => {
              if (selectedItems.size === 0 || isBulkActionLoading) return;
              setBulkActionsDropdownOpen(!bulkActionsDropdownOpen);
            }}
          >
            <DropdownToggle
              caret
              className={styles.bulkActionsButton}
              disabled={selectedItems.size === 0 || isBulkActionLoading}
            >
              {isBulkActionLoading ? 'Applying...' : 'Bulk Actions'}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleBulkAction('markAsHold')}>
                Mark as Hold
              </DropdownItem>
              <DropdownItem onClick={() => handleBulkAction('markAsReviewed')}>
                Mark as Reviewed
              </DropdownItem>
              <DropdownItem onClick={() => handleBulkAction('addUpdateNotes')}>
                Add/Update Notes
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={() => handleBulkAction('exportCsv')}>
                <FontAwesomeIcon icon={faFileCsv} style={{ marginRight: '8px' }} />
                Export Selected (CSV)
              </DropdownItem>
              <DropdownItem onClick={() => handleBulkAction('exportPdf')}>
                <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: '8px' }} />
                Export Selected (PDF)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}

      <div className={`${styles.itemsTableContainer} ${darkMode ? styles.darkTableWrapper : ''}`}>
        <Table className={darkMode ? styles.darkTable : ''}>
          <thead className={styles.stickyThead}>
            <tr>
              {isMaterialsView && (
                <th style={{ verticalAlign: 'middle' }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    aria-label="Select all items"
                  />
                </th>
              )}
              <th
                onClick={() => onSort?.('project')}
                className={styles.sortableTh}
                style={{ verticalAlign: 'middle', textAlign: 'center' }}
              >
                <span className={styles.thContent}>
                  Project <FontAwesomeIcon icon={getIconFor('project')} />
                </span>
              </th>
              <th
                onClick={() => onSort?.('name')}
                className={styles.sortableTh}
                style={{ verticalAlign: 'middle', textAlign: 'center' }}
              >
                <span className={styles.thContent}>
                  Name <FontAwesomeIcon icon={getIconFor('name')} />
                </span>
              </th>
              {(filteredDynamicColumns || []).map(({ label, key }) => {
                const sortKey = dynamicSortKeyByLabel[label];
                const clickable = Boolean(sortKey);
                return (
                  <th
                    key={label || key}
                    onClick={clickable ? () => onSort?.(sortKey) : undefined}
                    className={clickable ? styles.sortableTh : undefined}
                    style={getColumnStyle(key)}
                  >
                    <span className={styles.thContent}>
                      {label} {clickable && <FontAwesomeIcon icon={getIconFor(sortKey)} />}
                    </span>
                  </th>
                );
              })}
              {isMaterialsView && <th style={{ verticalAlign: 'middle' }}>Bulk Status</th>}
              {isMaterialsView && <th style={getColumnStyle(null)}>Usage %</th>}
              {isMaterialsView && <th style={getColumnStyle(null)}>Stock Health</th>}
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
            {pageItems.length > 0 ? (
              pageItems.map(el => {
                const isSelected = selectedItems.has(el._id);
                const { hasHold, hasReview, hasNote } = getRowStatus(el);

                return (
                  <tr key={el._id} className={isSelected ? styles.selectedRow : ''}>
                    {isMaterialsView && (
                      <td style={{ verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(el._id)}
                          aria-label={`Select ${el.itemType?.name || 'item'}`}
                        />
                      </td>
                    )}
                    <td style={{ verticalAlign: 'middle' }}>{el.project?.name}</td>
                    <td style={{ verticalAlign: 'middle' }}>{el.itemType?.name}</td>
                    {(filteredDynamicColumns || []).map(({ label, key }) => {
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
                    {isMaterialsView && (
                      <td style={{ verticalAlign: 'middle' }}>
                        <div className={styles.bulkStatusCell}>
                          {hasHold && <span className={styles.bulkTagHold}>On Hold</span>}
                          {hasReview && <span className={styles.bulkTagReviewed}>Reviewed</span>}
                          {hasNote && <span className={styles.bulkTagNote}>Has Note</span>}
                          {!hasHold && !hasReview && !hasNote && (
                            <span className={styles.bulkTagNone}>-</span>
                          )}
                        </div>
                      </td>
                    )}
                    {isMaterialsView && (
                      <td style={getColumnStyle(null)}>
                        <UsagePercentageBar material={el} darkMode={darkMode} />
                      </td>
                    )}
                    {isMaterialsView && (
                      <td style={getColumnStyle(null)}>
                        <StockHealthIndicator material={el} darkMode={darkMode} />
                      </td>
                    )}
                    <td
                      className={`${styles.itemsCell} ${styles.actionCell}`}
                      style={getColumnStyle(null, true)}
                    >
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
                      className={`${styles.itemsCell} ${styles.actionCell}`}
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
                    <td
                      className={styles.actionCell}
                      style={{ verticalAlign: 'middle', textAlign: 'center' }}
                    >
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
                );
              })
            ) : (
              <tr>
                <td colSpan={emptyStateColSpan} style={{ textAlign: 'center' }}>
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
  filteredItems: PropTypes.arrayOf(PropTypes.object),
  UpdateItemModal: PropTypes.elementType,
  dynamicColumns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      key: PropTypes.string,
    }),
  ).isRequired,
  darkMode: PropTypes.bool,
  itemType: PropTypes.string,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.string,
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
