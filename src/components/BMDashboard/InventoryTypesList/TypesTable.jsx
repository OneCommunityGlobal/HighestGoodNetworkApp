import { Table, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import TypeRow from './TypeRow';

export function TypesTable(props) {
  const { itemTypes, category } = props;

  const getReferenceLink = () => {
    // NOTE: ideally href should just be /bmdashboard/${category}/add
    if (['Materials', 'Equipment', 'Tools'].indexOf(category) !== -1) {
      return `/bmdashboard/${category.toLowerCase()}/add`;
    }
    // other categories not implemented yet
    return '#';
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
      <Button size="sm" className="btn-types" href={getReferenceLink()}>
        Add
      </Button>
    </div>
  );
}

const mapStateToProps = (state, ownProps) => ({
  itemTypes: state.bmInvTypes.invTypeList[ownProps?.category],
});
export default connect(mapStateToProps)(TypesTable);
