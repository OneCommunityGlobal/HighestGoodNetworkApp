import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Card, CardText, CardBody, CardHeader, Button, Modal, ModalBody
} from 'reactstrap';
import './Badge.css';
import NewBadges from './NewBadges';
import OldBadges from './OldBadges';
import BadgeReport from './BadgeReport';
import { getUserProfile } from '../../actions/userProfile';


const Badge = (props) => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  useEffect(() => {
    const userId = props.userId;
    props.getUserProfile(userId);
  }, [])


  return (
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
          Bravo! You Earned 101 Badges!
      </CardText>
        <Button className="btn--dark-sea-green float-right" onClick={toggle}>Badge Report</Button>
        <Modal isOpen={isOpen} toggle={toggle}>
          <ModalBody><BadgeReport /></ModalBody>
        </Modal>
      </CardBody>
    </Card >
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
