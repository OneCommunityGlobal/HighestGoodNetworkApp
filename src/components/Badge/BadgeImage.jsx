import { useState } from 'react';
import { Card, CardTitle, CardBody, CardImg, CardText, Popover } from 'reactstrap';

function BadgeImage({ badgeData, time, index, personalBestMaxHrs, count }) {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(prevIsOpen => !prevIsOpen);

  return (
    <>
      <div className="badge_image_container">
        <div className="badge_image_sm">
          <img
            src={badgeData?.imageUrl}
            id={`popover_${time}${index.toString()}`}
            alt=""
            loading="lazy"
          />
        </div>

        {badgeData.type === 'Personal Max' && (
          <span className="badge_count_personalmax">{Math.floor(personalBestMaxHrs)}</span>
        )}
        {badgeData.type !== 'Personal Max' && count < 100 && (
          <span className="badge_count">{Math.round(count)}</span>
        )}
        {badgeData.type !== 'Personal Max' && count >= 100 && (
          <span className="badge_count_3_digit">{Math.round(count)}</span>
        )}
      </div>
      <Popover
        trigger="hover"
        isOpen={isOpen}
        toggle={toggle}
        target={`popover_${time}${index.toString()}`}
      >
        <Card className="text-center">
          <CardImg className="badge_image_lg" src={badgeData?.imageUrl} />
          <CardBody>
            <CardTitle
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#285739',
                marginBottom: 15,
              }}
            >
              {badgeData?.badgeName}
            </CardTitle>
            <CardText>{badgeData?.description}</CardText>
          </CardBody>
        </Card>
      </Popover>
    </>
  );
}

export default BadgeImage;
