import { connect } from 'react-redux';
import { useState } from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

import { FiUser } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { IoNotificationsOutline } from 'react-icons/io5';

function LBDashboardHeader({ authUser, villages = [], onVillageChange }) {
  const [selectedVillage, setSelectedVillage] = useState('');

  const handleGo = () => {
    onVillageChange?.(selectedVillage);
  };

  return (
    <Navbar expand="lg" className="item__navbar">
      <Container fluid>
        <div className="item__navbar-left">
          <div className="item__selector">
            <select value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)}>
              <option value="">All Villages</option>
              {villages.map(village => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="item__button" onClick={handleGo}>
            Go
          </button>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="item__navbar-right">
            <h2>WELCOME {authUser?.name || 'USER_NAME'}</h2>
            <div className="item__icons">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to="/bidding" className="item__nav-link">
                  <BsChat className="item__nav-icon" />
                </Nav.Link>
                <Nav.Link as={Link} to="/bidding" className="item__nav-link">
                  <IoNotificationsOutline className="item__nav-icon" />
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
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
});

export default connect(mapStateToProps)(LBDashboardHeader);
