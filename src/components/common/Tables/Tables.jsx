import React from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import ModalA from "../modal";

const Tables = props => {
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
        {props.state.userTimeEntries.map(item => (
          <tr>
            <td>{item.dateOfWork}</td>
            <td>{`${item.hours} ${item.minutes}`}</td>
            <td>{item.projectName}</td>
            <td>{item.notes}</td>
            <td>
              <ModalA
                header="Edit"
                buttonLabel="Edit"
                color="primary"
                body={null}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps)(Tables);
