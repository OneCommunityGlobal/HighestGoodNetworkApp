import React from "react";
import { connect } from "react-redux";
import { Table } from "reactstrap";
import ModalA from "../Modal";
import { deleteTimeEntry, updateTimeEntry } from "../../../actions";
import ModalBody from "../../TimeEntryModalBody";

function createMarkup(notes) {
  return { __html: notes };
}

// Edit admin vs volunteer logic

const Tables = props => {
  // Edit admin vs volunteer logic
  // let modal = null;
  // const editModal = (
  //   <ModalA header="Edit" buttonLabel="Edit" color="primary">
  //     <ModalBody
  //       date={item.dateOfWork}
  //       hours={item.hours}
  //       minutes={item.minutes}
  //       projectId={item.projectId}
  //       notes={item.notes}
  //       tangible={item.tangible}
  //       delete={props.deleteTimeEntry}
  //       id={item._id}
  //       update={props.updateTimeEntry}
  //     />
  //   </ModalA>
  // );

  // if (props.state.user.role === "Administrator") {
  //   modal = editModal;
  // } else if (props.state.userProfile._id === props.state.user.userid) {
  //   modal = editModal;
  // }

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
            <td dangerouslySetInnerHTML={createMarkup(item.notes)} />
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
