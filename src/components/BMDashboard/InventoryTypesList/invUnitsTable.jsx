import { Table, Button, Container } from 'react-bootstrap';

export default function UnitsTable(props) {
  const { invUnits } = props;

  const handleDelete = () => {
    // TODO:
    console.log('Deleted unit:');
  };

  const handleAdd = () => {
    // TODO:
    console.log('Added unit:');
  };

  return (
    <div>
      <Table hover borderless size="sm" responsive="lg">
        <thead className="table-header">
          <tr>
            <th>Name</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {invUnits?.map(unit => (
            <tr key={`invUnit-${unit.unit}`}>
              <td>{unit.unit}</td>
              <td>
                <Button size="sm" className="btn-types" onClick={handleDelete}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>
        <input id="input-measurement" type="text" placeholder="Enter a new measurement" />
        <Button size="sm" className="btn-types" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
