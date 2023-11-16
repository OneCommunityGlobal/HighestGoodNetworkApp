import { useState } from 'react';
import { Table, Button } from 'reactstrap';
import { BiPencil } from 'react-icons/bi';

import RecordsModal from './RecordsModal';
import UpdateMaterialModal from '../UpdateMaterials/UpdateMaterialModal';
import { resetMaterialUpdate } from 'actions/bmdashboard/materialsActions';
import { useDispatch } from 'react-redux';

export default function MaterialsTable({ filteredMaterials }) {
  const dispatch = useDispatch();
  const [modal, setModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [recordType, setRecordType] = useState('');

  //Update Material Form
  const [updateModal, setUpdateModal] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null)

  const handleEditRecordsClick = (selectedMaterial, type) => {
    if (type == 'Update') {
      dispatch(resetMaterialUpdate())
      setUpdateModal(true);
      setUpdateRecord(selectedMaterial)
    }
  };

  const handleViewRecordsClick = (data, type) => {
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
      <UpdateMaterialModal
        modal={updateModal}
        setModal={setUpdateModal}
        record={updateRecord}
      />
      <div className="materials_table_container">
        <Table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Name</th>
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
            {filteredMaterials.length ? (
              filteredMaterials.map(mat => {
                return (
                  <tr key={mat._id}>
                    <td>{mat.project.name}</td>
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
