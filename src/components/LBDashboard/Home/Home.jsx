import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRegCommentDots, FaRegBell, FaUser, FaTh, FaList } from 'react-icons/fa';
import { BsSliders } from 'react-icons/bs';
import { ENDPOINTS } from 'utils/URL';
import './Home.css';
import logo from '../../../assets/images/logo2.png';

function Home() {
  // View state
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('listings');

  // Filter state
  const [selectedVillage, setSelectedVillage] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
  const [biddings, setBiddings] = useState([]);

  // User state
  const [userName, setUserName] = useState('');

  // UI state
  const [showPropertyMap, setShowPropertyMap] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    total: 0,
  });

  // Village options based on the requirements
  const villageOptions = [
    { value: '', label: 'Filter by Village' },
    { value: 'Earthbag', label: 'Earthbag Village' },
    { value: 'Straw Bale', label: 'Straw Bale Village' },
    { value: 'Recycle Materials', label: 'Recycle Materials Village' },
    { value: 'Cob', label: 'Cob Village' },
    { value: 'Tree House', label: 'Tree House Village' },
    { value: 'Strawberry', label: 'Strawberry Village' },
    { value: 'Sustainable Living', label: 'Sustainable Living Village' },
    { value: 'City Center', label: 'City Center' },
  ];

  // Page size options
  const pageSizeOptions = [10, 20, 30, 50];

  // Handle village filter change
  const handleVillageChange = e => {
    setSelectedVillage(e.target.value);
  };

  // Handle filter submission
  const handleFilterSubmit = () => {
    // Reset to first page when applying a new filter
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));

    // Fetch listings with the new filter
    fetchListings();
  };

  // Handle date range selection
  const handleDateChange = dates => {
    setDateRange(dates);
    setShowDatePicker(false);

    // Reset to first page when applying a new date filter
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
    }));

    // Fetch listings with the new date filter
    fetchListings();
  };

  // Toggle date picker visibility
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Handle page change
  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setPagination(prev => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  // Handle page size change
  const handlePageSizeChange = size => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1, // Reset to first page when changing page size
    }));
  };

  // Handler functions for navigation icons
  const handleChatClick = () => {
    // Navigate to chat page
    console.log('Navigate to chat page');
    // Implement navigation to chat page
  };

  const handleNotificationsClick = () => {
    // Open notifications modal
    console.log('Open notifications modal');
    // Implement notifications modal
  };

  const handleProfileClick = () => {
    // Navigate to profile page
    console.log('Navigate to profile page');
    // Implement navigation to profile page
  };

  // Property map click handler
  const handlePropertyMapClick = () => {
    setShowPropertyMap(true);
  };

  // Close property map modal
  const closePropertyMap = () => {
    setShowPropertyMap(false);
  };

  // Fetch listings from the backend
  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const villageParam = selectedVillage ? `&village=${selectedVillage}` : '';
      // Add date range parameters if dates are selected
      const dateParams =
        dateRange.startDate && dateRange.endDate
          ? `&startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`
          : '';

      const apiUrl = `${ENDPOINTS.LB_LISTINGS}?page=${pagination.currentPage}&size=${pagination.pageSize}${villageParam}${dateParams}`;

      console.log('Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication if needed
      });

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          `API returned ${response.status}: ${
            response.statusText
          }. Expected JSON but got ${contentType || 'unknown content type'}`,
        );
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 200) {
        setListings(data.data.items);
        setPagination({
          currentPage: data.data.pagination.currentPage,
          totalPages: data.data.pagination.totalPages,
          pageSize: data.data.pagination.pageSize,
          total: data.data.pagination.total,
        });
      } else {
        throw new Error(data.message || 'Failed to fetch listings');
      }
    } catch (err) {
      setError(`${err.message}. Please ensure the API server is running.`);
      console.error('Error fetching listings:', err);

      // During development, load mock data if the API isn't available
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading mock data for development');
        setListings([
          {
            id: 405,
            title: 'Unit 405',
            village: 'Earthbag Village',
            price: 28,
            perUnit: 'day',
            images: [],
          },
          {
            id: 403,
            title: 'Unit 403',
            village: 'Straw Bale Village',
            price: 32,
            perUnit: 'day',
            images: [],
          },
          {
            id: 203,
            title: 'Unit 203',
            village: 'Recycle Materials Village',
            price: 40,
            perUnit: 'day',
            images: [],
          },
          {
            id: 101,
            title: 'Unit 101',
            village: 'Cob Village',
            price: 25,
            perUnit: 'day',
            images: [],
          },
          {
            id: 105,
            title: 'Unit 105',
            village: 'Earthbag Village',
            price: 50,
            perUnit: 'day',
            images: [],
          },
        ]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          total: 5,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch biddings (this would be replaced with actual API call in a real implementation)
  const fetchBiddings = async () => {
    // Mocking biddings data for now
    return [
      {
        id: 405,
        title: 'Unit 405',
        village: 'Earthbag Village',
        price: 28,
        perUnit: 'day',
        images: [],
      },
      {
        id: 403,
        title: 'Unit 403',
        village: 'Straw Bale Village',
        price: 32,
        perUnit: 'day',
        images: [],
      },
      {
        id: 203,
        title: 'Unit 203',
        village: 'Recycle Materials Village',
        price: 40,
        perUnit: 'day',
        images: [],
      },
      { id: 101, title: 'Unit 101', village: 'Cob Village', price: 25, perUnit: 'day', images: [] },
      {
        id: 105,
        title: 'Unit 105',
        village: 'Earthbag Village',
        price: 50,
        perUnit: 'day',
        images: [],
      },
      {
        id: 402,
        title: 'Unit 402',
        village: 'Tree House Village',
        price: 45,
        perUnit: 'day',
        images: [],
      },
    ];
  };

  // Function to render property cards
  const renderPropertyCards = properties => {
    if (!properties || properties.length === 0) {
      return <div className="no-results">No properties found</div>;
    }

    return properties.map(property => {
      // Extract unit number from title or use id
      const unitId = property.id || (property.title ? property.title.match(/\d+/)?.[0] : '');
      const unitTitle = property.title || `Unit ${unitId}`;

      return (
        <div
          key={
            property.id ||
            Math.random()
              .toString(36)
              .substring(7)
          }
          className="property-card"
        >
          <div className="property-image">
            {property.images && property.images.length > 0 ? (
              <img src={property.images[0]} alt={unitTitle} />
            ) : (
              /* Placeholder when no image is available */
              <div className="image-placeholder" />
            )}
          </div>
          <div className="property-details">
            <h3>{unitTitle}</h3>
            <p>{property.village}</p>
            <div className="price">
              ${property.price}/{property.perUnit || 'day'}
            </div>
          </div>
        </div>
      );
    });
  };

  // Load biddings once when component mounts
  useEffect(() => {
    const loadBiddings = async () => {
      const biddingData = await fetchBiddings();
      setBiddings(biddingData);
    };

    loadBiddings();
  }, []);

  // Fetch user data - in a real app, this would come from your auth system
  useEffect(() => {
    // Mock user data fetch - replace with actual API call
    const fetchUserData = async () => {
      try {
        // This would be an API call in a real implementation
        // const response = await fetch('/api/user/profile');
        // const userData = await response.json();
        // setUserName(userData.firstName);

        // Mock data for demo
        setUserName('John');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch listings whenever pagination or filters change
  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, pagination.pageSize]);

  return (
    <div className="outside-container">
      <div className="logo">
        <img src={logo} alt="One Community Logo" />
      </div>

      {/* Navbar */}
      <nav className="lb-navbar">
        <div className="nav-left">
          <select className="village-filter" value={selectedVillage} onChange={handleVillageChange}>
            {villageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="go-button" onClick={handleFilterSubmit}>
            Go
          </button>
        </div>

        <div className="nav-right">
          <span className="welcome-text">WELCOME {userName || 'USER_NAME'}</span>
          <FaRegCommentDots className="nav-icon" onClick={handleChatClick} />
          <div className="notification-badge">
            <FaRegBell className="nav-icon" onClick={handleNotificationsClick} />
            <span className="badge">3</span>
          </div>
          <FaUser className="nav-icon user-icon" onClick={handleProfileClick} />
        </div>
      </nav>

      <div className="inside-container">
        <div className="content-wrapper">
          <div className="content-header">
            {/* Property Map on Top Right */}
            <div className="property-map" onClick={handlePropertyMapClick}>
              <FaMapMarkerAlt className="map-icon" />
              <span className="map-text">Property Map</span>
            </div>

            {/* Property Map Modal */}
            {showPropertyMap && (
              <div className="property-map-overlay">
                <div className="property-map-modal">
                  <div className="modal-header">
                    <h3>Property Map</h3>
                    <span className="close-button" onClick={closePropertyMap}>
                      ×
                    </span>
                  </div>
                  <div className="modal-content">
                    <div className="map-container">
                      {/* This would be replaced with an actual map component */}
                      <div className="placeholder-map">
                        <h4>Interactive Property Map</h4>
                        <p>Map showing all villages and available units</p>
                        <div className="map-villages">
                          {villageOptions
                            .filter(v => v.value)
                            .map(village => (
                              <div
                                key={village.value}
                                className="map-village-item"
                                onClick={() => {
                                  setSelectedVillage(village.value);
                                  closePropertyMap();
                                  handleFilterSubmit();
                                }}
                              >
                                {village.label}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Section */}
            <div className="header-content">
              {/* Left: Filter Section */}
              <div className="filter-section" onClick={toggleDatePicker}>
                <BsSliders className="filter-icon" />
                <span className="filter-text">Filter by date</span>
              </div>

              {/* Date Picker Popup */}
              {showDatePicker && (
                <div className="date-picker-container">
                  <div className="date-picker-header">
                    <h3>Select Date Range</h3>
                    <span className="close-button" onClick={() => setShowDatePicker(false)}>
                      ×
                    </span>
                  </div>
                  <div className="date-picker-content">
                    <div className="date-inputs">
                      <div className="date-input-group">
                        <label>Check In</label>
                        <input
                          type="date"
                          value={
                            dateRange.startDate
                              ? dateRange.startDate.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={e =>
                            setDateRange(prev => ({
                              ...prev,
                              startDate: e.target.value ? new Date(e.target.value) : null,
                            }))
                          }
                        />
                      </div>
                      <div className="date-input-group">
                        <label>Check Out</label>
                        <input
                          type="date"
                          value={
                            dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''
                          }
                          onChange={e =>
                            setDateRange(prev => ({
                              ...prev,
                              endDate: e.target.value ? new Date(e.target.value) : null,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="date-picker-actions">
                      <button
                        className="apply-button"
                        onClick={() => {
                          if (dateRange.startDate && dateRange.endDate) {
                            handleDateChange(dateRange);
                          }
                        }}
                      >
                        Apply
                      </button>
                      <button
                        className="clear-button"
                        onClick={() => setDateRange({ startDate: null, endDate: null })}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

              {/* Right: View Toggle */}
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

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading Indicator */}
          {isLoading && <div className="loading-indicator">Loading...</div>}

          {/* Listings Content */}
          {!isLoading && (
            <>
              {/* Listings Tab Content */}
              <div
                className={`properties-container ${viewMode}-view ${
                  activeTab === 'listings' ? 'show-listings' : 'hide'
                }`}
              >
                {renderPropertyCards(listings)}
              </div>

              {/* Bidding Tab Content */}
              <div
                className={`properties-container ${viewMode}-view ${
                  activeTab === 'bidding' ? 'show-bidding' : 'hide'
                }`}
              >
                {renderPropertyCards(biddings)}
              </div>

              {/* Pagination Controls */}
              {activeTab === 'listings' && pagination.totalPages > 0 && (
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </button>
                  <span>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </button>

                  {/* Page Size Selector */}
                  <div className="page-size-selector">
                    <span>Show: </span>
                    <select
                      value={pagination.pageSize}
                      onChange={e => handlePageSizeChange(Number(e.target.value))}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
