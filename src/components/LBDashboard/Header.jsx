import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { FiUser } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { IoNotificationsOutline } from 'react-icons/io5';
import VillageDropdownFilter from './DropdownFilter/DropdownFilter';

function LBDashboardHeader() {
  const auth = useSelector(state => state.auth);
  const user = auth.user || {};

  const [firstName, setFirstName] = useState(
    auth.firstName || user.firstName || user.username || 'User',
  );
  const [displayUserId, setDisplayUserId] = useState(user.userid);

  useEffect(() => {
    const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));

    if (sessionStorageData) {
      setDisplayUserId(sessionStorageData.userId);
      setFirstName(sessionStorageData.firstName);
    } else {
      setDisplayUserId(user.userid);
      setFirstName(auth.firstName || user.firstName || user.username || 'User');
    }
  }, [auth.firstName, user]);

  return (
    <Navbar expand="lg" className="item__navbar">
      <Container fluid>
        {/* Left Section - Village Dropdown Filter */}
        <div className="item__navbar-left">
          <VillageDropdownFilter />
        </div>

        {/* Right Section - User Info and Icons */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="item__navbar-right">
            <h2>WELCOME {firstName}</h2>
            <div className="item__icons">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to="/bidding" className="item__nav-link">
                  <BsChat className="item__nav-icon" />
                </Nav.Link>
                <Nav.Link as={Link} to="/bidding" className="item__nav-link">
                  <IoNotificationsOutline className="item__nav-icon" />
                </Nav.Link>
                <Nav.Link as={Link} to={`/userprofile/${displayUserId}`} className="item__nav-link">
                  <FiUser className="item__nav-icon" />
                </Nav.Link>
              </Nav>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default LBDashboardHeader;
