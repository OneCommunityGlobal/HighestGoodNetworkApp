import { useState } from 'react';
import { Card, CardTitle, CardBody, CardImg, CardText, Popover } from 'reactstrap';
import styles from './StudentBadgeImage.module.css';

const hasRealHover = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover)').matches;

function StudentBadgeImage({ badgeData, time, index, personalBestMaxHrs, count, cssSuffix }) {
  const [isOpen, setOpen] = useState(false);
  cssSuffix = cssSuffix || '';

  const toggle = () => setOpen(prev => !prev);

  // 🧩 Sanitize ID for safe HTML attributes
  const safeId = `popover_${(time || '').replace(/\s+/g, '_').replace(/[^\w-]/g, '')}_${index}`;

  // Touch devices fire a synthetic "hover" on tap with no matching "leave" event,
  // so a hover-triggered popover opens and then never closes. Devices with no real
  // hover skip the popover entirely — tapping the badge already opens the full
  // detail modal (see the parent button in StudentBadgeGallery.jsx), which serves
  // as the touch-friendly equivalent.
  const touchDevice = !hasRealHover();

  return (
    <>
      {/* ✅ Only image and badge count here — no nested container */}
      <div
        className="badge_image_sm"
        style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
      >
        <img
          src={badgeData?.imageUrl}
          id={safeId}
          alt={badgeData?.badgeName || ''}
          loading="lazy"
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <BadgeSpan
          badgeType={badgeData.type}
          personalBestMaxHrs={personalBestMaxHrs}
          count={count}
          cssSuffix={cssSuffix}
        />
      </div>

      {!touchDevice && (
        <Popover
          trigger="hover"
          isOpen={isOpen}
          toggle={toggle}
          target={safeId}
          popperClassName={styles.studentBadgePopover}
        >
          <Card className={`text-center ${styles.popoverCard}`}>
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
      )}
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
  }

  if (count < 100) {
    return <span className={'badge_count' + cssSuffix}>{Math.round(count)}</span>;
  }

  return <span className={'badge_count_3_digit' + cssSuffix}>{Math.round(count)}</span>;
}

export default StudentBadgeImage;
