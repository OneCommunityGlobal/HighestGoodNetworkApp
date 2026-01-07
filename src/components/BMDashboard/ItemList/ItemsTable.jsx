import { useEffect, useState } from 'react';
import { Table, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSortDown,
  faSort,
  faSortUp,
  faDownload,
  faFileCsv,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import RecordsModal from './RecordsModal';
import styles from './ItemListView.module.css';

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
  darkMode = false,
  itemType = 'Items',
}) {
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
    setSelectAll(newSelected.size === sortedData.length);
  };

  const handleBulkAction = action => {
    const selectedData = sortedData.filter(item => selectedItems.has(item._id));

    switch (action) {
      case 'exportCsv':
        exportToCsv(selectedData);
        break;
      case 'exportPdf':
        exportToPdf(selectedData);
        break;
      case 'markAsHold':
        // TODO: Implement mark as hold
        console.log('Mark as hold:', selectedData);
        break;
      case 'markAsReviewed':
        // TODO: Implement mark as reviewed
        console.log('Mark as reviewed:', selectedData);
        break;
      case 'addUpdateNotes':
        // TODO: Implement add/update notes
        console.log('Add/update notes:', selectedData);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
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
          ...dynamicColumns.map(col => getNestedValue(item, col.key) || ''),
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

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
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

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className={`${styles.bulkActionsContainer} ${darkMode ? styles.darkBulkActions : ''}`}>
          <span className={styles.selectedCount}>
            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
          </span>
          <Dropdown
            isOpen={bulkActionsDropdownOpen}
            toggle={() => setBulkActionsDropdownOpen(!bulkActionsDropdownOpen)}
          >
            <DropdownToggle caret className={styles.bulkActionsButton}>
              Bulk Actions
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
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  aria-label="Select all items"
                />
              </th>
              {selectedProject === 'all' ? (
                <th onClick={() => sortData('ProjectName')}>
                  Project <FontAwesomeIcon icon={projectNameCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th>Project</th>
              )}
              {selectedItem === 'all' ? (
                <th onClick={() => sortData('InventoryItemType')}>
                  Name <FontAwesomeIcon icon={inventoryItemTypeCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th>Name</th>
              )}
              {dynamicColumns.map(({ label }) => (
                <th key={label}>{label}</th>
              ))}
              <th>Usage Record</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>

          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(el => {
                const isSelected = selectedItems.has(el._id);
                return (
                  <tr key={el._id} className={isSelected ? styles.selectedRow : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(el._id)}
                        aria-label={`Select ${el.itemType?.name || 'item'}`}
                      />
                    </td>
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
                );
              })
            ) : (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center' }}>
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
