import React, { useState, useEffect } from 'react';
import { Card, CardTitle, CardBody, CardImg, CardText, Popover } from 'reactstrap';

const BadgeImage = props => {
  const [isOpen, setOpen] = useState(false);
  const [badgeValue, setBadgeValue] = useState(props.count);

  const toggle = () => setOpen(isOpen => !isOpen);

  const choosePersonalMaxHours = (countValue, personalBestMaxHrs) => {
    if(props.badgeData.type == 'Personal Max'){
      if (countValue > personalBestMaxHrs) {
        setBadgeValue(countValue);
      }
      else{
        setBadgeValue(personalBestMaxHrs);
      }
    }
  }

  useEffect(() => {
    choosePersonalMaxHours(props.count, props.personalBestMaxHrs);
  }, [props.badgeData]);

  return (
    <>
      <div className="badge_md_image_container">
        <div className="badge_image_md" data-testid="badge-image-wrapper">
          <img
            data-testid={`badge-image-${props.index}`}
            src={props?.badgeData?.imageUrl}
            id={'popover_' + props.time + props.index.toString()}
            alt=""
          />

          {props.badgeData.type == 'Personal Max' ? (
            <span data-testid="badge_featured_count_personalmax" className={'badge_featured_count_personalmax'}>
              {`${Math.floor(badgeValue)} ${Math.floor(badgeValue) <= 1 ? ' hr' : ' hrs'}`}
            </span>
          ) : props.count < 100 ? (
            <span data-testid="badge_featured_count" className={'badge_featured_count'}>{Math.round(badgeValue)}</span>
          ) : (
            <span data-testid="badge_featured_count_3_digit" className="badge_featured_count_3_digit">{Math.round(badgeValue)}</span>
          )}
        </div>
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
