import { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import RecordsModal from './RecordsModal';
import MaterialUsageChart from '../MaterialUsage/MaterialUsageChart';
import styles from './ItemListView.module.css';

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
  darkMode = false,
}) {
  const [sortedData, setData] = useState(filteredItems);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartProjectId, setChartProjectId] = useState(null);
  const [projectNameCol, setProjectNameCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });
  const [inventoryItemTypeCol, setInventoryItemTypeCol] = useState({
    iconsToDisplay: faSort,
    sortOrder: 'default',
  });

  useEffect(() => {
    setData(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    setInventoryItemTypeCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    setProjectNameCol({ iconsToDisplay: faSort, sortOrder: 'default' });
  }, [selectedProject, selectedItem]);

  const handleEditRecordsClick = (selectedEl, type) => {
    if (type === 'Update') {
      setUpdateModal(true);
      setUpdateRecord(selectedEl);
    }
  };

  const handleViewRecordsClick = (data, type) => {
    if (type === 'UsageRecord') {
      const projectId = data.project?._id || data.projectId;
      if (projectId) {
        setChartProjectId(projectId);
        setShowChartModal(true);
      } else {
        setModal(true);
        setRecord(data);
        setRecordType(type);
      }
    } else {
      setModal(true);
      setRecord(data);
      setRecordType(type);
    }
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

  // --- STYLES FOR VISUAL ENHANCEMENTS ---
  const stickyHeaderStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: darkMode ? '#343a40' : '#f8f9fa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    verticalAlign: 'middle',
  };

  // Right-align numeric columns
  const numericHeaderStyle = { ...stickyHeaderStyle, textAlign: 'right' };
  const numericCellStyle = { textAlign: 'right', verticalAlign: 'middle' };

  // Visual Divider for Action Columns
  const actionHeaderStyle = {
    ...stickyHeaderStyle,
    borderLeft: '2px solid #dee2e6',
    textAlign: 'center',
  };
  const actionCellStyle = {
    borderLeft: '2px solid #dee2e6',
    textAlign: 'center',
    verticalAlign: 'middle',
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

      {showChartModal && chartProjectId && (
        <MaterialUsageChart projectId={chartProjectId} toggle={() => setShowChartModal(false)} />
      )}

      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />

      {/* Container with max-height to enable Sticky Header scrolling */}
      <div
        className={`${styles.itemsTableContainer} ${darkMode ? styles.darkTableWrapper : ''}`}
        style={{ maxHeight: '75vh', overflowY: 'auto', position: 'relative' }}
      >
        <Table className={darkMode ? styles.darkTable : ''} hover responsive>
          <thead>
            <tr>
              {/* Project Column */}
              <th onClick={() => sortData('ProjectName')} style={stickyHeaderStyle}>
                Project <FontAwesomeIcon icon={projectNameCol.iconsToDisplay} />
              </th>

              {/* Name Column */}
              <th onClick={() => sortData('InventoryItemType')} style={stickyHeaderStyle}>
                Name <FontAwesomeIcon icon={inventoryItemTypeCol.iconsToDisplay} />
              </th>

              {/* Dynamic Columns (Unit, Bought, Used, Available, Waste) */}
              {dynamicColumns.map(({ label, key }) => {
                // Check if this is a numeric column to apply right-alignment
                const isNumeric = [
                  'stockBought',
                  'stockUsed',
                  'stockAvailable',
                  'stockWasted',
                ].includes(key);
                return (
                  <th key={label} style={isNumeric ? numericHeaderStyle : stickyHeaderStyle}>
                    {label}
                  </th>
                );
              })}

              {/* ACTION COLUMNS (Grouped with Border) */}
              <th style={actionHeaderStyle} title="View usage history and charts">
                Usage Record
              </th>
              <th style={stickyHeaderStyle} title="View history of manual updates">
                Updates
              </th>
              <th style={stickyHeaderStyle} title="View procurement history">
                Purchases
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(el => {
                return (
                  <tr key={el._id}>
                    <td style={{ verticalAlign: 'middle' }}>{el.project?.name}</td>
                    <td style={{ verticalAlign: 'middle' }}>{el.itemType?.name}</td>

                    {dynamicColumns.map(({ label, key }) => {
                      const value = getNestedValue(el, key);
                      const isNumeric = [
                        'stockBought',
                        'stockUsed',
                        'stockAvailable',
                        'stockWasted',
                      ].includes(key);

                      // LOW STOCK BADGE LOGIC
                      if (key === 'stockAvailable') {
                        const isLowStock = Number(value) < 10;
                        return (
                          <td key={label} style={numericCellStyle}>
                            {isLowStock && (
                              <Badge
                                color="danger"
                                pill
                                className="mr-2"
                                style={{ marginRight: '8px' }}
                              >
                                Low
                              </Badge>
                            )}
                            {value}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={label}
                          style={isNumeric ? numericCellStyle : { verticalAlign: 'middle' }}
                        >
                          {value}
                        </td>
                      );
                    })}

                    {/* Action Buttons with Divider */}
                    <td style={actionCellStyle}>
                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-1"
                          onClick={() => handleEditRecordsClick(el, 'UsageRecord')}
                          aria-label="Edit Record"
                          style={{ fontSize: '1.2em' }}
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
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div className="d-flex justify-content-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-link p-1"
                          onClick={() => handleEditRecordsClick(el, 'Update')}
                          aria-label="Edit Record"
                          style={{ fontSize: '1.2em' }}
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
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
                <td colSpan={11} style={{ textAlign: 'center' }}>
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
