import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Card, CardText, CardBody, CardHeader, Button, Modal, ModalBody, UncontrolledTooltip, ModalHeader
} from 'reactstrap';
import './Badge.css';
import NewBadges from './NewBadges';
import OldBadges from './OldBadges';
import BadgeReport from './BadgeReport';
import { getUserProfile } from '../../actions/userProfile';


const Badge = (props) => {
  const [isOpen, setOpen] = useState(false);
  const [totalBadge, setTotalBadge] = useState(0);

  const toggle = () => {
    if (isOpen) {
      const userId = props.userId;
      props.getUserProfile(userId).then(() => {
        let count = 0;
        if (props.userProfile.badgeCollection) {
          props.userProfile.badgeCollection.forEach(badge => { 
            console.log(badge);
            if (badge?.badge?.badgeName === "Personal Max" || badge?.badge?.type === "Personal Max") {
              count +=1;
            } else {
              count += badge.count; 
            } 
          });
          setTotalBadge(Math.round(count));
        }
      });
    }
    setOpen(isOpen => !isOpen)
  };

  useEffect(() => {
    const userId = props.userId;
    props.getUserProfile(userId).then(() => {
      let count = 0;
      if (props.userProfile.badgeCollection) {
        props.userProfile.badgeCollection.forEach(badge => { 
          console.log(badge)
          if (badge?.badge?.badgeName === "Personal Max" || badge?.badge?.type === "Personal Max") {
            count +=1;
          } else {
            count += badge.count; 
          } 
        });
        setTotalBadge(Math.round(count));
      }
    });
  }, [])

  return (
    <>
      <Card style={{ backgroundColor: '#fafafa', borderRadius: 0 }} id="badgesearned">
        <CardHeader tag="h3">
          Badges
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
            Bravo! You Earned {totalBadge} Badges! <i className="fa fa-info-circle" id="CountInfo" />
          </CardText>
          <Button className="btn--dark-sea-green float-right" onClick={toggle}>Badge Report</Button>
          <Modal size={"lg"} isOpen={isOpen} toggle={toggle}>
          <ModalHeader toggle={toggle}>Full View of Badge History</ModalHeader>
            <ModalBody><BadgeReport badges={props.userProfile.badgeCollection || []} userId={props.userId} isAdmin={props.isAdmin} close={toggle}/></ModalBody>
          </Modal>
        </CardBody>
      </Card >
      <UncontrolledTooltip placement="auto" target="CountInfo" style={{ backgroundColor: '#666', color: '#fff' }}>
        <p className="badge_info_icon_text">This is the total number of badges you have earned. (Way to go Champion!) It increases if you earn the same badge multiple times too!</p>
        <p className="badge_info_icon_text">There are many things in life to be proud of. Some are even worth bragging about. If your number here is large, it definitely falls into the later category.</p>
      </UncontrolledTooltip>
    </>
  );
};

const mapStateToProps = state => ({
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => {
  return {
    getUserProfile: (userId) => dispatch(getUserProfile(userId)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Badge);
