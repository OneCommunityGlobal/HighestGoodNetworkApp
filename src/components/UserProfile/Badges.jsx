import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardFooter,
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
import hasPermission from '../../utils/permissions';
import { boxStyle } from 'styles';

export const Badges = props => {
  const [isOpen, setOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const canAssignBadges = props.hasPermission('assignBadges');

  const toggle = () => setOpen(!isOpen);

  const assignToggle = () => {
    setAssignOpen(isAssignOpen => !isAssignOpen);
  };

  useEffect(() => {
    if (!isOpen && !isAssignOpen) {
      props.clearSelected();
    }
  }, [isOpen, isAssignOpen]);

  // Determines what congratulatory text should displayed.
  const badgesEarned = props.userProfile.badgeCollection.reduce((acc, obj) => acc + Number(obj.count), 0);
  const subject = props.isUserSelf ? 'You have' : 'This person has';
  const verb = badgesEarned ? `earned ${badgesEarned}` : 'no';
  const object = badgesEarned == 1 ? 'badge' : 'badges';
  let congratulatoryText = `${subject} ${verb} ${object}`;
  congratulatoryText = badgesEarned
    ? 'Bravo! ' + congratulatoryText + '! '
    : congratulatoryText + '. ';

  return (
    <>
      <Card id="badgeCard" style={{ backgroundColor: '#f6f6f3', marginTop: 20, marginBottom: 20 }}>
        <CardHeader>
          <div className="badge-header">
            <span className="badge-header-title">
              Featured Badges <i className="fa fa-info-circle" id="FeaturedBadgeInfo" />
            </span>
            <div>
              {(props.canEdit || props.role == 'Owner' || props.role == 'Administrator') && (
                <>
                  <Button className="btn--dark-sea-green" onClick={toggle} style={boxStyle}>
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
                        setOriginalUserProfile={props.setOriginalUserProfile}
                        handleSubmit={props.handleSubmit}
                        isUserSelf={props.isUserSelf}
                      />
                    </ModalBody>
                  </Modal>
                </>
              )}
              {canAssignBadges && (
                <>
                  <Button
                    className="btn--dark-sea-green mr-2"
                    onClick={assignToggle}
                    style={boxStyle}
                  >
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
            </div>
          </div>
        </CardHeader>
        <CardBody style={{ overflow: 'auto' }}>
          <FeaturedBadges personalBestMaxHrs={props.userProfile.personalBestMaxHrs} badges={props.userProfile.badgeCollection} />
        </CardBody>
        <CardFooter
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: '#285739',
          }}
        >
          {congratulatoryText}
          <i className="fa fa-info-circle" id="CountInfo" />
        </CardFooter>
      </Card>
      <UncontrolledTooltip
        placement="right"
        target="FeaturedBadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          Holy Awesome, these are your profiles featured badges !!! Click &quot;Select
          Featured&quot; to bask in the glory of your COMPLETE LIST!
        </p>
        <p className="badge_info_icon_text">
          Have a number bigger than &quot;1&quot; in the bottom righthand corner of a badge?
          That&apos;s how many times you&apos;ve earned the same badge! Do your Happy Dance you
          Champion!!
        </p>
        <p className="badge_info_icon_text">
          No badges in this area? Uh, in that cases, everything said above is a bit premature. Sorry
          about that... Everyone must start somewhere, and in your case, that somewhere is with the
          big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB
          badge, you&apos;d earn it, but we don&apos;t, so this area is blank.
        </p>
        <p className="badge_info_icon_text">
          No worries though, we&apos;re sure there are other areas of your life where you are a
          Champion already. Stick with us long enough and this will be another one.
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

const mapDispatchToProps = dispatch => ({
  clearSelected: () => dispatch(clearSelected()),
  hasPermission: (permission) => dispatch(hasPermission(permission)),
});

const mapStateToProps = state => ({
  allBadgeData: state?.badge?.allBadgeData,
});

export default connect(mapStateToProps, mapDispatchToProps)(Badges);
