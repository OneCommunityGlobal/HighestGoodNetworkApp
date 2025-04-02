import { Table, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import TypeRow from './TypeRow';

export function TypesTable(props) {
  const { itemTypes, category } = props;

  const getReferenceLink = () => {
    switch (category) {
      case 'Material':
        return '/bmdashboard/materials/add';
      case 'Equipment':
        return '/bmdashboard/equipment/add';
      case 'Tool':
        return '/bmdashboard/tools/add';
      default:
        return '#';
    }
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
          {itemTypes?.map((type, index) => (
            <TypeRow key={type._id} itemType={type} rowID={index + 1} />
          ))}
        </tbody>
      </Table>
      <Button size="sm" className="btn-types" href={getReferenceLink()} target="__blank">
        Add
      </Button>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => ({
  itemTypes: state.bmInvTypes.invTypeList[ownProps?.category],
});
export default connect(mapStateToProps)(TypesTable);
