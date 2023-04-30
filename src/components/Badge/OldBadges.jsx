import React, { useState } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import BadgeHistory from './BadgeHistory';

const OldBadges = props => {
  const [isOpen, setOpen] = useState(false);

  console.log("what data do i have?", props.badges)

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <>
      <Card style={{ backgroundColor: '#f6f6f3', marginTop: 20, marginBottom: 20 }}>
        <CardBody>
          <CardTitle
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: '#285739',
              marginBottom: 15,
            }}
          >
            Badges Earned Before Last Week <i className="fa fa-info-circle" id="OldBadgeInfo" />
            {/* <Button className="btn--dark-sea-green float-right" onClick={toggle}>Full View</Button>
            <Modal isOpen={isOpen} toggle={toggle}>
              <ModalHeader toggle={toggle}>Full View of Badge History</ModalHeader>
              <ModalBody><BadgeHistory badges={props.badges} /></ModalBody>
            </Modal> */}
          </CardTitle>
          <div className="old_badges">
            <div className="customBadge">
            <img src="https://uc240a2e5ce97e247522cf55f232.previews.dropboxusercontent.com/p/thumb/AB5C26_v-7pIZpyH9WODRLiTvBMKBEjtsM6EYmx62lHpd0LkyTddIMck0Md5_tjJ4rEb_PaObc1EHjE-uP75Hjbn-9bcAOYwguhK_xC9Octl15qI2xd3fvygu-oZUoPaB1e1ibL6BrxEMM2u6p_j46rqYGXgV8aC-ZE46qzsFQ1ylzJqOpsHmtCpGGMd6tfIeQAOrsRsPbKEJ3S9zyQTgSqOC-S1q6BIlyYFfs9JuDUzxZg3VDZQDygUBOEA1GSzqm84DFZAJfmpeF480-HcloPGJ_s3ORqr4mwP08apgI3EwA1M7QPY0ibc0EnCxlOUoeYWXAHidmN3eIL-S7zuzYbj-3I-95cgjoXhSvAoxKYA0r26aynUHVYfIp1okS0ivv7kd4uNRtzfxNSI1CH3jzH7vkFT8nXwgshFqjozbdHN2Q/p.png" />
            <div>{props.badges.length}</div>
            </div>
            <BadgeHistory badges={props.badges} />
          </div>
        </CardBody>
      </Card>
      <UncontrolledTooltip
        placement="right"
        target="OldBadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          Holy Awesome, these are all the badges you earned before last week!!! Click "Full View" to
          bask in the glory of your COMPLETE LIST!
        </p>
        <p className="badge_info_icon_text">
          Have a number bigger than "1" in the bottom righthand corner of a badge? That's how many
          times you've earned the same badge! Do your Happy Dance you Champion!!
        </p>
        <p className="badge_info_icon_text">
          No badges in this area? Uh, in that case, everything said above is a bit premature. Sorry
          about that... Everyone must start somewhere, and in your case, that somewhere is with the
          big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB
          badge, you'd earn it, but we don't, so this area is blank.
        </p>
        <p className="badge_info_icon_text">
          No worries though, we're sure there are other areas of your life where you are a Champion
          already. Stick with us long enough and this will be another one.
        </p>
      </UncontrolledTooltip>
    </>
  );
};

export default OldBadges;


