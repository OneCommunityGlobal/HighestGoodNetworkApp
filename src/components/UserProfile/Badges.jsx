import React, { useState, useEffect } from 'react';
import {
  Card,
  CardTitle,
  CardText,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  UncontrolledTooltip,
} from 'reactstrap';
import { connect } from 'react-redux';
import './Badge.css';
import FeaturedBadges from './FeaturedBadges';
import BadgeReport from '../Badge/BadgeReport';
import AssignBadgePopup from './AssignBadgePopup';
import { clearSelected } from 'actions/badgeManagement';

const Badges = (props) => {
  const [isOpen, setOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);

  const toggle = () => setOpen(!isOpen);

  const assignToggle = () => {
    setAssignOpen((isAssignOpen) => !isAssignOpen);
  };

  useEffect(() => {
    if (!isOpen && !isAssignOpen) {
      props.clearSelected();
    }
  }, [isOpen, isAssignOpen]);

  return (
    <>
      <Card id='badgeCard' style={{ backgroundColor: '#f6f6f3', marginTop: 20, marginBottom: 20}}>
        <CardBody>
          <CardTitle
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: '#285739',
              marginBottom: 15,
              minWidth: 446
            }}
          >
            Featured Badges <i className="fa fa-info-circle" id="FeaturedBadgeInfo" />
            <Button className="btn--dark-sea-green float-right" onClick={toggle}>
              Select Featured
            </Button>
            <Modal size="lg" isOpen={isOpen} toggle={toggle}>
              <ModalHeader toggle={toggle}>Full View of Badge History</ModalHeader>
              <ModalBody>
                <BadgeReport
                  badges={props.userProfile.badgeCollection}
                  userId={props.userProfile._id}
                  role={props.role}
                  firstName={props.userProfile.firstName}
                  lastName={props.userProfile.lastName}
                  close={toggle}
                  setUserProfile={props.setUserProfile}
                  handleSubmit={props.handleSubmit}
                />
              </ModalBody>
            </Modal>
            {props.canEdit && (
              <>
                <Button className="btn--dark-sea-green float-right mr-2" onClick={assignToggle}>
                  Assign Badges
                </Button>
                <Modal size="lg" isOpen={isAssignOpen} toggle={assignToggle}>
                  <ModalHeader toggle={assignToggle}>Assign Badges</ModalHeader>
                  <ModalBody>
                    <AssignBadgePopup
                      allBadgeData={props.allBadgeData}
                      userProfile={props.userProfile}
                      setUserProfile={props.setUserProfile}
                      close={assignToggle}
                      handleSubmit={props.handleSubmit}
                    />
                  </ModalBody>
                </Modal>
              </>
            )}
          </CardTitle>
          <FeaturedBadges badges={props.userProfile.badgeCollection}  />
          <CardText
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: '#285739',
            }}
          >
            Bravo! You've earned {props.userProfile.badgeCollection.length} badges!{' '}
            <i className="fa fa-info-circle" id="CountInfo" />
          </CardText>
        </CardBody>
      </Card>
      <UncontrolledTooltip
        placement="right"
        target="FeaturedBadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          Holy Awesome, these are your profiles featured badges !!! Click "Select Featured" to bask
          in the glory of your COMPLETE LIST!
        </p>
        <p className="badge_info_icon_text">
          Have a number bigger than "1" in the bottom righthand corner of a badge? That's how many
          times you've earned the same badge! Do your Happy Dance you Champion!!
        </p>
        <p className="badge_info_icon_text">
          No badges in this area? Uh, in that cases, everything said above is a bit premature. Sorry
          about that... Everyone must start somewhere, and in your case, that somewhere is with the
          big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB
          badge, you'd earn it, but we don't, so this area is blank.
        </p>
        <p className="badge_info_icon_text">
          No worries though, we're sure there are other areas of your life where you are a Champion
          already. Stick with us long enough and this will be another one.
        </p>
      </UncontrolledTooltip>
      <UncontrolledTooltip
        placement="auto"
        target="CountInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          This is the total number of badges you have earned. (Way to go Champion!) It increases if
          you earn the same badge multiple times too!
        </p>
        <p className="badge_info_icon_text">
          There are many things in life to be proud of. Some are even worth bragging about. If your
          number here is large, it definitely falls into the later category.
        </p>
      </UncontrolledTooltip>
    </>
  );
};

const mapDispatchToProps = (dispatch) => ({
  clearSelected: () => dispatch(clearSelected()),
});

const mapStateToProps = (state) => ({
  allBadgeData: state?.badge?.allBadgeData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Badges);
