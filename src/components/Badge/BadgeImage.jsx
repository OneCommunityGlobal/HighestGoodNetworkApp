import React, { useState } from 'react';
import {
  Card, CardTitle, CardBody, CardImg, CardText, Popover,
} from 'reactstrap';

const BadgeImage = (props) => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <>
      <img src={props.badgeData.imageUrl} id={"popover_" + props.index.toString()} />
      <Popover trigger="hover" isOpen={isOpen} toggle={toggle} target={"popover_" + props.index.toString()}>
        <Card className="text-center">
          <CardImg className="badge_image_lg" src={props.badgeData.imageUrl} />
          <CardBody>
            <CardTitle
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#285739',
                marginBottom: 15
              }}>{props.badgeData.badgeName}</CardTitle>
            <CardText>{props.badgeData.description}</CardText>
          </CardBody>
        </Card>
      </Popover>
    </>
  )
};

export default BadgeImage;