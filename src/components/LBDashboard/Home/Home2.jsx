import { useState } from 'react';
import { FaMapMarkerAlt, FaRegCommentDots, FaRegBell, FaUser, FaTh, FaList } from 'react-icons/fa';
import { BsSliders } from 'react-icons/bs';
import './Home.css';
import logo from '../../../assets/images/logo2.png';

function Home() {
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const properties = [
    { id: 405, village: 'Earthbag Village', price: 28 },
    { id: 403, village: 'Straw Bale Village', price: 32 },
    { id: 203, village: 'Recycle Materials Village', price: 40 },
    { id: 101, village: 'Cob Village', price: 25 },
    { id: 105, village: 'Earthbag Village', price: 50 },
    { id: 402, village: 'Tree House Village', price: 45 },
  ];

  const biddings = [
    { id: 405, village: 'Bidding Earthbag Village', price: 28 },
    { id: 403, village: 'Bidding Straw Bale Village', price: 32 },
    { id: 203, village: 'Bidding Recycle Materials Village', price: 40 },
    { id: 101, village: 'Bidding Cob Village', price: 25 },
    { id: 105, village: 'Bidding Earthbag Village', price: 50 },
    { id: 402, village: 'Bidding Tree House Village', price: 45 },
  ];

  return (
    <div className="outside-container">
      <div className="logo">
        <img src={logo} alt="One Community Logo" />
      </div>
      {/* Navbar */}
      <nav className="lb-navbar">
        <div className="nav-left">
          <select
            className="village-filter"
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
          >
            <option value="">Filter by Village</option>
            <option value="Earthbag">Earthbag</option>
            <option value="Straw Bale">Straw Bale</option>
            <option value="Recycle Materials">Recycle Materials</option>
            <option value="Cob">Cob</option>
          </select>
          <button className="go-button">Go</button>
        </div>

        <div className="nav-right">
          <span className="welcome-text">Welcome User_Name</span>
          <FaRegCommentDots className="nav-icon" />
          <div className="notification-badge">
            <FaRegBell className="nav-icon" />
            <span className="badge">3</span>
          </div>
          <FaUser className="nav-icon user-icon" />
        </div>
      </nav>

      <div className="inside-container">
        <div className="content-wrapper">
          <div className="content-header">
            {/* Property Map on Top Right */}
            <div className="property-map">
              <FaMapMarkerAlt className="map-icon" />
              <span className="map-text">Property Map</span>
            </div>

            {/* Main Content Section */}
            <div className="header-content">
              {/* Left: Filter Section */}
              <div className="filter-section">
                <BsSliders className="filter-icon" />
                <span className="filter-text">Filter by date</span>
              </div>

              {/* Center: Tabs Section */}
              <div className="tabs-section">
                <span
                  className={`tab ${activeTab === 'listings' ? 'active-tab' : 'inactive-tab'}`}
                  onClick={() => setActiveTab('listings')}
                >
                  Listings Page
                </span>
                <span
                  className={`tab ${activeTab === 'bidding' ? 'active-tab' : 'inactive-tab'}`}
                  onClick={() => setActiveTab('bidding')}
                >
                  Bidding Page
                </span>
              </div>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FaTh />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {/* Properties List */}
          <div
            className={`properties-container ${viewMode}-view ${
              activeTab === 'listings' ? 'show-listings' : 'hide'
            }`}
          >
            {properties.map(property => (
              <div key={property.id} className="property-card">
                <div className="property-image">{/* Add image here */}</div>
                <div className="property-details">
                  <h3>Unit {property.id}</h3>
                  <p>{property.village}</p>
                  <div className="price">${property.price}/day</div>
                </div>
              </div>
            ))}
          </div>

          {/* Biddings List */}
          <div
            className={`properties-container ${viewMode}-view ${
              activeTab === 'bidding' ? 'show-bidding' : 'hide'
            }`}
          >
            {biddings.map(property => (
              <div key={property.id} className="property-card">
                <div className="property-image">{/* Add image here */}</div>
                <div className="property-details">
                  <h3>Unit {property.id}</h3>
                  <p>{property.village}</p>
                  <div className="price">${property.price}/day</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
