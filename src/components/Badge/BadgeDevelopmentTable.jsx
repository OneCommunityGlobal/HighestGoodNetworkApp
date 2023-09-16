import React, { useState } from 'react';
import {
  Container,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  UncontrolledPopover,
  Input,
} from 'reactstrap';
import { connect } from 'react-redux';
import { updateBadge, deleteBadge, closeAlert } from '../../actions/badgeManagement';
import BadgeTableHeader from './BadgeTableHeader';
import BadgeTableFilter from './BadgeTableFilter';
import EditBadgePopup from './EditBadgePopup';
import DeleteBadgePopup from './DeleteBadgePopup';
import { boxStyle } from 'styles';
import './Badge.css';

const BadgeDevelopmentTable = props => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [order, setOrder] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const [deletePopup, setDeletePopup] = useState(false);

  const [editBadgeValues, setEditBadgeValues] = useState('');
  const [editPopup, setEditPopup] = useState(false);

  const detailsText = badegValue => {
    let returnText = '';
    if (badegValue.type) {
      switch (badegValue.type) {
        case 'No Infringement Streak':
          if (badegValue.months) {
            returnText = `No blue squares for ${badegValue.months} months`;
          }
          break;
        case 'Minimum Hours Multiple':
          if (badegValue.multiple) {
            returnText = `${badegValue.multiple}X Minimum Hours`;
          }
          break;
        case 'Personal Max':
          returnText = 'New Max - Personal Record';
          break;
        case 'Most Hrs in Week':
          returnText = 'Most Hours In A Week';
          break;
        case 'X Hours for X Week Streak':
          if (badegValue.totalHrs && badegValue.weeks) {
            returnText = `${badegValue.totalHrs} Hours ${badegValue.weeks}-Week Streak`;
          }
          break;
        case 'Lead a team of X+':
          if (badegValue.people) {
            returnText = `Lead A Team Of ${badegValue.people}+`;
          }
          break;
        case 'Total Hrs in Category':
          if (badegValue.totalHrs && badegValue.category) {
            returnText = `${badegValue.totalHrs} Hours Total In ${badegValue.category} Category`;
          }
          break;
      }
    }
    return returnText;
  };

  const onEditButtonClick = badgeValues => {
    setEditBadgeValues(badgeValues);
    setEditPopup(true);
  };

  const onDeleteButtonClick = (badgeId, badgeName) => {
    setDeletePopup(true);
    setDeleteId(badgeId);
    setDeleteName(badgeName);
  };

  const onBadgeNameSearch = text => {
    setName(text);
  };

  const onBadgeDescriptionSearch = text => {
    setDescription(text);
  };

  const onBadgeTypeSearch = text => {
    setType(text);
  };

  const onBadgeRankingSort = order => {
    setOrder(order);
  };

  const resetFilters = () => {
    setName('');
    setDescription('');
    setType('');
    setOrder('');
  };

  const filterBadges = allBadges => {
    let filteredList = allBadges.filter(badge => {
      if (
        badge.badgeName.toLowerCase().indexOf(name.toLowerCase()) > -1 &&
        badge.description.toLowerCase().indexOf(description.toLowerCase()) > -1 &&
        (!type.toLowerCase() || badge?.type?.toLowerCase().indexOf(type.toLowerCase()) > -1)
      ) {
        return badge;
      }
    });

    if (order === 'Ascending') {
      filteredList.sort((a, b) => {
        if (a.ranking === 0) return 1;
        if (b.ranking === 0) return -1;
        if (a.ranking > b.ranking) return 1;
        if (a.ranking < b.ranking) return -1;
        if (a.badgeName > b.badgeName) return 1;
        if (a.badgeName < b.badgeName) return -1;
      });
    } else if (order === 'Descending') {
      filteredList.sort((a, b) => {
        if (a.ranking === 0) return -1;
        if (b.ranking === 0) return 1;
        if (a.ranking > b.ranking) return -1;
        if (a.ranking < b.ranking) return 1;
        if (a.badgeName > b.badgeName) return 1;
        if (a.badgeName < b.badgeName) return -1;
      });
    }
    return filteredList;
  };

  let filteredBadges = filterBadges(props.allBadgeData);

  const reportBadge = badgeValue => {
    const checkValue = badgeValue.showReport ? true : false;
    return (
      <div className="badge_check">
        <Input
          type="checkbox"
          id={badgeValue._id}
          name="reportable"
          checked={badgeValue.showReport || false}
          onChange={e => {
            const updatedValue = { ...badgeValue, showReport: !checkValue };
            props.updateBadge(badgeValue._id, updatedValue);
          }}
        />
      </div>
    );
  };

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
            type={type}
            order={order}
          />
        </thead>
        <tbody>
          {filteredBadges.map(value => (
            <tr key={value._id}>
              <td className="badge_image_sm">
                {' '}
                <img src={value.imageUrl} id={'popover_' + value._id} />
                <UncontrolledPopover trigger="hover" target={'popover_' + value._id}>
                  <Card className="text-center">
                    <CardImg className="badge_image_lg" src={value?.imageUrl} />
                    <CardBody>
                      <CardTitle
                        style={{
                          fontWeight: 'bold',
                          fontSize: 18,
                          color: '#285739',
                          marginBottom: 15,
                        }}
                      >
                        {value?.badgeName}
                      </CardTitle>
                      <CardText>{value?.description}</CardText>
                    </CardBody>
                  </Card>
                </UncontrolledPopover>
              </td>
              <td>{value.badgeName}</td>
              <td>{value.description || ''}</td>
              <td>{value.type || ''}</td>
              <td>{detailsText(value)}</td>
              <td>{value.ranking || 0}</td>
              <td>
                <span className="badgemanagement-actions-cell">
                  <Button
                    outline
                    color="info"
                    onClick={() => onEditButtonClick(value)}
                    style={boxStyle}
                  >
                    Edit
                  </Button>{' '}
                </span>
                <span className="badgemanagement-actions-cell">
                  <Button
                    outline
                    color="danger"
                    onClick={() => onDeleteButtonClick(value._id, value.badgeName)}
                    style={boxStyle}
                  >
                    Delete
                  </Button>
                </span>
              </td>
              <td>{reportBadge(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <EditBadgePopup open={editPopup} setEditPopup={setEditPopup} badgeValues={editBadgeValues} />
      <DeleteBadgePopup
        open={deletePopup}
        setDeletePopup={setDeletePopup}
        deleteBadge={props.deleteBadge}
        badgeId={deleteId}
        badgeName={deleteName}
      />
      <Modal isOpen={props.alertVisible} toggle={() => props.closeAlert()}>
        <ModalBody className={'badge-message-background-' + props.color}>
          <p className={'badge-message-text-' + props.color}>{props.message}</p>
        </ModalBody>
        <ModalFooter className={'badge-message-background-' + props.color}>
          <Button color="secondary" size="sm" onClick={() => props.closeAlert()}>
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

const mapStateToProps = state => ({
  message: state.badge.message,
  alertVisible: state.badge.alertVisible,
  color: state.badge.color,
});

const mapDispatchToProps = dispatch => ({
  deleteBadge: badgeId => dispatch(deleteBadge(badgeId)),
  updateBadge: (badgeId, badgeData) => dispatch(updateBadge(badgeId, badgeData)),
  closeAlert: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeDevelopmentTable);
