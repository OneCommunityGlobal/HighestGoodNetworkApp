import React from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import ModalA from "../Modal";
import { deleteTimeEntry, updateTimeEntry } from "../../../actions";
import ModalBody from "../../TimeEntryModalBody";

const styles = {
  height: "50px",
  width: "10px",
  border: "1px solid #ccc",
  font: "16px/26px Georgia, Garamond, Serif",
  overflow: "scroll"
};

function createMarkup(notes) {
  return { __html: notes };
}

const Tables = props => {
  return (
    <Table>
      <thead>
        <tr>
          <th>Date</th>
          <th>HH:MM</th>
          <th>Minutes</th>
          <th>Project</th>
          <th>Notes</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {props.state.userTimeEntries.map(item => (
          <tr key={item._id}>
            <td>{item.dateOfWork}</td>
            <td>
              {item.hours.padStart(2, "0")}
:
{' '}
{item.minutes.padStart(2, "0")}
            </td>
            <td>{item.minutes}</td>
            <td>{item.projectName}</td>
            <td
              style={styles}
              dangerouslySetInnerHTML={createMarkup(item.notes)}
            />
            <td>
              {props.state.user.role === "Administrator" ||
              props.state.userProfile._id === props.state.user.userid ? (
                <ModalA header="Edit" buttonLabel="Edit" color="primary">
                  <ModalBody
                    date={item.dateOfWork}
                    hours={item.hours}
                    minutes={item.minutes}
                    projectId={item.projectId}
                    notes={item.notes}
                    tangible={item.tangible}
                    delete={props.deleteTimeEntry}
                    id={item._id}
                    update={props.updateTimeEntry}
                  />
                </ModalA>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const mapStateToProps = state => ({ state });

export default connect(
  mapStateToProps,
  { deleteTimeEntry, updateTimeEntry }
)(Tables);
