import { useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import TypeRow from './TypeRow';
import AddEditInvTypeFullModal from './AddEditInvTypeFullModal';
import DeleteInvTypeModal from './DeleteInvTypeModal';
import styles from './TypesList.module.css';

export function TypesTable(props) {
  const { itemTypes, category } = props;

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedType(null);
    setModalOpen(true);
  };

  const handleEdit = itemType => {
    setModalMode('edit');
    setSelectedType(itemType);
    setModalOpen(true);
  };

  const handleDelete = itemType => {
    setSelectedType(itemType);
    setDeleteModalOpen(true);
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className={`${styles.tableHeader}`}>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {itemTypes?.map((type, index) => (
            <TypeRow
              key={type._id}
              itemType={type}
              id={index + 1}
              onEdit={() => handleEdit(type)}
              onDelete={() => handleDelete(type)}
            />
          ))}
        </tbody>
      </Table>
      <Button size="sm" className={`${styles.btnTypes}`} onClick={handleAdd}>
        Add
      </Button>

      {/* Full Add/Edit Modal with all fields */}
      <AddEditInvTypeFullModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        category={category}
        mode={modalMode}
        itemType={selectedType}
      />

      {/* Delete Confirmation Modal */}
      <DeleteInvTypeModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen(false)}
        itemType={selectedType}
        category={category}
      />
    </div>
  );
}

TypesTable.propTypes = {
  itemTypes: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
  category: PropTypes.string.isRequired,
};

TypesTable.defaultProps = {
  itemTypes: [],
};

const mapStateToProps = (state, ownProps) => ({
  itemTypes: state.bmInvTypes.invTypeList[ownProps?.category],
});
export default connect(mapStateToProps)(TypesTable);
