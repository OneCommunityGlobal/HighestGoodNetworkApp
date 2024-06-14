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
import { boxStyle, boxStyleDark } from '../../styles';
import '../Badge/BadgeReport.css';
import './BadgeSummaryPreview.css';
import BadgeImage from 'components/Badge/BadgeImage';

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
      console.log(error);
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
            <div className="desktop">
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {sortedBadges?.length === 0 && <div>No badges to show</div>}
                {sortedBadges &&
                  sortedBadges.map(
                    (value, index) =>
                      value && (
                        <div key={value._id} className="badge_image_md">
                          <BadgeImage
                            personalBestMaxHrs={personalBestMaxHrs}
                            count={value.count}
                            badgeData={value.badge}
                            index={index}
                            key={index}
                            cssSuffix={'_preview'}
                          />
                        </div>
                      ),
                  )}
              </div>
            </div>
            {/* --- TABLET VERSION OF MODAL --- */}
            <div className="tablet">
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {sortedBadges &&
                  sortedBadges.map(
                    (value, index) =>
                      value && (
                        <div key={value._id} className="badge_image_sm">
                          <BadgeImage
                            personalBestMaxHrs={personalBestMaxHrs}
                            count={value.count}
                            badgeData={value.badge}
                            index={index}
                            key={index}
                            cssSuffix={'_preview'}
                          />
                        </div>
                      ),
                  )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="badge_summary_preview_footer">
            <ReactStrapButton
              className="btn--dark-sea-green badge_summary_preview_button"
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
