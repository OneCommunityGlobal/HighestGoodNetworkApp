import React, { useState } from 'react';
import {
  Container, Button, Modal, ModalBody, ModalFooter
} from 'reactstrap';
import { connect } from 'react-redux';
import { deleteBadge, closeAlert } from '../../actions/badgeManagement';
import BadgeTableHeader from './BadgeTableHeader';
import BadgeTableFilter from './BadgeTableFilter';
import EditBadgePopup from './EditBadgePopup';
import DeleteBadgePopup from './DeleteBadgePopup';


const BadgeDevelopmentTable = (props) => {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [type, setType] = useState('');
  const [order, setOrder] = useState('');
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')
  const [deletePopup, setDeletePopup] = useState(false);

  const [editBadgeValues, setEditBadgeValues] = useState('');
  const [editBadgeId, setEditBadgeId] = useState('');
  const [editBadgeName, setEditBadgeName] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editRanking, setEditRanking] = useState('');
  const [editPopup, setEditPopup] = useState(false);

  const onEditButtonClick = (badgeValues) => {
    setEditPopup(true);
    setEditBadgeValues(badgeValues);
  }

  const onDeleteButtonClick = (badgeId, badgeName) => {
    setDeletePopup(true);
    setDeleteId(badgeId);
    setDeleteName(badgeName);
  }

  const onBadgeNameSearch = (text) => {
    setName(text);
  };

  const onBadgeDescriptionSearch = (text) => {
    setDescription(text);
  };

  const onBadgeTypeSearch = (text) => {
    setType(text);
  }

  const onBadgeRankingSort = (order) => {
    setOrder(order);
  }

  const resetFilters = () => {
    setName('');
    setDescription('');
    setType('');
    setOrder('');
  }

  const filterBadges = (allBadges) => {
    let filteredList = allBadges.filter((badge) => {
      if (badge.badgeName.toLowerCase().indexOf(name.toLowerCase()) > -1 && badge.description.toLowerCase().indexOf(description.toLowerCase()) > -1 && (!type.toLowerCase() || badge?.Type?.toLowerCase().indexOf(type.toLowerCase()) > -1)) { return badge; }
    });

    if (order === "Ascending") {
      filteredList.sort((a, b) => {
        if (a.ranking === 0) return 1;
        if (b.ranking === 0) return -1;
        if (a.ranking > b.ranking) return 1;
        if (a.ranking < b.ranking) return -1;
        if (a.badgeName > b.badgeName) return 1;
        if (a.badgeName < b.badgeName) return -1;
      }
      );
    } else if (order === "Descending") {
      filteredList.sort((a, b) => {
        if (a.ranking === 0) return -1;
        if (b.ranking === 0) return 1;
        if (a.ranking > b.ranking) return -1;
        if (a.ranking < b.ranking) return 1;
        if (a.badgeName > b.badgeName) return 1;
        if (a.badgeName < b.badgeName) return -1;
      }
      );
    }
    return filteredList;
  }

  let filteredBadges = filterBadges(props.allBadgeData);

  return (
    <Container fluid>
      <table className="table table-bordered">
        <thead>
          <BadgeTableHeader />
          <BadgeTableFilter
            onBadgeNameSearch={onBadgeNameSearch}
            onBadgeDescriptionSearch={onBadgeDescriptionSearch}
            onBadgeTypeSearch={onBadgeTypeSearch}
            onBadgeRankingSort={onBadgeRankingSort}
            resetFilters={resetFilters}
            name={name}
            description={description}
            project={project}
            type={type}
            order={order}

          />
        </thead>
        <tbody>
          {filteredBadges.map((value) =>
            <tr key={value._id} >
              <td className="badge_image_sm"> <img src={value.imageUrl} /></td>
              <td>{value.badgeName}</td>
              <td>{value.description || ''}</td>
              <td>{value.type || ''}</td>
              <td>{value.ranking || 0}</td>
              <td>
                <span className="badgemanagement-actions-cell">
                  <Button outline color="info" onClick={() => onEditButtonClick(value)}>Edit</Button>{' '}
                </span>
                <span className="badgemanagement-actions-cell">
                  <Button outline color="danger" onClick={() => onDeleteButtonClick(value._id, value.badgeName)}>Delete
                  </Button>
                </span>
              </td>
            </tr>)}
        </tbody>
      </table>
      <EditBadgePopup open={editPopup} setEditPopup={setEditPopup} badgeValues={editBadgeValues} />
      <DeleteBadgePopup open={deletePopup} setDeletePopup={setDeletePopup} deleteBadge={props.deleteBadge} badgeId={deleteId} badgeName={deleteName} />
      <Modal isOpen={props.alertVisible} toggle={() => props.closeAlert()} >
        <ModalBody className={"badge-message-background-" + props.color}><p className={"badge-message-text-" + props.color}>{props.message}</p>
        </ModalBody>
        <ModalFooter className={"badge-message-background-" + props.color}>
          <Button color="secondary" size="sm" onClick={() => props.closeAlert()}>OK</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(BadgeDevelopmentTable);