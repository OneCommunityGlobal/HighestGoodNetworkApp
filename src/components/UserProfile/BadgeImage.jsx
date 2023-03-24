import React, { useState } from 'react';
import { Card, CardTitle, CardBody, CardImg, CardText, Popover } from 'reactstrap';

const BadgeImage = props => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <>
      <div className="badge_md_image_container">
        <div className="badge_image_md">
          <img
            src={props?.badgeData?.imageUrl}
            id={'popover_' + props.time + props.index.toString()}
            alt=""
          />
        </div>
        {props.count < 100 ? (
          <span
            className={
              props.badgeData.type == 'Personal Max'
                ? 'badge_featured_count_personalmax'
                : 'badge_featured_count'
            }
          >
            {Math.round(props.count)}
          </span>
        ) : (
          <span className="badge_featured_count_3_digit">{Math.round(props.count)}</span>
        )}
      </div>
      <Popover
        trigger="hover"
        isOpen={isOpen}
        toggle={toggle}
        target={'popover_' + props.time + props.index.toString()}
      >
        <Card className="text-center">
          <CardImg className="badge_image_lg" src={props?.badgeData?.imageUrl} />
          <CardBody>
            <CardTitle
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#285739',
                marginBottom: 15,
              }}
            >
              {props.badgeData?.badgeName}
            </CardTitle>
            <CardText>{props.badgeData?.description}</CardText>
          </CardBody>
        </Card>
      </Popover>
    </>
  );
};

export default BadgeImage;
