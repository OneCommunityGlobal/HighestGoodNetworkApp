import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {MdPreview} from 'react-icons/md';
import {
  Button as ReactStrapButton,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  UncontrolledPopover,
} from 'reactstrap';
import { boxStyle } from 'styles';
import '../Badge/BadgeReport.css'
import './BadgeSummaryPreview.css'

const BadgeSummaryPreview = ({ badges }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sortedBadges, setSortedBadges] = useState([]);

  useEffect(() => {
      if(badges && badges.length) {
        const sortBadges = [...badges].sort((a, b) => {
          if (a.badge.ranking === 0) return 1;
          if (b.badge.ranking === 0) return -1;
          if (a.badge.ranking > b.badge.ranking) return 1;
          if (a.badge.ranking < b.badge.ranking) return -1;
          if (a.badge.badgeName > b.badge.badgeName) return 1;
          if (a.badge.badgeName < b.badge.badgeName) return -1;
          return 0;
        });
        setSortedBadges(sortBadges)
      }
  }, [badges]);
  
const toggle = () => setIsOpen(prev => !prev)

return (
  <div>
    <Button onClick={toggle} style={boxStyle}>
      <MdPreview style={{fontSize: '23px'}}/>
    </Button>
    <Modal size="lg" isOpen={isOpen} toggle={toggle}>
      <ModalHeader>Badge Summary Preview</ModalHeader>
      <ModalBody>
        <div>
        {/* --- DESKTOP VERSION OF MODAL --- */}
          <div className="desktop">
            <div style={{display: 'flex', flexWrap: 'wrap'}}> 
            {!!sortedBadges && <div>No badges to show</div>}
            {sortedBadges && sortedBadges.map((value, index)=> (
              <div className='badge_image_md'>
              <img src={value.badge.imageUrl} id={'popover_' + index.toString()} />
              <UncontrolledPopover trigger="hover" target={'popover_' + index.toString()}>
                    <Card className="text-center">
                      <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
                      <CardBody>
                        <CardTitle
                          style={{
                            fontWeight: 'bold',
                            fontSize: 18,
                            color: '#285739',
                            marginBottom: 15,
                          }}
                        >
                          {value.badge?.badgeName}
                        </CardTitle>
                        <CardText>{value.badge?.description}</CardText>
                      </CardBody>
                    </Card>
                  </UncontrolledPopover>
              </ div>
            ))}
            </div>
          </div>
          {/* --- TABLET VERSION OF MODAL --- */}
          <div className="tablet">
            <div style={{display: 'flex', flexWrap: 'wrap'}}> 
            {sortedBadges && sortedBadges.map((value, index)=> (
              <div className='badge_image_sm'>
              <img src={value.badge.imageUrl} id={'popover1_' + index.toString()} />
              <UncontrolledPopover trigger="hover" target={'popover1_' + index.toString()}>
                      <Card className="text-center">
                        <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
                        <CardBody>
                          <CardTitle
                            style={{
                              fontWeight: 'bold',
                              fontSize: 18,
                              color: '#285739',
                              marginBottom: 15,
                            }}
                          >
                            {value.badge?.badgeName}
                          </CardTitle>
                          <CardText>{value.badge?.description}</CardText>
                        </CardBody>
                      </Card>
                    </UncontrolledPopover>
              </ div>
            ))}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
          <div className='badge_summary_preview_footer'>
            <ReactStrapButton
              className="btn--dark-sea-green badge_summary_preview_button"
              onClick={toggle}
            >
              Close
            </ReactStrapButton>
          </div>
      </ModalFooter>
    </Modal>
  </div>)
}

export default BadgeSummaryPreview