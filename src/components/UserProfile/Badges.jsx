import React, {useState, useEffect} from 'react';
import {
  Card, CardTitle, CardText, CardBody, Button, Modal, ModalHeader, ModalBody, UncontrolledTooltip
} from 'reactstrap';
import { connect } from 'react-redux';
import './Badge.css';
import { getUserProfile } from '../../actions/userProfile';
import FeaturedBadges from './FeaturedBadges';
import BadgeReport from '../Badge/BadgeReport';

const Badges = (props) => {
  const [isOpen, setOpen] = useState(false);
  const [totalBadge, setTotalBadge] = useState(0);
  const toggle = () => {
    if (isOpen) {
      props.getUserProfile(props.userId)?.then(() => {
        let count = 0;
        if (props.userProfile.badgeCollection) {
          props.userProfile.badgeCollection.forEach(badge => { count += badge.count; });
          setTotalBadge(Math.round(count));
        }
      });
    }
    setOpen(isOpen => !isOpen)
  };

  useEffect(()=>{

    props.getUserProfile(props.userId)?.then(() => {
      let count = 0;
      if (props.userProfile.badgeCollection) {
        props.userProfile.badgeCollection.forEach(badge => { count += badge.count; });
        setTotalBadge(Math.round(count));
      }
    });
  },[])

  return(
  <>
  <Card style={{ backgroundColor: '#f6f6f3', marginTop: 20, marginBottom: 20 }}>
    <CardBody>
      <CardTitle
        style={{
          fontWeight: 'bold',
          fontSize: 18,
          color: '#285739',
          marginBottom: 15
        }}
      >
        Featured Badges <i className="fa fa-info-circle" id="FeaturedBadgeInfo" />
        <Button className="btn--dark-sea-green float-right" onClick={toggle}>Full History</Button>
        <Modal size="lg" isOpen={isOpen} toggle={toggle}>
          <ModalHeader toggle={toggle}>Full View of Badge History</ModalHeader>
          <ModalBody><BadgeReport badges={props.badges} userId={props.userId} isAdmin={props.isAdmin} close={toggle}/></ModalBody>
        </Modal>
      </CardTitle>
        <FeaturedBadges badges={props.badges} />
        <CardText
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: '#285739',
            }}
          >
            Bravo! You Earned {totalBadge} Badges! <i className="fa fa-info-circle" id="CountInfo" />
          </CardText>
    </CardBody>
  </Card >
  <UncontrolledTooltip placement="right" target="FeaturedBadgeInfo" style={{ backgroundColor: '#666', color: '#fff' }}>
    <p className="badge_info_icon_text">Holy Awesome, these are your profiles featured badges !!! Click "Full History" to bask in the glory of your COMPLETE LIST!</p>
    <p className="badge_info_icon_text">Have a number bigger than "1" in the bottom righthand corner of a badge? That's how many times you've earned the same badge! Do your Happy Dance you Champion!!</p>
    <p className="badge_info_icon_text">No badges in this area? Uh, in that cases, everything said above is a bit premature. Sorry about that... Everyone must start somewhere, and in your case, that somewhere is with the big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB badge, you'd earn it, but we don't, so this area is blank.</p>
    <p className="badge_info_icon_text">No worries though, we're sure there are other areas of your life where you are a Champion already. Stick with us long enough and this will be another one.</p>
  </UncontrolledTooltip>
</>
)};

const mapStateToProps = state => ({
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => {
  return {
    getUserProfile: (userId) => dispatch(getUserProfile(userId)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Badges);