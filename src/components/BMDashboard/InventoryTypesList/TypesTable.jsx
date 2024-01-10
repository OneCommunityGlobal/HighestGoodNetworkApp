import { Table, Button } from 'react-bootstrap';
import TypeRow from './TypeRow';

export default function TypesTable(props) {
  const { itemTypes, category } = props;

  const handleAdd = () => {
    // TODO:
    console.log('Added type:', category);
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className="table-header">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {itemTypes.map((type, index) => (
            <TypeRow key={type._id} itemType={type} id={index + 1} />
          ))}
        </tbody>
      </Table>
      <Button className="btn-types" onClick={handleAdd}>
        Add
      </Button>
    </div>
  );
}
