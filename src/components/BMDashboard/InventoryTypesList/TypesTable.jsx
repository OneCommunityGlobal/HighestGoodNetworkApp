import { useState } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { addInvType } from '../../../actions/bmdashboard/invTypeActions';
import TypeRow from './TypeRow';
import styles from './TypesList.module.css';

export function TypesTable(props) {
  const { itemTypes, category, dispatch } = props;
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState({ name: '', description: '', unit: '', fuel: '' });

  // Check if unit field is required for this category
  const requiresUnit = category === 'Materials' || category === 'Consumables';

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleSave = () => {
    if (newType.name.trim() && (!requiresUnit || newType.unit.trim())) {
      // Only include unit if it's required for this category
      let payload;
      if (category === 'Equipments') {
        // Equipment needs description and fuel fields
        payload = {
          name: newType.name,
          description: newType.description,
          fuel: newType.fuel, // Default fuel type if not provided
        };
      } else if (requiresUnit) {
        payload = newType;
      } else {
        payload = { name: newType.name, description: newType.description };
      }
      dispatch(addInvType(category, payload));
      setNewType({ name: '', description: '', unit: '', fuel: '' });
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewType({ name: '', description: '', unit: '', fuel: '' });
    setIsAdding(false);
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewType(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className={`${styles.tableHeader}`}>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            {requiresUnit && <th>Unit</th>}
            {category === 'Equipments' && <th>Fuel Type</th>}
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
              category={category}
              requiresUnit={requiresUnit}
            />
          ))}

          {isAdding && (
            <tr>
              <td>{itemTypes?.length + 1}</td>
              <td>
                <Form.Control
                  type="text"
                  name="name"
                  value={newType.name}
                  onChange={handleInputChange}
                  placeholder={`Enter ${category.slice(0, -1).toLowerCase()} name`}
                  size="sm"
                />
              </td>
              <td>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={newType.description}
                  onChange={handleInputChange}
                  placeholder={`Enter ${category.slice(0, -1).toLowerCase()} description`}
                  size="sm"
                  rows={2}
                />
              </td>
              {requiresUnit && (
                <td>
                  <Form.Control
                    type="text"
                    name="unit"
                    value={newType.unit}
                    onChange={handleInputChange}
                    placeholder="Enter unit"
                    size="sm"
                  />
                </td>
              )}
              {category === 'Equipments' && (
                <td>
                  <Form.Control
                    type="text"
                    name="fuel"
                    value={newType.fuel}
                    onChange={handleInputChange}
                    placeholder="Enter fuel type"
                    size="sm"
                  />
                </td>
              )}
              <td>
                <Button size="sm" variant="success" onClick={handleSave}>
                  Save
                </Button>
              </td>
              <td>
                <Button size="sm" variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Button size="sm" className={`${styles.btnTypes}`} onClick={handleAdd}>
        Add
      </Button>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => ({
  itemTypes: state.bmInvTypes.invTypeList[ownProps?.category],
});
export default connect(mapStateToProps)(TypesTable);
