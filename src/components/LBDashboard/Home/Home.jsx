import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaMapMarkerAlt,
  FaRegCommentDots,
  FaRegBell,
  FaUser,
  FaTh,
  FaList,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from 'react-icons/fa';
import { BsSliders } from 'react-icons/bs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Home.css';
import L from 'leaflet';
import logo from '../../../assets/images/logo2.png';
import api, { FIXED_VILLAGES } from './data';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const unitIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function Home() {
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('listings');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPropertyMap, setShowPropertyMap] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState('John');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  const [villageSearchTerm, setVillageSearchTerm] = useState('');
  const [villagePagination, setVillagePagination] = useState({
    currentPage: 1,
    pageSize: 20,
  });

  const [allListings, setAllListings] = useState([]);
  const [allBiddings, setAllBiddings] = useState([]);
  const [allVillages, setAllVillages] = useState([...FIXED_VILLAGES]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 1,
  });

  const pageSizeOptions = [12, 24, 36, 48];

  useEffect(() => {
    const fetchVillagesData = async () => {
      try {
        const villages = await api.fetchVillages();
        setAllVillages(villages);
      } catch (error) {
        console.error('Error fetching villages:', error);
        setAllVillages([...FIXED_VILLAGES]);
      }
    };

    fetchVillagesData();
  }, []);

  const filteredVillages = useMemo(() => {
    return allVillages.filter(village =>
      village.toLowerCase().includes(villageSearchTerm.toLowerCase()),
    );
  }, [villageSearchTerm, allVillages]);

  const paginatedVillages = useMemo(() => {
    const startIdx = (villagePagination.currentPage - 1) * villagePagination.pageSize;
    return filteredVillages.slice(startIdx, startIdx + villagePagination.pageSize);
  }, [filteredVillages, villagePagination]);

  const totalVillagePages = useMemo(
    () => Math.max(1, Math.ceil(filteredVillages.length / villagePagination.pageSize)),
    [filteredVillages.length, villagePagination.pageSize],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const filters = {};
        if (selectedVillage) filters.village = selectedVillage;
        if (dateRange.startDate) filters.availableFrom = dateRange.startDate;
        if (dateRange.endDate) filters.availableTo = dateRange.endDate;

        if (activeTab === 'listings') {
          try {
            const listingsData = await api.fetchListings(
              pagination.currentPage,
              pagination.pageSize,
              filters,
            );

            setAllListings(listingsData.items || []);

            setPagination(prev => ({
              ...prev,
              totalPages: listingsData.pagination.totalPages || 1,
            }));
          } catch (error) {
            console.error('API Error (Listings):', error);
            setError('Failed to fetch listings. Please try again later.');

            setAllListings([]);
          }
        } else {
          try {
            const biddingsData = await api.fetchBiddings(
              pagination.currentPage,
              pagination.pageSize,
              filters,
            );

            setAllBiddings(biddingsData.items || []);

            setPagination(prev => ({
              ...prev,
              totalPages: biddingsData.pagination.totalPages || 1,
            }));
          } catch (error) {
            console.error('API Error (Biddings):', error);
            setError('Failed to fetch biddings. Please try again later.');

            setAllBiddings([]);
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagination.currentPage, pagination.pageSize, selectedVillage, dateRange, activeTab]);

  const currentItems = activeTab === 'listings' ? allListings : allBiddings;
  const allItems = activeTab === 'listings' ? allListings : allBiddings;

  const handlePageChange = useCallback(
    newPage => {
      if (newPage < 1 || newPage > pagination.totalPages) return;
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    },
    [pagination.totalPages],
  );

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [activeTab]);

  const handlePropertySelect = useCallback(property => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  }, []);

  const closeAllModals = useCallback(() => {
    setShowDatePicker(false);
    setShowPropertyMap(false);
    setShowNotifications(false);
    setShowPropertyDetails(false);
  }, []);

  useEffect(() => {
    const handleEsc = event => {
      if (event.keyCode === 27) {
        closeAllModals();
      }
    };

    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [closeAllModals]);

  const applyFilters = useCallback(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowDatePicker(false);
  }, []);

  const clearFilters = useCallback(() => {
    setDateRange({ startDate: '', endDate: '' });
    setSelectedVillage('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setShowDatePicker(false);
  }, []);

  const adjustDatesByWeek = useCallback(
    direction => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);

      const daysToAdjust = direction === 'forward' ? 7 : -7;
      startDate.setDate(startDate.getDate() + daysToAdjust);
      endDate.setDate(endDate.getDate() + daysToAdjust);

      const formatDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      setDateRange({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });
    },
    [dateRange],
  );

  const handleGoButtonClick = useCallback(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [selectedVillage]);

  const handleMarkerClick = useCallback(property => {
    setSelectedProperty(property);
  }, []);

  const viewPropertyDetailsFromMap = useCallback(property => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
    setShowPropertyMap(false);
  }, []);

  const filterByVillageFromMap = useCallback(village => {
    setSelectedVillage(village);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  return (
    <div className="outside-container">
      {/* Logo Section */}
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>

      {/* Navigation Bar */}
      <nav className="lb-navbar">
        <div className="nav-left">
          <select
            className="village-filter"
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
          >
            <option value="">Filter by Village</option>
            {allVillages.map(v => (
              <option key={v} value={v}>
                {v} {v !== 'City Center' ? 'Village' : ''}
              </option>
            ))}
          </select>
          <button className="go-button" onClick={handleGoButtonClick}>
            Go
          </button>
        </div>
        <div className="nav-right">
          <span className="welcome-text">WELCOME {userName}</span>
          <FaRegCommentDots
            className="nav-icon"
            title="Messages"
            onClick={() => (window.location.href = '/chat')}
          />
          <div className="notification-badge">
            <FaRegBell
              className="nav-icon"
              title="Notifications"
              onClick={() => setShowNotifications(true)}
            />
            <span className="badge">3</span>
          </div>
          <FaUser
            className="nav-icon user-icon"
            title="Profile"
            onClick={() => (window.location.href = '/profile')}
          />
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="inside-container">
        {/* Content Header with Map Link */}
        <div className="content-header">
          <div
            className="property-map"
            onClick={() => setShowPropertyMap(true)}
            title="View Property Map"
          >
            <FaMapMarkerAlt className="map-icon" />
            <span className="map-text">Property Map</span>
          </div>

          <div className="header-content">
            {/* Filter Section */}
            <div
              className="filter-section"
              onClick={() => setShowDatePicker(true)}
              title="Filter by Date Range"
            >
              <BsSliders className="filter-icon" />
              <span className="filter-text">Filter by date</span>
            </div>

            {/* Tabs Section */}
            <div className="tabs-section">
              <span
                className={`tab ${activeTab === 'listings' ? 'active-tab' : 'inactive-tab'}`}
                onClick={() => setActiveTab('listings')}
              >
                Listings
              </span>
              <span
                className={`tab ${activeTab === 'bidding' ? 'active-tab' : 'inactive-tab'}`}
                onClick={() => setActiveTab('bidding')}
              >
                Biddings
              </span>
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <FaTh />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <div className="loading-indicator">Loading properties...</div>}

        {/* Error State */}
        {error && <div className="error-message">{error}</div>}

        {/* No Results State */}
        {!isLoading && !error && currentItems.length === 0 && (
          <div className="no-results">
            No properties found matching your criteria. Try adjusting your filters.
          </div>
        )}

        {/* Properties Container */}
        {!isLoading && !error && (
          <div className={`properties-container ${viewMode}-view`}>
            {currentItems.map(unit => (
              <div
                key={unit.id}
                className="property-card"
                onClick={() => handlePropertySelect(unit)}
              >
                <div className="property-image">
                  <img src={unit.images[0]} alt={unit.title} />
                </div>
                <div className="property-details">
                  <div>
                    <h3>{unit.title}</h3>
                    <p>
                      {unit.village} {unit.village !== 'City Center' ? 'Village' : ''}
                    </p>
                  </div>
                  <div className={`price ${unit.isBidding ? 'bidding-price' : ''}`}>
                    ${unit.price}/{unit.perUnit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && currentItems.length > 0 && (
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="pagination-button"
            >
              Prev
            </button>
            <span className="pagination-info">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="pagination-button"
            >
              Next
            </button>
            <div className="page-size-selector">
              <span>Show:</span>
              <select
                value={pagination.pageSize}
                onChange={e => {
                  const newSize = Number(e.target.value);
                  setPagination(prev => ({
                    ...prev,
                    pageSize: newSize,
                    currentPage: 1,
                  }));
                }}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="modal-overlay" onClick={() => setShowDatePicker(false)}>
          <div className="date-picker-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Date Range</h3>
              <div className="close-button-wrapper">
                <FaTimes className="close-button" onClick={() => setShowDatePicker(false)} />
              </div>
            </div>
            <div className="date-picker-content">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                    min={dateRange.startDate}
                  />
                </div>
              </div>

              {/* Date Navigation (week forward/backward) - Airbnb-like feature */}
              {dateRange.startDate && dateRange.endDate && (
                <div className="date-navigation">
                  <button className="date-nav-button" onClick={() => adjustDatesByWeek('backward')}>
                    <FaChevronLeft /> Previous Week
                  </button>
                  <button className="date-nav-button" onClick={() => adjustDatesByWeek('forward')}>
                    Next Week <FaChevronRight />
                  </button>
                </div>
              )}

              <div className="date-picker-actions">
                <button className="apply-button" onClick={applyFilters}>
                  Apply
                </button>
                <button className="clear-button" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Map Modal */}
      {showPropertyMap && (
        <div className="modal-overlay" onClick={() => setShowPropertyMap(false)}>
          <div className="property-map-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Property Map
                {selectedVillage &&
                  ` - ${selectedVillage} ${selectedVillage !== 'City Center' ? 'Village' : ''}`}
              </h3>
              <div className="close-button-wrapper">
                <FaTimes className="close-button" onClick={() => setShowPropertyMap(false)} />
              </div>
            </div>
            <div className="modal-content">
              <MapContainer
                center={[37.7749, -122.4194]}
                zoom={13}
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Only show property units, not villages as requested */}
                {(selectedVillage
                  ? allItems.filter(item => item.village === selectedVillage)
                  : allItems
                ).map(unit => (
                  <Marker
                    key={`unit-${unit.id}`}
                    position={[unit.coordinates[1], unit.coordinates[0]]}
                    icon={unitIcon}
                    eventHandlers={{
                      click: () => handleMarkerClick(unit),
                    }}
                  >
                    <Popup>
                      <div className="map-popup">
                        <h4>{unit.title}</h4>
                        <p>
                          {unit.village} {unit.village !== 'City Center' ? 'Village' : ''}
                        </p>
                        <p>
                          ${unit.price}/{unit.perUnit}
                        </p>
                        <button
                          className="view-details-button"
                          onClick={e => {
                            e.stopPropagation();
                            viewPropertyDetailsFromMap(unit);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              <div className="map-legend">
                <h4>Villages</h4>
                <div className="village-search">
                  <input
                    type="text"
                    className="village-search-input"
                    placeholder="Search villages..."
                    value={villageSearchTerm}
                    onChange={e => {
                      setVillageSearchTerm(e.target.value);
                      setVillagePagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on search
                    }}
                  />
                </div>
                <div className="village-chips">
                  {paginatedVillages.map(village => (
                    <div
                      key={village}
                      className={`village-chip ${selectedVillage === village ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedVillage(village === selectedVillage ? '' : village);
                      }}
                    >
                      {village}
                    </div>
                  ))}
                </div>
                {filteredVillages.length > villagePagination.pageSize && (
                  <div className="village-pagination">
                    <button
                      className="pagination-button"
                      disabled={villagePagination.currentPage === 1}
                      onClick={() =>
                        setVillagePagination(prev => ({
                          ...prev,
                          currentPage: prev.currentPage - 1,
                        }))
                      }
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {villagePagination.currentPage} of {totalVillagePages}
                    </span>
                    <button
                      className="pagination-button"
                      disabled={villagePagination.currentPage === totalVillagePages}
                      onClick={() =>
                        setVillagePagination(prev => ({
                          ...prev,
                          currentPage: prev.currentPage + 1,
                        }))
                      }
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notification-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Notifications</h3>
              <div className="close-button-wrapper">
                <FaTimes className="close-button" onClick={() => setShowNotifications(false)} />
              </div>
            </div>
            <div className="modal-content notification-content">
              <div className="notification-item unread">
                <h4>New booking request</h4>
                <p>Someone is interested in Unit 5</p>
                <span className="notification-time">2 hours ago</span>
              </div>
              <div className="notification-item unread">
                <h4>Price update</h4>
                <p>Unit 12 price has been reduced</p>
                <span className="notification-time">Yesterday</span>
              </div>
              <div className="notification-item unread">
                <h4>Village announcement</h4>
                <p>Community meeting this weekend</p>
                <span className="notification-time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyDetails && selectedProperty && (
        <div className="modal-overlay" onClick={() => setShowPropertyDetails(false)}>
          <div className="property-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProperty.title}</h3>
              <div className="close-button-wrapper">
                <FaTimes className="close-button" onClick={() => setShowPropertyDetails(false)} />
              </div>
            </div>
            <div className="modal-content property-details-content">
              <div className="property-details-image">
                <img src={selectedProperty.images[0]} alt={selectedProperty.title} />
              </div>
              <div className="property-details-info">
                <div className="property-info-item">
                  <strong>Village:</strong> {selectedProperty.village}
                  {selectedProperty.village !== 'City Center' ? 'Village' : ''}
                </div>
                <div className="property-info-item">
                  <strong>Price:</strong> ${selectedProperty.price}/{selectedProperty.perUnit}
                </div>
                <div className="property-info-item">
                  <strong>Available From:</strong>{' '}
                  {selectedProperty.availableFrom.toLocaleDateString()}
                </div>
                <div className="property-info-item">
                  <strong>Available To:</strong> {selectedProperty.availableTo.toLocaleDateString()}
                </div>
                <div className="property-description">
                  <strong>Description:</strong> {selectedProperty.description}
                </div>
                {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                  <div className="property-amenities">
                    <strong>Amenities:</strong>
                    <ul>
                      {selectedProperty.amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="property-details-actions">
                <button className="action-button contact-button">Contact Owner</button>
                <button className="action-button book-button">
                  {activeTab === 'listings' ? 'Book Now' : 'Accept Bid'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
