import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Table,
  Button,
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
import { fetchAllMaterials, postMaterialsBulkAction } from '~/actions/bmdashboard/materialsActions';
import RecordsModal from './RecordsModal';

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
  darkMode = false,
  itemType = 'Items',
}) {
  const dispatch = useDispatch();
  const [sortedData, setData] = useState(filteredItems);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [projectNameCol, setProjectNameCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });
  const [inventoryItemTypeCol, setInventoryItemTypeCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionsDropdownOpen, setBulkActionsDropdownOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [bulkNotesValue, setBulkNotesValue] = useState('');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const isMaterialsTable = itemType?.toLowerCase() === 'materials';

  useEffect(() => {
    setData(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    setInventoryItemTypeCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    setProjectNameCol({ iconsToDisplay: faSort, sortOrder: 'default' });
  }, [selectedProject, selectedItem]);

  useEffect(() => {
    // Reset selections when filtered items change
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [filteredItems]);

  useEffect(() => {
    setSelectAll(sortedData.length > 0 && selectedItems.size === sortedData.length);
  }, [selectedItems, sortedData]);

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

  const handleSelectAll = () => {
    if (!sortedData.length) {
      setSelectedItems(new Set());
      setSelectAll(false);
      return;
    }

    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(sortedData.map(item => item._id));
      setSelectedItems(allIds);
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

  const applyServerBulkAction = async (action, payload = {}) => {
    if (selectedItems.size === 0 || isBulkActionLoading) return;

    setIsBulkActionLoading(true);
    const response = await postMaterialsBulkAction({
      materialIds: Array.from(selectedItems),
      action,
      ...payload,
    });

    if (response?.status >= 200 && response?.status < 300) {
      toast.success(response.data?.result || 'Bulk action applied successfully.');
      dispatch(fetchAllMaterials());
      setSelectedItems(new Set());
      setSelectAll(false);
      setBulkActionsDropdownOpen(false);
    } else {
      const message = response?.data || 'Failed to apply bulk action.';
      toast.error(typeof message === 'string' ? message : 'Failed to apply bulk action.');
    }

    setIsBulkActionLoading(false);
  };

  const handleBulkAction = async action => {
    const selectedData = sortedData.filter(item => selectedItems.has(item._id));

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

  const formatValue = value => {
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === undefined || value === null || value === '') return '-';
    return value;
  };

  const exportToCsv = data => {
    if (data.length === 0) return;

    const headers = ['Project', 'Name', ...dynamicColumns.map(col => col.label), 'Stock Available'];
    const csvContent = [
      headers.join(','),
      ...data.map(item =>
        [
          item.project?.name || '',
          item.itemType?.name || '',
          ...dynamicColumns.map(col => formatValue(getNestedValue(item, col.key))),
          item.stockAvailable || '',
        ].join(','),
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
    document.body.removeChild(link);
  };

  const exportToPdf = data => {
    if (data.length === 0) return;

    // Using jspdf for PDF export
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${itemType} Selected Items`, 20, 20);

    let yPosition = 40;
    data.forEach((item, index) => {
      if (yPosition > 270) {
        // New page if needed
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(
        `${index + 1}. ${item.itemType?.name || 'Unknown'} (${item.project?.name ||
          'Unknown Project'})`,
        20,
        yPosition,
      );
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Available: ${item.stockAvailable || 0}`, 30, yPosition);
      yPosition += 15;
    });

    doc.save(`${itemType}_selected_items.pdf`);
  };

  const sortData = columnName => {
    const newSortedData = [...sortedData];

    if (columnName === 'ProjectName') {
      if (projectNameCol.sortOrder === 'default' || projectNameCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.project?.name || '').localeCompare(b.project?.name || ''));
        setProjectNameCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else if (projectNameCol.sortOrder === 'asc') {
        newSortedData.sort((a, b) => (b.project?.name || '').localeCompare(a.project?.name || ''));
        setProjectNameCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      setInventoryItemTypeCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    } else if (columnName === 'InventoryItemType') {
      if (
        inventoryItemTypeCol.sortOrder === 'default' ||
        inventoryItemTypeCol.sortOrder === 'desc'
      ) {
        newSortedData.sort((a, b) =>
          (a.itemType?.name || '').localeCompare(b.itemType?.name || ''),
        );
        setInventoryItemTypeCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else if (inventoryItemTypeCol.sortOrder === 'asc') {
        newSortedData.sort((a, b) =>
          (b.itemType?.name || '').localeCompare(a.itemType?.name || ''),
        );
        setInventoryItemTypeCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      setProjectNameCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    }

    setData(newSortedData);
  };

  const getNestedValue = (obj, path) =>
    path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);

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
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <Modal isOpen={notesModalOpen} toggle={() => setNotesModalOpen(false)}>
        <ModalHeader toggle={() => setNotesModalOpen(false)}>Add / Update Notes</ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            value={bulkNotesValue}
            onChange={e => setBulkNotesValue(e.target.value)}
            placeholder="Enter notes to apply to selected materials"
            rows={5}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setNotesModalOpen(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={submitBulkNotes}>
            Apply Notes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Bulk Actions */}
      {isMaterialsTable && (
        <div className={`${styles.bulkActionsContainer} ${darkMode ? styles.darkBulkActions : ''}`}>
          <span className={styles.selectedCount}>
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
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
          <thead>
            <tr>
              {isMaterialsTable && (
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    aria-label="Select all items"
                  />
                </th>
              )}
      {darkMode && (
        <style>
          {`
            .dark-mode .items_table_container .table thead th {
              background-color: #1C2541 !important;
              color: #ffffff !important;
              border-color: #555 !important;
            }

            .dark-mode .items_table_container .table thead tr {
              background-color: #1C2541 !important;
            }

            .dark-mode .items_table_container .table tbody tr:hover {
              background-color: #1C2541 !important;
            }
          `}
        </style>
      )}
      <div
        className={`items_table_container ${
          darkMode ? 'items_table_container_dark dark-mode' : ''
        }`}
        style={darkMode ? { backgroundColor: '#3A506B' } : {}}
      >
        <Table
          className={darkMode ? 'dark-table' : ''}
          style={
            darkMode ? { backgroundColor: '#3A506B', color: '#ffffff', borderColor: '#444' } : {}
          }
        >
          <thead
            className={darkMode ? 'dark-thead' : ''}
            style={darkMode ? { backgroundColor: '#1C2541', color: '#ffffff' } : {}}
          >
            <tr style={darkMode ? { backgroundColor: '#1C2541' } : {}}>
              {selectedProject === 'all' ? (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                  onClick={() => sortData('ProjectName')}
                >
                  Project <FontAwesomeIcon icon={projectNameCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Project
                </th>
              )}
              {selectedItem === 'all' ? (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                  onClick={() => sortData('InventoryItemType')}
                >
                  Name <FontAwesomeIcon icon={inventoryItemTypeCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                >
                  Name
                </th>
              )}
              {dynamicColumns.map(({ label, key }) => (
                <th
                  className={darkMode ? 'dark-th' : ''}
                  style={
                    darkMode
                      ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                      : {}
                  }
                  key={label}
                >
                  {label}
                </th>
              ))}
              {isMaterialsTable && <th>Bulk Status</th>}
              <th>Usage Record</th>
              <th>Updates</th>
              <th>Purchases</th>
              <th
                className={darkMode ? 'dark-th' : ''}
                style={
                  darkMode
                    ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                    : {}
                }
              >
                Updates
              </th>
              <th
                className={darkMode ? 'dark-th' : ''}
                style={
                  darkMode
                    ? { backgroundColor: '#1C2541', color: '#ffffff', borderColor: '#555' }
                    : {}
                }
              >
                Purchases
              </th>
            </tr>
          </thead>

          <tbody
            className={darkMode ? 'dark-tbody' : ''}
            style={darkMode ? { backgroundColor: '#3A506B', color: '#ffffff' } : {}}
          >
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(el => {
                const isSelected = selectedItems.has(el._id);
                const hasHold = Boolean(el.stockHold);
                const hasReview = Boolean(el.isReviewed);
                const hasNote = Boolean(el.notes?.trim());
                return (
                  <tr key={el._id} className={isSelected ? styles.selectedRow : ''}>
                    {isMaterialsTable && (
                      <td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(el._id)}
                          aria-label={`Select ${el.itemType?.name || 'item'}`}
                        />
                      </td>
                    )}
                    <td>{el.project?.name}</td>
                    <td>{el.itemType?.name}</td>
                    {dynamicColumns.map(({ label, key }) => (
                      <td key={label}>{formatValue(getNestedValue(el, key))}</td>
                    ))}
                    {isMaterialsTable && (
                      <td>
                        <div className={styles.bulkStatusCell}>
                          {Boolean(el.stockHold) && (
                            <span className={styles.bulkTagHold}>On Hold</span>
                          )}
                          {Boolean(el.isReviewed) && (
                            <span className={styles.bulkTagReviewed}>Reviewed</span>
                          )}
                          {Boolean(el.notes?.trim()) && (
                            <span className={styles.bulkTagNote}>Has Note</span>
                          )}
                          {!hasHold && !hasReview && !hasNote && (
                            <span className={styles.bulkTagNone}>-</span>
                          )}
                        </div>
                      </td>
                    )}
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
              sortedData.map(el => (
                <tr
                  key={el._id}
                  className={darkMode ? 'dark-row' : ''}
                  style={
                    darkMode ? { backgroundColor: '#3A506B', borderBottom: '1px solid #333' } : {}
                  }
                >
                  <td style={darkMode ? { color: '#ffffff' } : {}}>{el.project?.name}</td>
                  <td style={darkMode ? { color: '#ffffff' } : {}}>{el.itemType?.name}</td>
                  {dynamicColumns.map(({ label, key }) => (
                    <td key={label} style={darkMode ? { color: '#ffffff' } : {}}>
                      {getNestedValue(el, key)}
                    </td>
                  ))}
                  <td className="items_cell">
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'nowrap',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <button
                        type="button"
                        style={darkMode ? { color: '#4a90e2' } : {}}
                        onClick={() => handleEditRecordsClick(el, 'Update')}
                        aria-label="Edit Record"
                      >
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline={!darkMode}
                        style={darkMode ? { borderColor: '#4a90e2', color: '#ffffff' } : {}}
                        size="sm"
                        onClick={() => handleViewRecordsClick(el, 'Update')}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                  <td>
                    <Button
                      color="primary"
                      outline={!darkMode}
                      style={darkMode ? { borderColor: '#4a90e2', color: '#ffffff' } : {}}
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
                <td colSpan={isMaterialsTable ? 13 : 12} style={{ textAlign: 'center' }}>
                  No items data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
