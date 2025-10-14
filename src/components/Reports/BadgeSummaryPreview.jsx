import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MdPreview } from 'react-icons/md';
import {
  Button as ReactStrapButton,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from 'reactstrap';
import BadgeImage from '~/components/Badge/BadgeImage';
import { boxStyle, boxStyleDark } from '../../styles';
import styles from '../Badge/BadgeReport.module.css';
import './BadgeSummaryPreview.css';

function BadgeSummaryPreview({ badges, darkMode, personalBestMaxHrs }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedBadges, setSortedBadges] = useState([]);

  useEffect(() => {
    try {
      if (badges && badges.length) {
        const sortBadges = [...badges].sort((a, b) => {
          if (a?.badge?.ranking === 0) return 1;
          if (b?.badge?.ranking === 0) return -1;
          if (a?.badge?.ranking > b?.badge?.ranking) return 1;
          if (a?.badge?.ranking < b?.badge?.ranking) return -1;
          if (a?.badge?.badgeName > b?.badge?.badgeName) return 1;
          if (a?.badge?.badgeName < b?.badge?.badgeName) return -1;
          return 0;
        });
        setSortedBadges(sortBadges);
      }
    } catch (error) {
      // console.log(error);
    }
  }, [badges]);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <div>
      <Button onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
        <MdPreview style={{ fontSize: '23px' }} />
      </Button>
      <Modal size="lg" isOpen={isOpen} toggle={toggle}>
        <ModalHeader>Badge Summary Preview</ModalHeader>
        <ModalBody>
          <div>
            {/* --- DESKTOP VERSION OF MODAL --- */}
            <div className={styles.desktop}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {sortedBadges?.length === 0 && <div>No badges to show</div>}
                {sortedBadges &&
                  sortedBadges.map(
                    (value, index) =>
                      value && (
                        <div key={value._id} className={styles.badge_image_md}>
                          <BadgeImage
                            personalBestMaxHrs={personalBestMaxHrs}
                            count={value.count}
                            badgeData={value.badge}
                            index={index}
                            // key={index}
                            cssSuffix="_preview"
                          />
                        </div>
                      ),
                  )}
              </div>
            </div>
            {/* --- TABLET VERSION OF MODAL --- */}
            <div className={styles.tablet}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {sortedBadges &&
                  sortedBadges.map(
                    (value, index) =>
                      value && (
                        <div key={value._id} className={styles.badge_image_sm}>
                          <BadgeImage
                            personalBestMaxHrs={personalBestMaxHrs}
                            count={value.count}
                            badgeData={value.badge}
                            index={index}
                            // key={index}
                            cssSuffix="_preview"
                          />
                        </div>
                      ),
                  )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className={styles.badge_summary_preview_footer}>
            <ReactStrapButton
              className={`${styles['btn--dark-sea-green']} ${styles.badge_summary_preview_button}`}
              onClick={toggle}
            >
              Close
            </ReactStrapButton>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default BadgeSummaryPreview;
