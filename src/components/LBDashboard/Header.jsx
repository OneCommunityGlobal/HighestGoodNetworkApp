import { useSelector } from 'react-redux';
import { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { FiUser } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { IoNotificationsOutline } from 'react-icons/io5';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function LBDashboardHeader({ notifications }) {
  const firstName = useSelector(state => state.auth.user.name);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationCount = notifications && notifications.length ? notifications.length : 0;

  return (
    <>
      <Navbar expand="lg" className="item__navbar">
        <Container fluid>
          {/* Left Section - Village Selector */}
          <div className="item__navbar-left">
            <div className="item__selector">
              <select value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)}>
                <option value="Village 1">Village 1</option>
                <option value="Village 2">Village 2</option>
                <option value="Village 3">Village 3</option>
              </select>
            </div>
            <div className="item__button">
              <p>Go</p>
            </div>
          </div>

          {/* Right Section - User Info and Icons */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="item__navbar-right">
              <h2>WELCOME {firstName || 'USER_NAME'}</h2>
              <div className="item__icons">
                <Nav className="ml-auto">
                  <Nav.Link as={Link} to="/bidding" className="item__nav-link">
                    <BsChat className="item__nav-icon" />
                  </Nav.Link>
                  <Nav.Link
                    as="span"
                    className="item__nav-link"
                    onClick={() => setShowNotifications(true)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <IoNotificationsOutline className="item__nav-icon" />
                    {notificationCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          background: 'red',
                          color: 'white',
                          borderRadius: '50%',
                          width: 18,
                          height: 18,
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1,
                        }}
                      >
                        {notificationCount}
                      </span>
                    )}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/bidding" className="item__nav-link">
                    <FiUser className="item__nav-icon" />
                  </Nav.Link>
                </Nav>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showNotifications} onHide={() => setShowNotifications(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notifications</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications && notifications.length > 0 ? (
            <ul>
              {notifications.map((notif, idx) => (
                <li key={notif._id || idx}>
                  {notif.message ? notif.message : 'No message available'}
                </li>
              ))}
            </ul>
          ) : (
            <p>No notifications.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotifications(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LBDashboardHeader;
