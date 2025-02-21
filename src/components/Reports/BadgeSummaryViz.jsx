import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {
  Table,
  Button as ReactStrapButton,
  DropdownToggle,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from 'reactstrap';
import { useSelector } from 'react-redux';
import BadgeImage from 'components/Badge/BadgeImage';
import { boxStyle, boxStyleDark } from '../../styles';
import '../Badge/BadgeReport.css';
import './BadgeSummaryViz.css';

function BadgeSummaryViz({ authId, userId, badges, dashboard, personalBestMaxHrs }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [isOpen, setIsOpen] = useState(false);
  const [sortedBadges, setSortedBadges] = useState([]);

  useEffect(() => {
    try {
      if (badges && badges.length) {
        const sortBadges = badges
          .filter(badge => badge && badge.badge) // Filter out null or undefined badges
          .sort((a, b) => {
            const rankingA = a.badge?.ranking ?? Infinity;
            const rankingB = b.badge?.ranking ?? Infinity;
            const nameA = a.badge?.badgeName ?? '';
            const nameB = b.badge?.badgeName ?? '';
<<<<<<< HEAD
  
=======

>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
            if (rankingA === 0) return 1;
            if (rankingB === 0) return -1;
            if (rankingA > rankingB) return 1;
            if (rankingA < rankingB) return -1;
            return nameA.localeCompare(nameB);
          });
        setSortedBadges(sortBadges);
      } else {
        setSortedBadges([]);
      }
    } catch (error) {
<<<<<<< HEAD
      console.error("Error sorting badges:", error);
=======
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
      setSortedBadges([]);
    }
  }, [badges]);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <div>
      <Button
        onClick={toggle}
        style={darkMode ? boxStyleDark : boxStyle}
        className={`${dashboard && 'btn--dark-sea-green float-right'}`}
      >
        {dashboard ? 'Badge Report' : 'Show Badges'}
      </Button>
      <Modal size="lg" isOpen={isOpen} toggle={toggle} className={darkMode ? 'text-light' : ''}>
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Badge Summary</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div>
            {/* --- DESKTOP VERSION OF MODAL --- */}
            <div className="desktop">
              <div style={{ overflowY: 'scroll', height: '75vh' }}>
                <Table className={darkMode ? 'text-light dark-mode' : ''}>
                  <thead style={{ zIndex: '10' }}>
                    <tr style={{ zIndex: '10' }} className={darkMode ? 'bg-space-cadet' : ''}>
                      <th style={{ width: '93px' }}>Badge</th>
                      <th>Name</th>
                      <th style={{ width: '110px' }}>Modified</th>
                      <th style={{ width: '110px' }}>Earned Dates</th>
                      <th style={{ width: '90px' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badges && badges.length > 0 ? (
                      sortedBadges &&
<<<<<<< HEAD
                      sortedBadges.map(value => value && value.badge && (
                        <tr key={value.badge._id || value._id}>
                          <td className="badge_image_sm">
                            {value.badge.imageUrl && (
                              <img
                                src={value.badge.imageUrl}
                                id={`popover_${value.badge._id || value._id}`}
                                alt="badge"
                              />
                            )}
                          </td>
                          <UncontrolledPopover
                            trigger="hover"
                            target={`popover_${value.badge._id}`}
                          >
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
                          <td>{value.badge.badgeName}</td>
                          <td>
                            {typeof value.lastModified === 'string'
                              ? value.lastModified.substring(0, 10)
                              : value.lastModified.toLocaleString().substring(0, 10)}
                          </td>
                          <td style={{ display: 'flex', alignItems: 'center' }}>
                            <>
                              {' '}
                              <UncontrolledDropdown className="me-2" direction="down">
                                <DropdownToggle caret color="primary" style={darkMode ? boxStyleDark : boxStyle}>
                                  Dates
                                </DropdownToggle>
                                <DropdownMenu>
                                  {value.earnedDate.map((date, index) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <DropdownItem key={`date-${value._id}-${index}`}>
                                      {date}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                              {value?.hasBadgeDeletionImpact && value?.hasBadgeDeletionImpact === true ?
                              (<>
                                <span id="mismatchExplainationTooltip" style={{paddingLeft: '3px'}}>
                                  {'  '} *
                                </span>
                                <UncontrolledTooltip
                                  placement="bottom"
                                  target="mismatchExplainationTooltip"
                                  style={{ maxWidth: '300px' }}
                                >
                                  This record contains a mismatch in the badge count and associated dates. It indicates that a badge has been deleted. 
                                  Despite the deletion, we retain the earned date to ensure a record of the badge earned for historical purposes.
                                </UncontrolledTooltip>
                              </>)
                              : null
                              } 
                            </>
                          </td>
                          <td>{value.count}</td>
                        </tr>
                      ))
=======
                      sortedBadges.map(
                        (value, index) =>
                          value && (
                            <tr key={value.badge._id}>
                              <td className="badge_image_sm">
                                {' '}
                                <BadgeImage
                                  personalBestMaxHrs={personalBestMaxHrs}
                                  count={value.count}
                                  badgeData={value.badge}
                                  index={index}
                                  // key={index}
                                  cssSuffix="_viz"
                                />
                              </td>
                              <td>{value.badge.badgeName}</td>
                              <td>
                                {typeof value.lastModified === 'string'
                                  ? value.lastModified.substring(0, 10)
                                  : value.lastModified.toLocaleString().substring(0, 10)}
                              </td>
                              <td style={{ display: 'flex', alignItems: 'center' }}>
                                {' '}
                                <UncontrolledDropdown className="me-2" direction="down">
                                  <DropdownToggle
                                    caret
                                    color="primary"
                                    style={darkMode ? boxStyleDark : boxStyle}
                                  >
                                    Dates
                                  </DropdownToggle>
                                  <DropdownMenu>
                                    {value.earnedDate.map((date, valIndex) => (
                                      // eslint-disable-next-line react/no-array-index-key
                                      <DropdownItem key={`date-${value._id}-${valIndex}`}>
                                        {date}
                                      </DropdownItem>
                                    ))}
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                                {value?.hasBadgeDeletionImpact &&
                                value?.hasBadgeDeletionImpact === true ? (
                                  <>
                                    <span
                                      id="mismatchExplainationTooltip"
                                      style={{ paddingLeft: '3px' }}
                                    >
                                      {'  '} *
                                    </span>
                                    <UncontrolledTooltip
                                      placement="bottom"
                                      target="mismatchExplainationTooltip"
                                      style={{ maxWidth: '300px' }}
                                    >
                                      This record contains a mismatch in the badge count and
                                      associated dates. It indicates that a badge has been deleted.
                                      Despite the deletion, we retain the earned date to ensure a
                                      record of the badge earned for historical purposes.
                                    </UncontrolledTooltip>
                                  </>
                                ) : null}
                              </td>
                              <td>{value.count}</td>
                            </tr>
                          ),
                      )
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>{`${
                          dashboard || authId === userId ? 'You have' : 'This person has'
                        } no badges.`}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
            {/* --- TABLET VERSION OF MODAL --- */}
            <div className="tablet">
              <div style={{ overflow: 'auto', height: '68vh' }}>
                <Table className={darkMode ? 'text-light dark-mode' : ''}>
                  <thead style={{ zIndex: '10' }}>
                    <tr style={{ zIndex: '10' }} className={darkMode ? 'bg-space-cadet' : ''}>
                      <th style={{ width: '25%' }}>Badge</th>
                      <th style={{ width: '25%' }}>Name</th>
                      <th style={{ width: '25%' }}>Modified</th>
                      <th style={{ width: '25%', zIndex: '10' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badges && badges.length ? (
                      sortedBadges &&
<<<<<<< HEAD
                      sortedBadges.map(value => value && value.badge && (
                        <tr key={value.badge._id || value._id}>
                          <td className="badge_image_sm">
                            {value.badge.imageUrl && (
                              <img
                                src={value.badge.imageUrl}
                                id={`popover_${value.badge._id || value._id}`}
                                alt="badge"
                              />
                            )}
                          </td>
                          // ... rest of the code
                          <UncontrolledPopover trigger="hover" target={`popover_${value._id}`}>
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
                                  {value?.badge?.badgeName}
                                </CardTitle>
                                <CardText>{value?.badge?.description}</CardText>
                              </CardBody>
                            </Card>
                          </UncontrolledPopover>
                          <td>{value?.badge?.badgeName}</td>
                          <td>
                            {typeof value.lastModified === 'string'
                              ? value.lastModified.substring(0, 10)
                              : value.lastModified.toLocaleString().substring(0, 10)}
                          </td>
                          <td>{value?.count}</td>
                        </tr>
                      ))
=======
                      sortedBadges.map(
                        (value, index) =>
                          value && (
                            <tr key={value._id}>
                              <td className="badge_image_sm">
                                {' '}
                                <BadgeImage
                                  personalBestMaxHrs={personalBestMaxHrs}
                                  count={value.count}
                                  badgeData={value.badge}
                                  index={index}
                                  // key={index}
                                  cssSuffix="_viz"
                                />
                              </td>
                              <td>{value?.badge?.badgeName}</td>
                              <td>
                                {typeof value.lastModified === 'string'
                                  ? value.lastModified.substring(0, 10)
                                  : value.lastModified.toLocaleString().substring(0, 10)}
                              </td>
                              <td>{value?.count}</td>
                            </tr>
                          ),
                      )
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>{`${
                          dashboard || authId === userId ? 'You have' : 'This person has'
                        } no badges.`}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="badge_summary_viz_footer">
            <ReactStrapButton
              className="btn--dark-sea-green badge_summary_viz_button"
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

export default BadgeSummaryViz;
