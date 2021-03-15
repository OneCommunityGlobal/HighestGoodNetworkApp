import React, { useState } from 'react';
import {
  Container, Button, Modal, ModalBody, ModalFooter
} from 'reactstrap';
import { connect } from 'react-redux';
import { deleteBadge, closeAlert } from '../../actions/badgeManagement';
import BadgeTableHeader from './BadgeTableHeader';
import BadgeTableFilter from './BadgeTableFilter';
import DeleteBadgePopup from './DeleteBadgePopup';


const EditBadgeTable = (props) => {

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [category, setCategory] = useState('');
  const [order, setOrder] = useState('');
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')
  const [deletePopup, setDeletePopup] = useState(false);

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

  const onBadgeProjectSearch = (text) => {
    setProject(text);
  }

  const onBadgeCategorySearch = (text) => {
    setCategory(text);
  }

  const onBadgeRankingSort = (order) => {
    setOrder(order);
  }

  const resetFilters = () => {
    setName('');
    setDescription('');
    setProject('');
    setCategory('');
    setOrder('');
  }

  const filterBadges = (allBadges) => {
    let filteredList = allBadges.filter((badge) => {
      if (badge.badgeName.toLowerCase().indexOf(name.toLowerCase()) > -1 && badge.description.toLowerCase().indexOf(description.toLowerCase()) > -1 && (project.length === 0 || (project.length !== 0 && (badge.project && badge.project.projectName.toLowerCase().indexOf(project.toLowerCase()) > -1))) && badge.category.toLowerCase().indexOf(category.toLowerCase()) > -1) { return badge; }
    });
    if (order === "Ascending") {
      filteredList.sort((a, b) => a.ranking - b.ranking);
    } else if (order === "Descending") {
      filteredList.sort((a, b) => b.ranking - a.ranking);
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
            onBadgeProjectSearch={onBadgeProjectSearch}
            onBadgeCategorySearch={onBadgeCategorySearch}
            onBadgeRankingSort={onBadgeRankingSort}
            resetFilters={resetFilters}
            name={name}
            description={description}
            project={project}
            category={category}
            order={order}

          />
        </thead>
        <tbody>
          {filteredBadges.map((value) =>
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
                  <Button outline color="danger" onClick={() => onDeleteButtonClick(value._id, value.badgeName)}>Delete</Button>
                  <DeleteBadgePopup open={deletePopup} setDeletePopup={setDeletePopup} deleteBadge={props.deleteBadge} badgeId={deleteId} badgeName={deleteName} />
                </span>
              </td>
            </tr>)}
        </tbody>
      </table>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditBadgeTable);