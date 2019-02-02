import React from 'react';
import { Table } from 'reactstrap';

export default class Example extends React.Component {
  componentDidMount() {
    console.log(this.props.timelogData.userid)
  }
  render() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Project</th>
            <th>Notes</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr>

            {/* {this.props.timelogData.map((item) => (
              <td>
                {item.dateOfWork}
              </td>
            ))} */}
          </tr>

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