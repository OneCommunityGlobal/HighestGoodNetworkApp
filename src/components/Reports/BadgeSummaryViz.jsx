import React, { useState, useEffect } from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';
import {
  Table,
  Button,
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
import { boxStyle } from 'styles';

const BadgeSummaryViz = (props) => {
  const {
    userId,
    badges,
    role,
    firstName,
    lastName,
    permissions
  } = props

  // console.log("🚀 ~ file: BadgeSummaryViz.jsx:54 ~ BadgeSummaryViz ~ props:", props)

  const [isOpen, setIsOpen] = useState(false);
  const [sortBadges, setSortBadges] = useState(badges || []);
  let [numFeatured, setNumFeatured] = useState(0);
  let [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // setSortBadges(props.badges.slice() || []);
    setSortBadges([]);
    let newBadges = sortBadges.slice();
    newBadges.sort((a, b) => {
      if (a.badge.ranking === 0) return 1;
      if (b.badge.ranking === 0) return -1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;
      return 0;
    });
    setNumFeatured(0);
    newBadges.forEach((badge, index) => {
      if (badge.featured) {
        setNumFeatured(++numFeatured);
      }

      if (typeof newBadges[index] === 'string') {
        newBadges[index].lastModified = new Date(newBadges[index].lastModified);
      }
    });
    setSortBadges(newBadges);
  }, [props.badges]);
  
const toggle = () => setIsOpen(prev => !prev)

return (
  <div>
    <BootstrapButton onClick={toggle} style={boxStyle}>
      Show Badge Summary
    </BootstrapButton>
    <Modal size="lg" isOpen={isOpen} toggle={toggle}>
      <ModalHeader>Badge Summary</ModalHeader>
      <ModalBody>
      <div>

      {/* DESKTOP VERSION OF MODAL */}

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

            {/* //* TODO: SORT BADGES */}

                {badges &&
                  badges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={'popover_' + index.toString()} />
                    </td>
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
                    <td>{value.badge.badgeName}</td>
                    <td>
                      {typeof value.lastModified == 'string'
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
                            return <DropdownItem>{date}</DropdownItem>;
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>

                    {/* //* TODO: CREATE NEW COUNT METHOD */}

                    <td>
                      1
                    </td>

                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* TABLET VERSION OF MODAL */}

      <div className="tablet">
        <div style={{ overflow: 'auto', height: '68vh' }}>
          <Table>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '93px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '100%', zIndex: '10' }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {badges &&
                badges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={'popover_' + index.toString()} />
                    </td>

                    {/* //* TOD0: TEST POPOVER ON MOBILE */}

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

                    <td>{value.badge.badgeName}</td>
                    <td>
                      {typeof value.lastModified == 'string'
                        ? value.lastModified.substring(0, 10)
                        : value.lastModified.toLocaleString().substring(0, 10)}
                    </td>

                    <td>
                      {/* //* TODO: COUNT GOES HERE */}
                      1
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
      </ModalBody>

    {/* //* TODO: Add breakpoint styles to ModalFooter */}

    <ModalFooter>
      <div style={{ margin: "0.5rem auto" }}>
        <Button
          className="btn--dark-sea-green"
          style={{ width: "100%" }}
          onClick={toggle}
        >
          Close
        </Button>
      </div>
    </ModalFooter>

    </Modal>
  </div>)
}


export default BadgeSummaryViz