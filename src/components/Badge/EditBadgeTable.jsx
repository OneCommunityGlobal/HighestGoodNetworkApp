import React from 'react';
import {
  Container, Button, Modal, ModalBody, ModalFooter
} from 'reactstrap';
import { connect } from 'react-redux';
import { deleteBadge, closeAlert } from '../../actions/badgeManagement';


const EditBadgeTable = (props) => {

  const closeAlert = () => {
    props.closeAlert();
  }

  const deleteBadge = (id) => {
    props.deleteBadge(id);
  }

  return (

    <Container fluid>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Badge</th>
            <th>Name</th>
            <th>Description</th>
            <th>Catergory</th>
            <th>Project</th>
            <th>Ranking</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {props.allBadgeData.map((value) =>
            <tr key={value._id} >
              <td className="badge_image_sm"> <img src={value.imageUrl} /></td>
              <td>{value.badgeName}</td>
              <td>{value.description || ''}</td>
              <td>{value.category || ''}</td>
              <td>{value.project ? value.project.projectName : ''}</td >
              <td>{value.ranking || 0}</td>
              <td>
                <span className="badgemanagement-actions-cell">
                  <Button outline color="info">Edit</Button>{' '}
                </span>
                <span className="badgemanagement-actions-cell">
                  <Button outline color="danger" onClick={() => deleteBadge(value._id)}>Delete</Button>
                </span>
              </td>
            </tr>)}
        </tbody>
      </table>
      <Modal isOpen={props.alertVisible} toggle={closeAlert} >
        <ModalBody className={"badge-message-background-" + props.color}><p className={"badge-message-text-" + props.color}>{props.message}</p>
        </ModalBody>
        <ModalFooter className={"badge-message-background-" + props.color}>
          <Button color="secondary" size="sm" onClick={closeAlert}>OK</Button>
        </ModalFooter>
      </Modal>
    </Container >
  );
};


const mapStateToProps = state => ({
  message: state.badge.message,
  alertVisible: state.badge.alertVisible,
  color: state.badge.color
});

const mapDispatchToProps = dispatch => ({
  deleteBadge: (badgeId) => dispatch(deleteBadge(badgeId)),
  closeAlert: () => dispatch(closeAlert())
});

export default connect(mapStateToProps, mapDispatchToProps)(EditBadgeTable);