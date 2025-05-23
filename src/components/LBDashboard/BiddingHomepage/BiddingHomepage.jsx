import { useState } from 'react';
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
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { FaFilter, FaMapMarkerAlt, FaComment, FaBell, FaUser } from 'react-icons/fa';
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
  },
];

function BiddingHomepage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Filter by Village');
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const filteredProperties = propertyListings.filter(property => {
    // Apply village filter
    if (
      selectedFilter !== 'Filter by Village' &&
      !property.title.includes(selectedFilter.replace(' Village', ''))
    ) {
      return false;
    }
    // Apply search filter
    if (
      searchQuery.trim() !== '' &&
      !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !property.id.toString().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="bidding-bg">
      <div className="logo-container">
        <img src={logo} alt="One Community - For The Highest Good Of All" className="main-logo" />
      </div>
      <Container fluid className="bidding-homepage-container">
        <div className="bidding-header">
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
        <div className="navigation-tabs">
          <div className="filter-by-date">
            <div className="filter-icon">
              <FaFilter />
            </div>
            <span className="filter-by-date-text">Filter by date</span>
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
        <Row className="property-listings mb-5">
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <Col md={4} key={property.id} className="property-card-col">
                <div className="property-card property-card-gray">
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
              <h3>No properties match your filter criteria</h3>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
}

export default BiddingHomepage;
