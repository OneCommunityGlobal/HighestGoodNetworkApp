import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import RecordsModal from './RecordsModal';

export default function ItemsTable({
  selectedProject,
  selectedItem,
  filteredItems,
  UpdateItemModal,
  dynamicColumns,
}) {
  const [sortedData, setData] = useState(filteredItems);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  // const [recordType, setRecordType] = useState('');
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

  useEffect(() => {
    setData(filteredItems);
  }, [filteredItems]);

  useEffect(() => {
    const newSortedData = sortedData.map(obj => ({
      ...obj,
      usageTable: false,
      purchaseTable: false,
    }));
    setData(newSortedData);
  }, []);

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

  const handleViewRecordsClick = data => {
    // console.log(data._id);
    const updatedArray = sortedData.map(obj =>
      obj._id === data._id ? { ...obj, usageTable: !obj.usageTable } : obj,
    );
    setData(updatedArray);
    // setModal(true);
    // setRecord(data);
    // setRecordType(type);
  };

  const handlePurchaseRecordsClick = data => {
    // console.log(data._id);
    const updatedArray = sortedData.map(obj =>
      obj._id === data._id ? { ...obj, purchaseTable: !obj.purchaseTable } : obj,
    );
    setData(updatedArray);
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
        // recordType={recordType}
      />
      <UpdateItemModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <div className="items_table_container">
        <Table>
          <thead>
            <tr>
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
              <th>Update Record</th>
              <th>Purchases</th>
            </tr>
          </thead>

          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(el => {
                return (
                  <>
                    <tr key={el._id}>
                      <td>{el.project?.name}</td>
                      <td>{el.itemType?.name}</td>
                      {dynamicColumns.map(({ label, key }) => (
                        <td key={label}>{getNestedValue(el, key)}</td>
                      ))}
                      <td className="items_cell">
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
                      <td className="items_cell">
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
                          onClick={() => handlePurchaseRecordsClick(el, 'Purchase')}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                    {el.usageTable && (
                      <tr>
                        <td colSpan={11}>
                          <table className="subtable">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Used</th>
                                <th>Wasted</th>
                                {/* <th>Cause</th> */}
                                <th>Responsible</th>
                              </tr>
                            </thead>
                            <tbody>
                              {el.updateRecord.length ? (
                                el.updateRecord.map(data => {
                                  return (
                                    <tr key={data._id}>
                                      <td>{moment.utc(data.date).format('LL')}</td>
                                      <td>{data.quantityUsed || '-'}</td>
                                      <td>{data.quantityWasted || '-'}</td>
                                      <td>
                                        <a href={`/userprofile/${data.createdBy._id}`}>
                                          {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                                        </a>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={4} style={{ fontWeight: 'bold' }}>
                                    There are no updates for this item.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                    {el.purchaseTable && (
                      <tr>
                        <td colSpan={11}>
                          <table className="subtable">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Quantity</th>
                                <th>Brand</th>
                                <th>Requested By</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {el.purchaseRecord.length ? (
                                el.purchaseRecord.map(data => {
                                  return (
                                    <tr key={data._id}>
                                      <td>{moment.utc(data.date).format('LL')}</td>
                                      <td>{data.quantity || '-'}</td>
                                      <td>{data.brandPref || '-'}</td>
                                      <td>
                                        <a href={`/userprofile/${data.createdBy._id}`}>
                                          {`${data.createdBy.firstName} ${data.createdBy.lastName}`}
                                        </a>
                                      </td>
                                      <td>{data.status || '-'}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={4} style={{ fontWeight: 'bold' }}>
                                    There are no updates for this item.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                  // subtable && <tr>
                  //   <table>
                  //   </table>
                  // </tr>
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
