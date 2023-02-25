import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  CardText,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalBody,
  UncontrolledTooltip,
  ModalHeader,
} from 'reactstrap';
import './Badge.css';
import NewBadges from './NewBadges';
import OldBadges from './OldBadges';
import BadgeReport from './BadgeReport';
import { getUserProfile } from '../../actions/userProfile';

const Badge = props => {
  const [isOpen, setOpen] = useState(false);
  const [isOpenTypes, setOpenTypes] = useState(false);
  const [totalBadge, setTotalBadge] = useState(0);

  const toggle = () => {
    if (isOpen) {
      const userId = props.userId;
      let count = 0;
      if (props.userProfile.badgeCollection) {
        props.userProfile.badgeCollection.forEach(badge => {
          console.log('badge1', badge);
          if (badge?.badge?.badgeName === 'Personal Max' || badge?.badge?.type === 'Personal Max') {
            count += 1;
          } else {
            count += badge.count;
          }
        });
        setTotalBadge(Math.round(count));
      }
    }
    setOpen(isOpen => !isOpen);
  };

  const toggleTypes = () => {
    setOpenTypes(isOpenTypes => !isOpenTypes);
  };

  useEffect(() => {
    const userId = props.userId;
    console.log('This is userId', userId);
    let count = 0;
    if (props.userProfile.badgeCollection) {
      console.log('userProfileBadgeCollectionId', props.userProfile._id);
      props.userProfile.badgeCollection.forEach(badge => {
        console.log('badge2', badge);
        if (badge?.badge?.badgeName === 'Personal Max' || badge?.badge?.type === 'Personal Max') {
          count += 1;
        } else {
          count += badge.count;
        }
      });
      setTotalBadge(Math.round(count));
    }
  }, [props.userProfile.badgeCollection, totalBadge]);

  const permissionsUser = props.userProfile?.permissions?.frontPermissions;
  return (
    <>
      <Container>
        <Row>
          <Col md={12}>
            <Card style={{ backgroundColor: '#fafafa', borderRadius: 0 }} id="badgesearned">
              <CardHeader tag="h3">
                Badges <i className="fa fa-info-circle" id="BadgeInfo" onClick={toggleTypes} />
              </CardHeader>
              <CardBody>
                <NewBadges badges={props.userProfile.badgeCollection || []} />
                <OldBadges badges={props.userProfile.badgeCollection || []} />
                <CardText
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: '#285739',
                  }}
                >
                  Bravo! You Earned {totalBadge} Badges!{' '}
                  <i className="fa fa-info-circle" id="CountInfo" />
                </CardText>
                <Button className="btn--dark-sea-green float-right" onClick={toggle}>
                  Badge Report
                </Button>
                <Modal size={'lg'} isOpen={isOpen} toggle={toggle}>
                  <ModalHeader toggle={toggle}>Full View of Badge History</ModalHeader>
                  <ModalBody>
                    <BadgeReport
                      badges={props.userProfile.badgeCollection || []}
                      userId={props.userId}
                      firstName={props.userProfile.firstName}
                      lastName={props.userProfile.lastName}
                      role={props.role}
                      close={toggle}
                      permissionsUser={permissionsUser}
                    />
                  </ModalBody>
                </Modal>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
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
          number here is large, it definitely falls into the latter category.
        </p>
      </UncontrolledTooltip>
      <UncontrolledTooltip
        autohide={false}
        placement="auto"
        target="BadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          There are several types of badges you can earn for hitting different milestones click this
          icon to learn more about the different types of badges.
        </p>
      </UncontrolledTooltip>
      <Modal isOpen={isOpenTypes} toggle={toggleTypes}>
        <ModalHeader toggle={toggleTypes}>Badge Types and Assignment</ModalHeader>
        <ModalBody>
          <p className="badge_info_icon_text">
            No Infringement Streak: Not recieving any infringement for a certain number of months.{' '}
          </p>
          <p className="badge_info_icon_text">
            Hours in Category: As you submit hours to a project of a certain category such as
            'Food', 'Energy', etc you can earn badges for hitting certain levels of hours worked in
            each category.
          </p>
          <p className="badge_info_icon_text">
            Hour Multiple: If you earn a multiple of your weekly committed hours you can earn a
            corresponding badge for that!
          </p>
          <p className="badge_info_icon_text">
            Personal Max: This badge will be earned after your first week with the count(little red
            number) being the amount of hours you put in that week and updated everytime you beat
            it.
          </p>
          <p className="badge_info_icon_text">
            Most Hours This Week: This badge will be earned if you put in the most HRs of the entire
            organization in a certain week.
          </p>
          <p className="badge_info_icon_text">
            X Hours for X Week Streak: This badge will be earned if you put in X Number of Hours for
            X Weeks in a row. In the case of the one week badges the count will increase on the
            corresponding highest hour value badge each week. For other badges 2 weeks, 3 weeks etc.
            Once you earn a higher hour badge for that streak it will replace the ones below it.
          </p>
          <p className="badge_info_icon_text">
            Lead a team of X+: For Managers they can earn badges for the size of the team that they
            lead whether it is a 5, 10, 20..etc person team.
          </p>
          <p className="badge_info_icon_text">
            Auto Assignment of the previous types of Badges happens at the end of each week
            (Saturday Midnight PST) as your time is processed, so make sure that your time has been
            inputted properly by that time in order to get credit.
          </p>
        </ModalBody>
      </Modal>
    </>
  );
};

const mapStateToProps = state => ({
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(Badge);
