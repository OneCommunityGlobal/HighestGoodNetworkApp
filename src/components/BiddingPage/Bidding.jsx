import { useState } from 'react';
import './bidding.css';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { FiUser } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { IoNotificationsOutline } from 'react-icons/io5';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';
import BiddingPageCard from './BiddingPageCard';

import banner from '../../assets/logo.png';

const ITEMS_PER_PAGE = 10;

const biddingData = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  image: banner,
  title: `Unit ${i + 1}, Earthbag Village`,
  amount: (i + 1) * 50,
}));

function BiddingPage() {
  const [selectedVillage, setSelectedVillage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(biddingData.length / ITEMS_PER_PAGE);

  // Get items for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedItems = biddingData.slice(startIndex, endIndex);

  // Change page function
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bidding">
      <div className="bidding-container">
        <Navbar expand="lg" className="bidding-navbar">
          <Container fluid>
            {/* Left Section - Village Selector */}
            <div className="bidding-navbar-left">
              <div className="bidding-navbar-selector">
                <select value={selectedVillage} onChange={e => setSelectedVillage(e.target.value)}>
                  <option value="Village 1">Village 1</option>
                  <option value="Village 2">Village 2</option>
                  <option value="Village 3">Village 3</option>
                </select>
              </div>
              <div className="bidding-navbar-button">
                <p>Go</p>
              </div>
            </div>

            {/* Right Section - User Info and Icons */}
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <div className="bidding-navbar-right">
                <h2>WELCOME USER_NAME</h2>
                <div className="bidding-navbar-right-icons">
                  <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/bidding">
                      <BsChat className="nav-icons" />
                    </Nav.Link>
                    <Nav.Link as={Link} to="/bidding">
                      <IoNotificationsOutline className="nav-icons" />
                    </Nav.Link>
                    <Nav.Link as={Link} to="/bidding">
                      <FiUser className="nav-icons" />
                    </Nav.Link>
                  </Nav>
                </div>
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div className="bidding-body-top">
          <div className="bidding-top-left">
            <HiOutlineAdjustmentsHorizontal className="bidding-top-icon" />
            <p>
              <span>Filter Data</span>
            </p>
          </div>
          <div className="bidding-top-middle">
            <p>
              Listings Page <Link to="/login">Bidding Page</Link>
            </p>
          </div>
          <div className="bidding-top-right">
            <FaMapMarkerAlt className="bidding-top-icon" style={{ color: 'red' }} />
            <Link to="/login">Property Map</Link>
          </div>
        </div>
        <div className="bidding-body-top-moblie">
          <div className="bidding-top-middle">
            <p>
              Listings Page <Link to="/login">Bidding Page</Link>
            </p>
          </div>
          <div className="bidding-top-middle-bottom-mobile">
            <div className="bidding-top-left">
              <HiOutlineAdjustmentsHorizontal className="bidding-top-icon" />
              <p>
                <span>Filter Data</span>
              </p>
            </div>

            <div className="bidding-top-right">
              <FaMapMarkerAlt className="bidding-top-icon" style={{ color: 'red' }} />
              <Link to="/login">Property Map</Link>
            </div>
          </div>
        </div>

        {/* Bidding Items */}
        <div className="bidding-body-bottom">
          {displayedItems.map(item => (
            <BiddingPageCard
              key={item.id}
              image={item.image}
              title={item.title}
              amount={item.amount}
            />
          ))}
        </div>

        {/* Pagination Component */}
        <Pagination className="bidding-pagination">
          <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Pagination.Item
              key={page}
              active={currentPage === page}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          ))}

          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </div>
  );
}

export default BiddingPage;
