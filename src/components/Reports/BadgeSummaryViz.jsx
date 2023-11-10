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
} from 'reactstrap';
import { boxStyle } from '../../styles';
import '../Badge/BadgeReport.css';
import './BadgeSummaryViz.css';

function BadgeSummaryViz({ authId, userId, badges, dashboard }) {
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
        style={boxStyle}
        className={`${dashboard && 'btn--dark-sea-green float-right'}`}
      >
        {dashboard ? 'Badge Report' : 'Show Badges'}
      </Button>
      <Modal size="lg" isOpen={isOpen} toggle={toggle}>
        <ModalHeader>Badge Summary</ModalHeader>
        <ModalBody>
          <div>
            {/* --- DESKTOP VERSION OF MODAL --- */}
            <div className="desktop">
              <div style={{ overflowY: 'scroll', height: '75vh' }}>
                <Table>
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
                              id={`popover_${value.badge.badgeId}`}
                              alt="badge"
                            />
                          </td>
                          <UncontrolledPopover
                            trigger="hover"
                            target={`popover_${value.badge.badgeId}`}
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
                          <td>
                            {' '}
                            <UncontrolledDropdown className="me-2" direction="down">
                              <DropdownToggle caret color="primary" style={boxStyle}>
                                Dates
                              </DropdownToggle>
                              <DropdownMenu>
                                {value.earnedDate.map(date => {
                                  return <DropdownItem key={date}>{date}</DropdownItem>;
                                })}
                              </DropdownMenu>
                            </UncontrolledDropdown>
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
                <Table>
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
                        <tr key={value.badge._id}>
                          <td className="badge_image_sm">
                            {' '}
                            <img
                              src={value.badge.imageUrl}
                              id={`popover_${value.id}`}
                              alt="badge"
                            />
                          </td>
                          <UncontrolledPopover trigger="hover" target={`popover_${value.id}`}>
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
        <ModalFooter>
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
