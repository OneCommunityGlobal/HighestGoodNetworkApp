import { useState } from 'react';
import { Table, Button } from 'reactstrap';

import RecordsModal from './RecordsModal';

export default function MaterialsTable({ filteredMaterials }) {
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');

  const handleClick = (data, type) => {
    setModal(true);
    setRecord(data);
    setRecordType(type);
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
      <Table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Bought</th>
            <th>Used</th>
            <th>Available</th>
            <th>Hold</th>
            <th>Wasted</th>
            <th>Usage</th>
            <th>Updates</th>
            <th>Purchases</th>
          </tr>
        </thead>
        <tbody>
          {filteredMaterials.length ? (
            filteredMaterials.map((mat, i) => {
              return (
                <tr key={i}>
                  <td>{mat.project.projectName}</td>
                  <td>{mat.inventoryItemType.name}</td>
                  <td>{mat.inventoryItemType.uom}</td>
                  <td>{mat.stockBought}</td>
                  <td>{mat.stockUsed}</td>
                  <td>{mat.stockAvailable}</td>
                  <td>{mat.stockHeld}</td>
                  <td>{mat.stockWasted}</td>
                  <td>
                    <Button
                      color="primary"
                      outline
                      onClick={() => handleClick(mat.usageRecord, 'Usage')}
                    >
                      View
                    </Button>
                  </td>
                  <td>
                    <Button
                      color="primary"
                      outline
                      onClick={() => handleClick(mat.updateRecord, 'Update')}
                    >
                      View
                    </Button>
                  </td>
                  <td>
                    <Button
                      color="primary"
                      outline
                      onClick={() => handleClick(mat.purchaseRecord, 'Purchase')}
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
    </>
  );
}
