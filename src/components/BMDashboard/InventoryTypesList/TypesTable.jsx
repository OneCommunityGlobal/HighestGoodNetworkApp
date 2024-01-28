import { Table, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import TypeRow from './TypeRow';

export function TypesTable(props) {
  const { itemTypes, category } = props;

  const getReferenceLink = () => {
    // NOTE: ideally href should just be /bmdashboard/${category}/add
    switch (category) {
      case 'Equipments':
        return '/bmdashboard/equipment/add';
      case 'Materials':
        return '/bmdashboard/Materials/add';
      default:
        // other categories not implemented yet
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
            <TypeRow key={type._id} itemType={type} id={index + 1} />
          ))}
        </tbody>
      </Table>
      <Button size="sm" className="btn-types" target="_blank" href={getReferenceLink()}>
        Add
      </Button>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => ({
  itemTypes: state.bmInvTypes.invTypeList[ownProps?.category],
});
export default connect(mapStateToProps)(TypesTable);
