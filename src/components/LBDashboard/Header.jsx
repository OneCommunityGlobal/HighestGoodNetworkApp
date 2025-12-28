import { connect } from 'react-redux';
import { useState } from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

import { FiUser } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { IoNotificationsOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';

import styles from './Header.module.css';

function LBDashboardHeader(props) {
  const [selectedVillage, setSelectedVillage] = useState('');
  const { authUser } = props;

  return (
    <Navbar expand="lg" className={styles.item__navbar}>
      <Container fluid>
        {/* Left Section */}
        <div className={styles['item__navbar-left']}>
          <div className={styles.item__selector}>
            <select value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)}>
              <option value="Village 1">Village 1</option>
              <option value="Village 2">Village 2</option>
              <option value="Village 3">Village 3</option>
            </select>
          </div>

          <div className={styles.item__button}>
            <p>Go</p>
          </div>
        </div>

        {/* Right Section */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className={styles['item__navbar-right']}>
            <h2>WELCOME {authUser?.name || 'USER_NAME'}</h2>

            <div className={styles.item__icons}>
              <Nav>
                <Nav.Link as={Link} to="/bidding" className={styles['item__nav-link']}>
                  <BsChat className={styles['item__nav-icon']} />
                </Nav.Link>

                <Nav.Link as={Link} to="/bidding" className={styles['item__nav-link']}>
                  <IoNotificationsOutline className={styles['item__nav-icon']} />
                </Nav.Link>

                <Nav.Link as={Link} to="/bidding" className={styles['item__nav-link']}>
                  <FiUser className={styles['item__nav-icon']} />
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
