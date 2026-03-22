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
  itemType,
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

  const [boughtCol, setBoughtCol] = useState({ iconsToDisplay: faSort, sortOrder: 'default' });
  const [usedCol, setUsedCol] = useState({ iconsToDisplay: faSort, sortOrder: 'default' });
  const [availableCol, setAvailableCol] = useState({
    iconsToDisplay: faSort,
  });
  const [wastedCol, setWastedCol] = useState({ iconsToDisplay: faSort, sortOrder: 'default' });

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
        return;
      }
    }

    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const resetOtherDynamicColumns = active => {
    if (active !== 'Bought') setBoughtCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    if (active !== 'Used') setUsedCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    if (active !== 'Available') setAvailableCol({ iconsToDisplay: faSort, sortOrder: 'default' });
    if (active !== 'Wasted') setWastedCol({ iconsToDisplay: faSort, sortOrder: 'default' });
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
    // Sorting for Bought
    if (columnName === 'Bought') {
      if (boughtCol.sortOrder === 'default' || boughtCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockBought || 0) - (b.stockBought || 0));
        setBoughtCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockBought || 0) - (a.stockBought || 0));
        setBoughtCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Bought');
    }

    // Sorting for Used
    if (columnName === 'Used') {
      if (usedCol.sortOrder === 'default' || usedCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockUsed || 0) - (b.stockUsed || 0));
        setUsedCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockUsed || 0) - (a.stockUsed || 0));
        setUsedCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Used');
    }

    // Sorting for Available
    if (columnName === 'Available') {
      if (availableCol.sortOrder === 'default' || availableCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockAvailable || 0) - (b.stockAvailable || 0));
        setAvailableCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockAvailable || 0) - (a.stockAvailable || 0));
        setAvailableCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Available');
    }

    // Sorting for Wasted
    if (columnName === 'Wasted') {
      if (wastedCol.sortOrder === 'default' || wastedCol.sortOrder === 'desc') {
        newSortedData.sort((a, b) => (a.stockWasted || 0) - (b.stockWasted || 0));
        setWastedCol({ iconsToDisplay: faSortUp, sortOrder: 'asc' });
      } else {
        newSortedData.sort((a, b) => (b.stockWasted || 0) - (a.stockWasted || 0));
        setWastedCol({ iconsToDisplay: faSortDown, sortOrder: 'desc' });
      }
      resetOtherDynamicColumns('Wasted');
    }
    setData(newSortedData);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : null), obj);
  };

  const stickyHeaderStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: darkMode ? '#343a40' : '#f8f9fa',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    verticalAlign: 'middle',
  };

  const numericHeaderStyle = { ...stickyHeaderStyle, textAlign: 'right' };
  const numericCellStyle = { textAlign: 'right', verticalAlign: 'middle' };

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

  const renderActionCell = (el, type, cellStyle, showEdit = true) => (
    <td style={cellStyle}>
      <div className="d-flex justify-content-center">
        {showEdit && (
          <button
            type="button"
            className="btn btn-sm btn-link p-1"
            onClick={() => handleEditRecordsClick(el, type)}
            aria-label="Edit Record"
            style={{ fontSize: '1.2em' }}
          >
            <BiPencil />
          </button>
        )}
        <Button color="primary" outline size="sm" onClick={() => handleViewRecordsClick(el, type)}>
          View
        </Button>
      </div>
    </td>
  );

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
        <MaterialUsageChart projectId={chartProjectId} toggle={() => setShowChartModal(false)} />
      )}

      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />

      <div
        className={`${styles.itemsTableContainer} ${darkMode ? styles.darkTableWrapper : ''}`}
        style={{ maxHeight: '75vh', overflowY: 'auto', position: 'relative' }}
      >
        <Table className={darkMode ? styles.darkTable : ''} hover responsive>
          <thead>
            <tr>
              {selectedProject === 'all' ? (
                <th onClick={() => sortData('ProjectName')} style={stickyHeaderStyle}>
                  Project <FontAwesomeIcon icon={projectNameCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th style={stickyHeaderStyle}>Project</th>
              )}
              {selectedItem === 'all' ? (
                <th onClick={() => sortData('InventoryItemType')} style={stickyHeaderStyle}>
                  Name <FontAwesomeIcon icon={inventoryItemTypeCol.iconsToDisplay} size="lg" />
                </th>
              ) : (
                <th style={stickyHeaderStyle}>Name</th>
              )}
              {dynamicColumns.map(({ label, key }) => {
                const stateMap = {
                  Bought: boughtCol,
                  Used: usedCol,
                  Available: availableCol,
                  Wasted: wastedCol,
                };
                const isNumeric = [
                  'stockBought',
                  'stockUsed',
                  'stockAvailable',
                  'stockWasted',
                ].includes(key);

                return (
                  <th
                    key={label}
                    onClick={() => sortData(label)}
                    style={isNumeric ? numericHeaderStyle : stickyHeaderStyle}
                  >
                    {label}{' '}
                    <FontAwesomeIcon icon={stateMap[label]?.iconsToDisplay || faSort} size="lg" />
                  </th>
                );
              })}
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

                    {renderActionCell(el, 'UsageRecord', actionCellStyle, true)}
                    {renderActionCell(
                      el,
                      'Update',
                      { textAlign: 'center', verticalAlign: 'middle' },
                      true,
                    )}
                    {renderActionCell(
                      el,
                      'Purchase',
                      { textAlign: 'center', verticalAlign: 'middle' },
                      false,
                    )}
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
