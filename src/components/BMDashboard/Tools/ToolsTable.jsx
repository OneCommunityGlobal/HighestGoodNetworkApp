import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSort, faSortUp } from '@fortawesome/free-solid-svg-icons';

import { resetToolUpdate } from 'actions/bmdashboard/toolsActions';
import { useDispatch } from 'react-redux';
import RecordsModal from './RecordsModal';
import UpdateToolModal from '../UpdateTools/UpdateToolModal';

export default function ToolsTable({ filteredTools }) {
  const dispatch = useDispatch();
  const [sortedData, setData] = useState(null);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  const [order, setOrder] = useState('default');
  const [iconToDisplay, setIconToDisplay] = useState(faSort);

  useEffect(() => {
    if (filteredTools && filteredTools.length > 0) {
      setData(filteredTools);
    }
  }, [filteredTools]);

  // Update Tool Form
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);

  const handleEditRecordsClick = (selectedTool, type) => {
    if (type === 'Update') {
      dispatch(resetToolUpdate());
      setUpdateModal(true);
      setUpdateRecord(selectedTool);
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
  //     setData(filteredTools);
  //   }
  // };

  const doSorting = columnName => {
    if (order === 'desc') {
      setData(filteredTools);
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
      <UpdateToolModal modal={updateModal} setModal={setUpdateModal} record={updateRecord} />
      <div className="tools_table_container">
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

                    <td className="tools_cell">
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
                  No tools data
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
}
