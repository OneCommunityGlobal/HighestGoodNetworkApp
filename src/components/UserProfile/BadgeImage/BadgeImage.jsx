import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Card, CardBody, CardImg, CardText, CardTitle, Popover } from 'reactstrap';
import styles from '../Badge.module.css';


const BadgeImage = props => {
  const [isOpen, setOpen] = useState(false);
  const [badgeValue, setBadgeValue] = useState(props.count);

  const toggle = () => setOpen(isOpen => !isOpen);

  const updateBadgeValue = (countValue, personalBestMaxHrs) => {
    if(props.badgeData.type == 'Personal Max'){ 
      // show the personal best hours or mannually updated hours
      if (countValue > personalBestMaxHrs) {
        setBadgeValue(countValue);
      }
      else{
        setBadgeValue(personalBestMaxHrs);
      }
    }
    else{
      setBadgeValue(countValue);
    }
  }

  useEffect(() => {
    // update the badge value when save changes simultaneously
    updateBadgeValue(props.count, props.personalBestMaxHrs);
  }, [props.badgeData, props.count, props.personalBestMaxHrs]);

  return (
    <>
      <div className={styles.badge_md_image_container}>
        <div className={styles.badge_image_md} data-testid="badge-image-wrapper">
          <img
            data-testid={`badge-image-${props.index}`}
            src={props?.badgeData?.imageUrl}
            id={'popover_' + props.time + props.index.toString()}
            alt=""
          />

          {props.badgeData.type == 'Personal Max' ? (
            <span data-testid="badge_featured_count_personalmax" className={styles.badge_featured_count_personalmax}>
              {`${Math.floor(badgeValue)} ${Math.floor(badgeValue) <= 1 ? ' hr' : ' hrs'}`}
            </span>
          ) : props.count < 100 ? (
            <span data-testid="badge_featured_count" className={styles.badge_featured_count}>{Math.round(badgeValue)}</span>
          ) : (
            <span data-testid="badge_featured_count_3_digit"className={styles.badge_featured_count_3_digit}>{Math.round(badgeValue)}</span>
          )}
        </div>
      </div>
      <Popover
        trigger="hover"
        isOpen={isOpen}
        toggle={toggle}
        target={'popover_' + props.time + props.index.toString()}
      >
        <Card className="text-center" style={{maxWidth: '220px'}}>
          <CardImg style={{width: '120px', height: '120px', margin: '0 auto', display: 'block'}} src={props?.badgeData?.imageUrl} />
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

BadgeImage.propTypes = {
  badgeData: PropTypes.shape({
    imageUrl: PropTypes.string,
    type: PropTypes.string,
    badgeName: PropTypes.string,
    description: PropTypes.string,
    ranking: PropTypes.number,
  }),
  count: PropTypes.number,
  index: PropTypes.number,
  time: PropTypes.string,
  personalBestMaxHrs: PropTypes.number,
};

export default BadgeImage;
