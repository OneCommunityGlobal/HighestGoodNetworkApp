import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';
import ModalA from '../../common/modal';

class Tables extends React.Component {
  componentDidMount() {
    console.log(this.props.state.userTimeEntries)
  }
  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time (HH:MM)</th>
            <th>Project</th>
            <th>Notes</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>


          {this.props.state.userTimeEntries.map((item) => (
            <tr>
              <td>
                {item.dateOfWork}
              </td>
              <td>
                {`${item.hours} ${item.minutes}`}
              </td>
              <td>
                {item.projectName}
              </td>
              <td>
                {item.notes}
              </td>
              <td>
                <ModalA
                  header="Edit"
                  buttonLabel="Edit"
                  color="primary"
                  body={null} />
              </td>
            </tr>
          ))}

          <tr>
            <th></th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">Time</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">Project</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
          </tr>
          <tr>
            <th scope="row">Notes</th>
            <td>Larry</td>
            <td>the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps)(Tables);