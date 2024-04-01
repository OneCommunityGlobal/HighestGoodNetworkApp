import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import {
  Table,
  Button as ReactStrapButton,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  UncontrolledDropdown,
  UncontrolledPopover,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip
} from 'reactstrap';
import { boxStyle } from '../../styles';
import '../Badge/BadgeReport.css';
import './BadgeSummaryViz.css';
import { useSelector } from 'react-redux';

function BadgeSummaryViz({ authId, userId, badges, dashboard }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [isOpen, setIsOpen] = useState(false);
  const [sortedBadges, setSortedBadges] = useState([]);

  useEffect(() => {
    if (badges && badges.length) {
      const sortBadges = [...badges].sort((a, b) => {
        if (a.badge.ranking === 0) return 1;
        if (b.badge.ranking === 0) return -1;
        if (a.badge.ranking > b.badge.ranking) return 1;
        if (a.badge.ranking < b.badge.ranking) return -1;
        if (a.badge.badgeName > b.badge.badgeName) return 1;
        if (a.badge.badgeName < b.badge.badgeName) return -1;
        return 0;
      });
      setSortedBadges(sortBadges);
    }
  }, [badges]);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <div>
      <Button
        onClick={toggle}
        style={{
          ...(darkMode && { boxShadow: "2px 2px 4px 1px black" }),
          ...(!darkMode && boxStyle)
        }}
        className={`${dashboard && 'btn--dark-sea-green float-right'}`}
      >
        {dashboard ? 'Badge Report' : 'Show Badges'}
      </Button>
      <Modal size="lg" isOpen={isOpen} toggle={toggle}>
        <ModalHeader className={darkMode && "bg-oxford-blue text-azure"}>Badge Summary</ModalHeader>
        <ModalBody  className={darkMode && "bg-oxford-blue text-azure"}>
          <div>
            {/* --- DESKTOP VERSION OF MODAL --- */}
            <div className="desktop">
              <div style={{ overflowY: 'scroll', height: '75vh' }}>
                <Table className={darkMode && 'text-azure'}>
                  <thead style={{ zIndex: '10' }}>
                    <tr style={{ zIndex: '10' }}>
                      <th style={{ width: '93px' }}>Badge</th>
                      <th>Name</th>
                      <th style={{ width: '110px' }}>Modified</th>
                      <th style={{ width: '110px' }}>Earned Dates</th>
                      <th style={{ width: '90px' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badges && badges.length ? (
                      sortedBadges &&
                      sortedBadges.map(value => (
                        <tr key={value.badge._id}>
                          <td className="badge_image_sm">
                            {' '}
                            <img
                              src={value.badge.imageUrl}
                              id={`popover_${value.badge._id}`}
                              alt="badge"
                            />
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
                                    color: darkMode ? '#007BFF' : '#285739',
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
                                <DropdownToggle caret color="primary" style={boxStyle}>
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
                              {value.hasBadgeDeletionImpact && value.hasBadgeDeletionImpact === true ?
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
                <Table className={darkMode && 'text-azure'}>
                  <thead style={{ zIndex: '10' }}>
                    <tr style={{ zIndex: '10' }}>
                      <th style={{ width: '25%' }}>Badge</th>
                      <th style={{ width: '25%' }}>Name</th>
                      <th style={{ width: '25%' }}>Modified</th>
                      <th style={{ width: '25%', zIndex: '10' }}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badges && badges.length ? (
                      sortedBadges &&
                      sortedBadges.map(value => (
                        <tr key={value._id}>
                          <td className="badge_image_sm">
                            {' '}
                            <img
                              src={value.badge.imageUrl}
                              id={`popover_${value._id}`}
                              alt="badge"
                            />
                          </td>
                          <UncontrolledPopover trigger="hover" target={`popover_${value._id}`}>
                            <Card className="text-center">
                              <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
                              <CardBody>
                                <CardTitle
                                  style={{
                                    fontWeight: 'bold',
                                    fontSize: 18,
                                    color: darkMode ? '#007BFF' : '#285739',
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
                          <td>{value.count}</td>
                        </tr>
                      ))
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
        <ModalFooter className={darkMode && "bg-oxford-blue text-azure"}>
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
