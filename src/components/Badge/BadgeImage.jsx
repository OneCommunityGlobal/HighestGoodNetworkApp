import { useState } from 'react';
import { Card, CardTitle, CardBody, CardImg, CardText, Popover } from 'reactstrap';

function BadgeImage({ badgeData, time, index, personalBestMaxHrs, count, cssSuffix }) {
  const [isOpen, setOpen] = useState(false);
  cssSuffix = cssSuffix ? cssSuffix : '';
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
        <BadgeSpan
          badgeType={badgeData.type}
          personalBestMaxHrs={personalBestMaxHrs}
          count={count}
          cssSuffix={cssSuffix}
        />
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

function BadgeSpan({ badgeType, personalBestMaxHrs, count, cssSuffix }) {
  if (badgeType === 'Personal Max') {
    return (
      <span className={'badge_count_personalmax' + cssSuffix}>
        {Math.floor(personalBestMaxHrs)}
      </span>
    );
  } else {
    if (count < 100) {
      return <span className={'badge_count' + cssSuffix}>{Math.round(count)}</span>;
    } else {
      return <span className={'badge_count_3_digit' + cssSuffix}>{Math.round(count)}</span>;
    }
  }
}

export default BadgeImage;
