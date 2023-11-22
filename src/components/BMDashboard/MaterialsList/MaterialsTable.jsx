import { useEffect, useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';

import RecordsModal from './RecordsModal';

export default function MaterialsTable({ filteredMaterials }) {
  const [sortedData, setData]= useState(null);
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');
  //const [order,setOrder]= useState("ASC");
  const [order,setOrder]= useState("▼");
  //"▼"; ASC
  //"▲"; DSC


  useEffect(() => {
    if(filteredMaterials && filteredMaterials.length > 0) {
      setData(filteredMaterials);
    }
  },filteredMaterials);
  

  const handleEditRecordsClick = () => {
    // open records editor
     return null;
  };

  const handleViewRecordsClick = (data, type) => {
    setModal(true);
    setRecord(data);
    setRecordType(type);
  };

  const sortingAsc = (columnName) => {
    let sorted =[];
    if(columnName=="ProjectName")
    {
       sorted = [].concat(...sortedData)
      .sort((a, b) => a.project.projectName >= b.project.projectName ? 1 : -1);    
    }
    else if(columnName=="InventoryItemType")
    {
      sorted = [].concat(...sortedData)
      .sort((a, b) => a.inventoryItemType?.name >= b.inventoryItemType?.name ? 1 : -1);  
    }
    
    setData(sorted);
    setOrder("▲");
    //setOrder("DSC");
  };

  const sortingDesc = (columnName) => {
    let sorted =[];
    if(columnName=="ProjectName")
    {
       sorted = [].concat(...sortedData)
       .sort((a, b) => a.project.projectName <= b.project.projectName ? 1 : -1);
    }
    else if(columnName=="InventoryItemType")
    {
      sorted = [].concat(...sortedData)
      .sort((a, b) => a.inventoryItemType?.name <= b.inventoryItemType?.name ? 1 : -1); 
    }

    setData(sorted);
    // setOrder("ASC"); 
    setOrder("▼"); 
  };

  const doSorting = (columnName) => {
    // if(order === 'ASC') 
    if(order === '▼')
    {
     sortingAsc(columnName);
    }
    else {
      sortingDesc(columnName);
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
      <div className="materials_table_container">
        <Table>
          <thead>
            <tr>
              <th onClick={() => doSorting("ProjectName")}>Project {order}</th>
              <th onClick={() => doSorting("InventoryItemType")}>Name {order}</th>
              <th>Unit</th>
              <th>Bought</th>
              <th>Used</th>
              <th>Available</th>
              <th>Hold</th>
              <th>Waste</th>
              <th>Usage</th>
              <th>Updates</th>
              <th>Purchases</th>
            </tr>
          </thead>
          <tbody>
            {sortedData && sortedData.length > 0 ? (
              sortedData.map(mat => {
                return (
                  <tr key={mat._id}>
                    <td>{mat.project.projectName}</td>
                    {/* Note: optional chaining to prevent crashes while db work ongoing */}
                    <td>{mat.inventoryItemType?.name}</td>
                    <td>{mat.inventoryItemType?.uom}</td>
                    <td>{mat.stockBought}</td>
                    <td>{mat.stockUsed}</td>
                    <td>{mat.stockAvailable}</td>
                    <td>{mat.stockHeld}</td>
                    <td>{mat.stockWasted}</td>
                    <td className="materials_cell">
                      <button type="button" onClick={handleEditRecordsClick}>
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(mat.usageRecord, 'Usage')}
                      >
                        View
                      </Button>
                    </td>
                    <td className="materials_cell">
                      <button type="button" onClick={handleEditRecordsClick}>
                        <BiPencil />
                      </button>
                      <Button
                        color="primary"
                        outline
                        size="sm"
                        onClick={() => handleViewRecordsClick(mat.updateRecord, 'Update')}
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
