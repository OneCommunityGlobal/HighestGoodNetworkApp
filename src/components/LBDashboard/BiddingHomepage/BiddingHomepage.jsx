import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Button,
  Input,
  InputGroup,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Label,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import {
  FaFilter,
  FaMapMarkerAlt,
  FaComment,
  FaBell,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import './BiddingHomepage.css';
import logo from '../../Collaboration/One-Community-Horizontal-Homepage-Header-980x140px-2.png';

const propertyListings = [
  {
    id: 405,
    title: 'Earthbag Village',
    type: 'Unit',
    village: 'Earthbag',
    image:
      'https://images.unsplash.com/photo-1570793005386-840846445fed?w=600&auto=format&fit=crop',
    currentBid: 40,
    night: true,
    createdDate: '2025-05-24',
    bidCount: 12,
    lastBidDate: '2025-05-25',
  },
  {
    id: 403,
    title: 'Straw Bale Village',
    type: 'Unit',
    village: 'Straw Bale',
    image:
      'https://images.unsplash.com/photo-1570793005386-840846445fed?w=600&auto=format&fit=crop',
    currentBid: 28,
    night: true,
    createdDate: '2025-05-23',
    bidCount: 8,
    lastBidDate: '2025-05-24',
  },
  {
    id: 203,
    title: 'Recycle Materials Village',
    type: 'Unit',
    village: 'Recycle Materials',
    image:
      'https://images.unsplash.com/photo-1570793005386-840846445fed?w=600&auto=format&fit=crop',
    currentBid: 30,
    night: true,
    createdDate: '2025-05-22',
    bidCount: 15,
    lastBidDate: '2025-05-25',
  },
  {
    id: 101,
    title: 'Cob Village',
    type: 'Unit',
    village: 'Cob',
    image:
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=600&auto=format&fit=crop',
    currentBid: 50,
    night: true,
    createdDate: '2025-05-20',
    bidCount: 22,
    lastBidDate: '2025-05-25',
  },
  {
    id: 105,
    title: 'Earthbag Village',
    type: 'Unit',
    village: 'Earthbag',
    image:
      'https://images.unsplash.com/photo-1570793005386-840846445fed?w=600&auto=format&fit=crop',
    currentBid: 20,
    night: true,
    createdDate: '2025-05-19',
    bidCount: 3,
    lastBidDate: '2025-05-24',
  },
  {
    id: 402,
    title: 'Tree House Village',
    type: 'Unit',
    village: 'Tree House',
    image:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop',
    currentBid: 52,
    night: true,
    createdDate: '2025-05-18',
    bidCount: 18,
    lastBidDate: '2025-05-23',
  },
  {
    id: 301,
    title: 'Earthbag Village',
    type: 'Unit',
    village: 'Earthbag',
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop',
    currentBid: 35,
    night: true,
    createdDate: '2025-05-15',
    bidCount: 9,
    lastBidDate: '2025-05-24',
  },
  {
    id: 206,
    title: 'Cob Village',
    type: 'Unit',
    village: 'Cob',
    image:
      'https://images.unsplash.com/photo-1448630360428-65456885c650?w=600&auto=format&fit=crop',
    currentBid: 45,
    night: true,
    createdDate: '2025-05-10',
    bidCount: 14,
    lastBidDate: '2025-05-25',
  },
  {
    id: 504,
    title: 'Straw Bale Village',
    type: 'Unit',
    village: 'Straw Bale',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format&fit=crop',
    currentBid: 33,
    night: true,
    createdDate: '2025-05-05',
    bidCount: 6,
    lastBidDate: '2025-05-22',
  },
  {
    id: 302,
    title: 'Tree House Village',
    type: 'Unit',
    village: 'Tree House',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop',
    currentBid: 60,
    night: true,
    createdDate: '2025-05-01',
    bidCount: 25,
    lastBidDate: '2025-05-25',
  },
  {
    id: 107,
    title: 'Recycle Materials Village',
    type: 'Unit',
    village: 'Recycle Materials',
    image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=600&auto=format&fit=crop',
    currentBid: 25,
    night: true,
    createdDate: '2025-04-28',
    bidCount: 4,
    lastBidDate: '2025-05-20',
  },
  {
    id: 408,
    title: 'Earthbag Village',
    type: 'Unit',
    village: 'Earthbag',
    image:
      'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=600&auto=format&fit=crop',
    currentBid: 42,
    night: true,
    createdDate: '2025-04-25',
    bidCount: 11,
    lastBidDate: '2025-05-23',
  },
  {
    id: 205,
    title: 'Cob Village',
    type: 'Unit',
    village: 'Cob',
    image:
      'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&auto=format&fit=crop',
    currentBid: 48,
    night: true,
    createdDate: '2025-04-20',
    bidCount: 19,
    lastBidDate: '2025-05-24',
  },
  {
    id: 305,
    title: 'Tree House Village',
    type: 'Unit',
    village: 'Tree House',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop',
    currentBid: 55,
    night: true,
    createdDate: '2025-04-15',
    bidCount: 16,
    lastBidDate: '2025-05-25',
  },
  {
    id: 501,
    title: 'Straw Bale Village',
    type: 'Unit',
    village: 'Straw Bale',
    image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=600&auto=format&fit=crop',
    currentBid: 38,
    night: true,
    createdDate: '2025-04-10',
    bidCount: 7,
    lastBidDate: '2025-05-22',
  },
  {
    id: 204,
    title: 'Recycle Materials Village',
    type: 'Unit',
    village: 'Recycle Materials',
    image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=600&auto=format&fit=crop',
    currentBid: 32,
    night: true,
    createdDate: '2025-03-25',
    bidCount: 5,
    lastBidDate: '2025-05-21',
  },
  {
    id: 109,
    title: 'Earthbag Village',
    type: 'Unit',
    village: 'Earthbag',
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop',
    currentBid: 37,
    night: true,
    createdDate: '2025-03-15',
    bidCount: 2,
    lastBidDate: '2025-05-23',
  },
  {
    id: 306,
    title: 'Tree House Village',
    type: 'Unit',
    village: 'Tree House',
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&auto=format&fit=crop',
    currentBid: 58,
    night: true,
    createdDate: '2025-02-28',
    bidCount: 21,
    lastBidDate: '2025-05-24',
  },
];

function BiddingHomepage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Filter by Village');
  const [searchQuery, setSearchQuery] = useState('');

  // Date filter states - replaced dropdown with date inputs
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterDropdownOpen, setDateFilterDropdownOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 items per page

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const toggleDateFilterDropdown = () => setDateFilterDropdownOpen(prevState => !prevState);

  const handleDateReset = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const filteredProperties = propertyListings.filter(property => {
    if (
      selectedFilter !== 'Filter by Village' &&
      !property.title.includes(selectedFilter.replace(' Village', ''))
    ) {
      return false;
    }

    if (
      searchQuery.trim() !== '' &&
      !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.id.toString().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (startDate || endDate) {
      const propertyDate = new Date(property.createdDate);

      if (startDate) {
        const startFilterDate = new Date(startDate);
        if (propertyDate < startFilterDate) return false;
      }

      if (endDate) {
        const endFilterDate = new Date(endDate);
        // Set end date to end of day for inclusive filtering
        endFilterDate.setHours(23, 59, 59, 999);
        if (propertyDate > endFilterDate) return false;
      }
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  const handlePageChange = page => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className={`bidding-bg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="logo-container">
        <img src={logo} alt="One Community - For The Highest Good Of All" className="main-logo" />
      </div>
      <Container fluid className={`bidding-homepage-container ${darkMode ? 'dark-mode' : ''}`}>
        <div className={`bidding-header ${darkMode ? 'dark-mode' : ''}`}>
          <Row className="align-items-center w-100">
            <Col md={6} className="d-flex align-items-center gap-2">
              <Dropdown isOpen={dropdownOpen} toggle={toggle} className="village-filter">
                <DropdownToggle caret>{selectedFilter}</DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => setSelectedFilter('Filter by Village')}>
                    All Villages
                  </DropdownItem>
                  <DropdownItem onClick={() => setSelectedFilter('Earthbag Village')}>
                    Earthbag Village
                  </DropdownItem>
                  <DropdownItem onClick={() => setSelectedFilter('Straw Bale Village')}>
                    Straw Bale Village
                  </DropdownItem>
                  <DropdownItem onClick={() => setSelectedFilter('Recycle Materials Village')}>
                    Recycle Materials Village
                  </DropdownItem>
                  <DropdownItem onClick={() => setSelectedFilter('Cob Village')}>
                    Cob Village
                  </DropdownItem>
                  <DropdownItem onClick={() => setSelectedFilter('Tree House Village')}>
                    Tree House Village
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <InputGroup className="search-bar">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Button className="go-button">Go</Button>
              </InputGroup>
            </Col>
            <Col md={6} className="text-right d-flex align-items-center justify-content-end gap-3">
              <span className="user-welcome">WELCOME USER_NAME</span>
              <div className="user-controls">
                <div className="messages">
                  <FaComment />
                </div>
                <div className="notifications">
                  <FaBell />
                  <span className="notification-badge">1</span>
                </div>
                <div className="user-profile">
                  <FaUser />
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className={`navigation-tabs ${darkMode ? 'dark-mode' : ''}`}>
          <div className="filter-by-date d-flex align-items-center gap-3">
            <Dropdown
              isOpen={dateFilterDropdownOpen}
              toggle={toggleDateFilterDropdown}
              className="date-filter"
            >
              <DropdownToggle caret className="date-dropdown-toggle">
                <FaFilter className="filter-icon-inline" />
                Filter by Date
                {(startDate || endDate) && <span className="filter-active-indicator">●</span>}
              </DropdownToggle>
              <DropdownMenu className="date-dropdown-menu">
                <div className="date-inputs-container">
                  <div className="date-input-group">
                    <Label for="startDate" className="date-label">
                      Start Date:
                    </Label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={e => {
                        setStartDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="date-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <Label for="endDate" className="date-label">
                      End Date:
                    </Label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={e => {
                        setEndDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="date-input"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <div className="reset-btn-container">
                      <Button
                        color="secondary"
                        size="sm"
                        onClick={handleDateReset}
                        className="reset-date-btn"
                      >
                        Reset Dates
                      </Button>
                    </div>
                  )}
                </div>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div className="tabs-container">
            <Link to="/lbdashboard/listOverview" className="tab tab-inactive">
              Listings Page
            </Link>
            <Link to="/lbdashboard/bidding" className="tab tab-active">
              Bidding Page
            </Link>
          </div>
          <div className="map-link">
            <Link to="/lbdashboard/masterplan" className="property-map-link">
              <span className="map-icon" style={{ color: '#e53935' }}>
                <FaMapMarkerAlt />
              </span>{' '}
              Property Map
            </Link>
          </div>
        </div>

        <Row className="property-listings mb-3">
          {currentProperties.length > 0 ? (
            currentProperties.map(property => (
              <Col key={property.id} className="property-card-col">
                <div className={`property-card property-card-gray ${darkMode ? 'dark-mode' : ''}`}>
                  <div className="property-image">
                    <img src={property.image} alt={property.title} />
                  </div>
                  <div className="property-info">
                    <div className="property-title-bold">
                      {property.type} {property.id}, {property.title}
                    </div>
                    <div className="property-bid-info">
                      Current bid:{' '}
                      <span className="property-bid-amount">${property.currentBid}/night</span>
                    </div>
                    <Link to={`/lbdashboard/bidoverview?propertyId=${property.id}`}>
                      <Button className="bid-more-btn">Bid more</Button>
                    </Link>
                  </div>
                </div>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center py-5">
              <h3 className={darkMode ? 'text-light' : ''}>
                No properties match your filter criteria
              </h3>
            </Col>
          )}
        </Row>

        {/* Pagination */}
        {filteredProperties.length > itemsPerPage && (
          <Row className="justify-content-center mb-4">
            <Col xs="auto">
              <Pagination className={`custom-pagination ${darkMode ? 'dark-mode' : ''}`}>
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink onClick={handlePrevPage}>
                    <FaChevronLeft />
                  </PaginationLink>
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                  <PaginationItem key={page} active={page === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(page)}>{page}</PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem disabled={currentPage === totalPages}>
                  <PaginationLink onClick={handleNextPage}>
                    <FaChevronRight />
                  </PaginationLink>
                </PaginationItem>
              </Pagination>
            </Col>
          </Row>
        )}

        {/* Results info */}
        <Row className="mb-3">
          <Col xs={12} className="text-center">
            <small className={`text-muted ${darkMode ? 'text-light' : ''}`}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProperties.length)} of{' '}
              {filteredProperties.length} properties
              {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </small>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default BiddingHomepage;
