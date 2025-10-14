/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
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
} from 'react-icons/fa';
import { BsSliders } from 'react-icons/bs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useHistory } from 'react-router-dom';
import L from 'leaflet';
import logo from '../../../assets/images/logo2.png';
import { fetchVillages, fetchListings, fetchBiddings, FIXED_VILLAGES } from './data';
import styles from './Home.module.css';

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
  const [viewMode, setViewMode] = useState('Grid');
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
  const navigate = useHistory();

  useEffect(() => {
    const fetchVillagesData = async () => {
      try {
        const villages = await fetchVillages();
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
            const listingsData = await fetchListings(
              pagination.currentPage,
              pagination.pageSize,
              filters,
            );
            setAllListings(listingsData.items || []);
            console.log('fetching listings', listingsData.items);
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
          console.log('fetching biddings');
          try {
            const biddingsData = await fetchBiddings(
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
    <div className={`${styles.lbOutsideContainer}`}>
      {/* Logo Section */}
      <div className={`${styles.lbLogo}`}>
        <img src={logo} alt="Logo" />
      </div>

      {/* Navigation Bar */}
      <nav className={`${styles.lbNavbar}`}>
        <div className={`${styles.lbNavLeft}`}>
          <select
            className={`${styles.lbVillageFilter}`}
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
          <button className={`${styles.lbGoButton}`} onClick={handleGoButtonClick}>
            Go
          </button>
        </div>
        <div className={`${styles.lbNavRight}`}>
          <span className={`${styles.lbWelcomeText}`}>WELCOME {userName}</span>
          <FaRegCommentDots
            className={`${styles.lbNavIcon}`}
            title="Messages"
            // eslint-disable-next-line no-return-assign
            onClick={() => (window.location.href = '/chat')}
          />
          <div className={`${styles.lbNotificationBadge}`}>
            <FaRegBell
              className={`${styles.lbNavIcon}`}
              title="Notifications"
              onClick={() => setShowNotifications(true)}
            />
            <span className={`${styles.lbBadge}`}>3</span>
          </div>
          <FaUser
            className={`${styles.lbNavIcon} ${styles.lbUserIcon}`}
            title="Profile"
            // eslint-disable-next-line no-return-assign
            onClick={() => (window.location.href = '/profile')}
          />
        </div>
      </nav>

      {/* Main Content Container */}
      <div className={`${styles.lbInsideContainer}`}>
        {/* Content Header with Map Link */}
        <div className={`${styles.lbContentHeader}`}>
          <div
            className={`${styles.lbPropertyMap}`}
            onClick={() => setShowPropertyMap(true)}
            title="View Property Map"
          >
            <FaMapMarkerAlt className={`${styles.lbMapIcon}`} />
            <span className={`${styles.lbMapText}`}>Property Map</span>
          </div>

          <div className={`${styles.lbHeaderContent}`}>
            {/* Filter Section */}
            <div
              className={`${styles.lbFilterSection}`}
              onClick={() => setShowDatePicker(true)}
              title="Filter by Date Range"
            >
              <BsSliders className={`${styles.lbFilterIcon}`} />
              <span className={`${styles.lbFilterText}`}>Filter by date</span>
            </div>

            {/* Tabs Section */}
            <div className={`${styles.lbTabsSection}`}>
              <button className={styles.lbTab} onClick={() => setActiveTab('listings')}>
                Listings Page
              </button>
              <button
                type="button"
                className={styles.lbTab}
                onClick={() => setActiveTab('biddings')}
              >
                Biddings Page
              </button>
            </div>

            {/* View Toggle */}
            <div className={`${styles.lbViewToggle}`}>
              <button
                className={`${styles.lbViewBtn} ${viewMode === 'Grid' ? styles.active : ''}`}
                onClick={() => setViewMode('Grid')}
                title="Grid View"
              >
                <FaTh />
              </button>
              <button
                className={`${styles.lbViewBtn} ${viewMode === 'List' ? styles.active : ''}`}
                onClick={() => setViewMode('List')}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <div className={`${styles.lbLoadingIndicator}`}>Loading properties...</div>}

        {/* Error State */}
        {error && <div className={`${styles.lbErrorMessage}`}>{error}</div>}

        {/* No Results State */}
        {!isLoading && !error && currentItems.length === 0 && (
          <div className={`${styles.lbNoResults}`}>
            No properties found matching your criteria. Try adjusting your filters.
          </div>
        )}

        {/* Properties Container */}
        {!isLoading && !error && (
          <div className={`${styles.lbPropertiesContainer} ${styles[`lb${viewMode}View`]}`}>
            {currentItems.map(unit => {
              const firstImage =
                Array.isArray(unit.images) && unit.images.length ? unit.images[0] : DEFAULT_IMAGE;

              return (
                <div
                  key={unit.id}
                  className={styles.lbPropertyCard}
                  onClick={() => handlePropertySelect(unit)}
                >
                  <div className={styles.lbPropertyImage}>
                    <img
                      src={firstImage}
                      alt={unit.title || 'Unit'}
                      loading="lazy"
                      onError={e => {
                        if (e.currentTarget.src !== DEFAULT_IMAGE)
                          e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                  <div className={styles.lbPropertyDetails}>
                    <div>
                      <h3>{unit.title}</h3>
                      <p>
                        {unit.village} {unit.village !== 'City Center' ? 'Village' : ''}
                      </p>
                    </div>
                    <div
                      className={`${styles.lbPrice} ${unit.isBidding ? styles.lbBiddingPrice : ''}`}
                    >
                      ${unit.price}/{unit.perUnit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && !error && currentItems.length > 0 && (
          <div className={`${styles.lbPaginationControls}`}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`${styles.lbPaginationButton}`}
            >
              Prev
            </button>
            <span className={`${styles.lbPaginationInfo}`}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`${styles.lbPaginationButton}`}
            >
              Next
            </button>
            <div className={`${styles.lbPageSizeSelector}`}>
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
        <div className={`${styles.lbModalOverlay}`} onClick={() => setShowDatePicker(false)}>
          <div className={`${styles.lbDatePickerContainer}`} onClick={e => e.stopPropagation()}>
            <div className={`${styles.lbModalHeader}`}>
              <h3>Select Date Range</h3>
              <div className={`${styles.lbCloseButtonWrapper}`}>
                <FaTimes
                  className={`${styles.lbCloseButton}`}
                  onClick={() => setShowDatePicker(false)}
                />
              </div>
            </div>
            <div className={`${styles.lbDatePickerContent}`}>
              <div className={`${styles.lbDateInputs}`}>
                <div className={`${styles.lbDateInputGroup}`}>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>
                <div className={`${styles.lbDateInputGroup}`}>
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
                <div className={`${styles.lbDateNavigation}`}>
                  <button
                    className={`${styles.lbDateNavButton}`}
                    onClick={() => adjustDatesByWeek('backward')}
                  >
                    <FaChevronLeft /> Previous Week
                  </button>
                  <button
                    className={`${styles.lbDateNavButton}`}
                    onClick={() => adjustDatesByWeek('forward')}
                  >
                    Next Week <FaChevronRight />
                  </button>
                </div>
              )}

              <div className={`${styles.lbDatePickerActions}`}>
                <button className={`${styles.lbApplyButton}`} onClick={applyFilters}>
                  Apply
                </button>
                <button className={`${styles.lbClearButton}`} onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Map Modal */}
      {showPropertyMap && (
        <div className={`${styles.lbModalOverlay}`} onClick={() => setShowPropertyMap(false)}>
          <div className={`${styles.lbPropertyMapModal}`} onClick={e => e.stopPropagation()}>
            <div className={`${styles.lbModalHeader}`}>
              <h3>
                Property Map
                {selectedVillage &&
                  ` - ${selectedVillage} ${selectedVillage !== 'City Center' ? 'Village' : ''}`}
              </h3>
              <div className={`${styles.lbCloseButtonWrapper}`}>
                <FaTimes
                  className={`${styles.lbCloseButton}`}
                  onClick={() => setShowPropertyMap(false)}
                />
              </div>
            </div>
            <div className={`${styles.lbModalContent}`}>
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
                      <div className={`${styles.lbMapPopup}`}>
                        <h4>{unit.title}</h4>
                        <p>
                          {unit.village} {unit.village !== 'City Center' ? 'Village' : ''}
                        </p>
                        <p>
                          ${unit.price}/{unit.perUnit}
                        </p>
                        <button
                          className={`${styles.lbViewDetailsButton}`}
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

              <div className={`${styles.lbMapLegend}`}>
                <h4>Villages</h4>
                <div className={`${styles.lbVillageSearch}`}>
                  <input
                    type="text"
                    className={`${styles.lbVillageSearchInput}`}
                    placeholder="Search villages..."
                    value={villageSearchTerm}
                    onChange={e => {
                      setVillageSearchTerm(e.target.value);
                      setVillagePagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on search
                    }}
                  />
                </div>
                <div className={`${styles.lbVillageChips}`}>
                  {paginatedVillages.map(village => (
                    <div
                      key={village}
                      className={`lb-village-chip ${selectedVillage === village ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedVillage(village === selectedVillage ? '' : village);
                      }}
                    >
                      {village}
                    </div>
                  ))}
                </div>
                {filteredVillages.length > villagePagination.pageSize && (
                  <div className={`${styles.lbVillagePagination}`}>
                    <button
                      className={`${styles.lbPaginationButton}`}
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
                    <span className={`${styles.lbPaginationInfo}`}>
                      Page {villagePagination.currentPage} of {totalVillagePages}
                    </span>
                    <button
                      className={`${styles.lbPaginationButton}`}
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
        <div className={`${styles.lbModalOverlay}`} onClick={() => setShowNotifications(false)}>
          <div className={`${styles.lbNotificationModal}`} onClick={e => e.stopPropagation()}>
            <div className={`${styles.lbModalHeader}`}>
              <h3>Notifications</h3>
              <div className={`${styles.lbCloseButtonWrapper}`}>
                <FaTimes
                  className={`${styles.lbCloseButton}`}
                  onClick={() => setShowNotifications(false)}
                />
              </div>
            </div>
            <div className={`${styles.lbModalContent} ${styles.lbNotificationContent}`}>
              <div className={`${styles.lbNotificationItem} ${styles.unread}`}>
                <h4>New booking request</h4>
                <p>Someone is interested in Unit 5</p>
                <span className={`${styles.lbNotificationTime}`}>2 hours ago</span>
              </div>
              <div className={`${styles.lbNotificationItem} ${styles.unread}`}>
                <h4>Price update</h4>
                <p>Unit 12 price has been reduced</p>
                <span className={`${styles.lbNotificationTime}`}>Yesterday</span>
              </div>
              <div className={`${styles.lbNotificationItem} ${styles.unread}`}>
                <h4>Village announcement</h4>
                <p>Community meeting this weekend</p>
                <span className={`${styles.lbNotificationTime}`}>3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {showPropertyDetails && selectedProperty && (
        <div className={`${styles.lbModalOverlay}`} onClick={() => setShowPropertyDetails(false)}>
          <div className={`${styles.lbPropertyDetailsModal}`} onClick={e => e.stopPropagation()}>
            <div className={`${styles.lbModalHeader}`}>
              <h3>{selectedProperty.title}</h3>
              <div className={`${styles.lbCloseButtonWrapper}`}>
                <FaTimes
                  className={`${styles.lbCloseButton}`}
                  onClick={() => setShowPropertyDetails(false)}
                />
              </div>
            </div>
            <div className={`${styles.lbModalContent} ${styles.lbPropertyDetailsContent}`}>
              <div className={`${styles.lbPropertyDetailsImage}`}>
                <img src={selectedProperty.images[0]} alt={selectedProperty.title} />
              </div>
              <div className={`${styles.lbPropertyDetailsInfo}`}>
                <div className={`${styles.lbPropertyInfoItem}`}>
                  <strong>Village:</strong> {selectedProperty.village}
                  {selectedProperty.village !== 'City Center' ? 'Village' : ''}
                </div>
                <div className={`${styles.lbPropertyInfoItem}`}>
                  <strong>Price:</strong> ${selectedProperty.price}/{selectedProperty.perUnit}
                </div>
                <div className={`${styles.lbPropertyInfoItem}`}>
                  <strong>Available From:</strong>{' '}
                  {selectedProperty.availableFrom.toLocaleDateString()}
                </div>
                <div className={`${styles.lbPropertyInfoItem}`}>
                  <strong>Available To:</strong> {selectedProperty.availableTo.toLocaleDateString()}
                </div>
                <div className={`${styles.lbPropertyDescription}`}>
                  <strong>Description:</strong> {selectedProperty.description}
                </div>
                {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                  <div className={`${styles.lbPropertyAmenities}`}>
                    <strong>Amenities:</strong>
                    <ul>
                      {selectedProperty.amenities.map((amenity, index) => (
                        <li key={index}>{amenity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className={`${styles.lbPropertyDetailsActions}`}>
                <button className={`${styles.lbActionButton} ${styles.lbContactButton}`}>
                  Contact Owner
                </button>
                <button
                  className={`${styles.lbActionButton} ${styles.lbBookButton}`}
                  onClick={() => {
                    if (activeTab === 'listings') {
                      navigate.push(`/lbdashboard/listOverview/${selectedProperty.id}`); // Redirect to booking page
                    } else {
                      navigate.push(`/lbdashboard/bidOverview/${selectedProperty.id}`); // Redirect to bidding page
                    }
                  }}
                >
                  View Property
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
