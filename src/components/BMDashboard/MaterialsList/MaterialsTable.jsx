import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';

import { resetMaterialUpdate } from 'actions/bmdashboard/materialsActions';
import { useDispatch } from 'react-redux';
import RecordsModal from './RecordsModal';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';

export default function MaterialsTable({ filteredMaterials }) {
  const dispatch = useDispatch();
  const [sortedData, setData] = useState(null);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [order, setOrder] = useState('default');
  const [iconToDisplay, setIconToDisplay] = useState(faSort);

  useEffect(() => {
    if (filteredMaterials && filteredMaterials.length > 0) {
      setData(filteredMaterials);
    }
  }, [filteredMaterials]);

  // Update Material Form
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);

  const handleEditRecordsClick = (selectedMaterial, type) => {
    if (type === 'Update') {
      dispatch(resetMaterialUpdate());
      setUpdateModal(true);
      setUpdateRecord(selectedMaterial);
    }
  };

  const handleViewRecordsClick = (data, type) => {
    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const sortingAsc = columnName => {
    let sorted = [];
    if (columnName === 'ProjectName') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.project?.name >= b.project?.name ? 1 : -1));
    } else if (columnName === 'InventoryItemType') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.itemType?.name >= b.itemType?.name ? 1 : -1));
    }

    setData(sorted);
    setOrder('asc');
    setIconToDisplay(faSortUp);
  };

  const sortingDesc = columnName => {
    let sorted = [];
    if (columnName === 'ProjectName') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.project?.name <= b.project?.name ? 1 : -1));
    } else if (columnName === 'InventoryItemType') {
      sorted = []
        .concat(...sortedData)
        .sort((a, b) => (a.itemType?.name <= b.itemType?.name ? 1 : -1));
    }

    setData(sorted);
    setOrder('desc');
    setIconToDisplay(faSortDown);
  };

  // const doSorting = columnName => {
  //   if (order === '▼') {
  //     sortingAsc(columnName);
  //   }
  //   else if(order === '▲'){
  //     sortingDesc(columnName);
  //   }
  //  else {
  //     setData(filteredMaterials);
  //   }
  // };

  const doSorting = columnName => {
    if (order === 'desc') {
      setData(filteredMaterials);
      setIconToDisplay(faSort);
      setOrder('normal');
    } else if (order === 'asc') {
      sortingDesc(columnName);
    } else {
      sortingAsc(columnName);
    }
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
      <UpdateMaterialModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <div className="materials_table_container">
        <Table>
          <thead>
            <tr>
              <th onClick={() => doSorting('ProjectName')}>
                Project <FontAwesomeIcon icon={iconToDisplay} size="lg" />
              </th>
              <th onClick={() => doSorting('InventoryItemType')}>
                Name <FontAwesomeIcon icon={iconToDisplay} size="lg" />
              </th>
              <th>Unit</th>
              <th>Bought</th>
              <th>Used</th>
              <th>Available</th>
              <th>Waste</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>
          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(mat => {
                return (
                  <tr key={mat._id}>
                    <td>{mat.project?.name}</td>
                    {/* Note: optional chaining to prevent crashes while db work ongoing */}
                    <td>{mat.itemType?.name}</td>
                    <td>{mat.itemType?.unit}</td>
                    <td>{mat.stockBought}</td>
                    <td>{mat.stockUsed}</td>
                    <td>{mat.stockAvailable}</td>
                    <td>{mat.stockWasted}</td>

                    <td className="materials_cell">
                      <button type="button" onClick={() => handleEditRecordsClick(mat, 'Update')}>
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(mat, 'Update')}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(mat.purchaseRecord, 'Purchase')}
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
                  No materials data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
