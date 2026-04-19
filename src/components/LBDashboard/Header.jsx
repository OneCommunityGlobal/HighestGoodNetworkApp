import { connect, useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';

import { FiUser } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { IoNotificationsOutline } from 'react-icons/io5';

import { FIXED_VILLAGES } from './Home/data.jsx';
import itemStyles from './WishList/ItemOverview.module.css';

const cx = (base, darkClass, darkMode) => `${base} ${darkMode ? darkClass : ''}`.trim();

function LBDashboardHeader(props) {
  const [selectedVillage, setSelectedVillage] = useState('');
  const { authUser } = props;
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  const selectorWrapperStyle = darkMode
    ? {
        backgroundColor: '#1c2541',
        border: '1px solid #2f3b59',
      }
    : undefined;

  const selectorStyle = darkMode
    ? {
        backgroundColor: 'transparent',
        color: '#ffffff',
      }
    : undefined;

  const goButtonStyle = darkMode
    ? {
        backgroundColor: '#4f6fdc',
        borderColor: '#89a2ff',
      }
    : undefined;

  const handleGoClick = useCallback(() => {
    const qs = selectedVillage ? `?village=${encodeURIComponent(selectedVillage)}` : '';
    history.push(`/lbdashboard/listingshome${qs}`);
  }, [history, selectedVillage]);

  return (
    <Navbar
      expand="lg"
      className={cx(itemStyles.item__navbar, itemStyles['item__navbar--dark'], darkMode)}
    >
      <Container fluid>
        <div className={itemStyles['item__navbar-left']}>
          <div className={itemStyles.item__selector} style={selectorWrapperStyle}>
            <select
              value={selectedVillage}
              onChange={e => setSelectedVillage(e.target.value)}
              style={selectorStyle}
              aria-label="Filter by village"
            >
              <option value="">Select village</option>
              {FIXED_VILLAGES.map(v => (
                <option key={v} value={v}>
                  {v}
                  {v !== 'City Center' ? ' Village' : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={itemStyles.item__button}
            style={goButtonStyle}
            onClick={handleGoClick}
          >
            <p>Go</p>
          </button>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div
            className={cx(
              itemStyles['item__navbar-right'],
              itemStyles['item__navbar-right--dark'],
              darkMode,
            )}
          >
            <h2>WELCOME {authUser?.name || 'USER_NAME'}</h2>
            <div className={itemStyles.item__icons}>
              <Nav className="ml-auto">
                <Nav.Link
                  as={Link}
                  to="/lbdashboard/messaging"
                  className={cx(
                    itemStyles['item__nav-link'],
                    itemStyles['item__nav-link--dark'],
                    darkMode,
                  )}
                >
                  <BsChat className={itemStyles['item__nav-icon']} />
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/lbdashboard/bidding"
                  className={cx(
                    itemStyles['item__nav-link'],
                    itemStyles['item__nav-link--dark'],
                    darkMode,
                  )}
                >
                  <IoNotificationsOutline className={itemStyles['item__nav-icon']} />
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to={authUser?.userid ? `/userprofile/${authUser.userid}` : '/'}
                  className={cx(
                    itemStyles['item__nav-link'],
                    itemStyles['item__nav-link--dark'],
                    darkMode,
                  )}
                >
                  <FiUser className={itemStyles['item__nav-icon']} />
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
