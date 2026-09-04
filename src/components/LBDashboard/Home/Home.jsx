/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaRegCommentDots, FaRegBell, FaUser, FaTh, FaList } from 'react-icons/fa';
import { BsSliders } from 'react-icons/bs';
import 'leaflet/dist/leaflet.css';
import { useHistory, useLocation } from 'react-router-dom';
import L from 'leaflet';
import logo from '../../../assets/images/logo2.webp';
import { fetchVillages, FIXED_VILLAGES } from './data';
import styles from './Home.module.css';
import ThemeIconToggle from '../ThemeIconToggle';
import { stripVillageSuffix, filterItemsByVillage } from './homeApiUtils';
import { useHomeTabData } from './useHomeTabData';
import { formatVillageLabel } from './homeFormatUtils';
import HomePropertiesPanel from './HomePropertiesPanel';
import HomeDatePickerModal from './HomeDatePickerModal';
import HomePropertyMapModal from './HomePropertyMapModal';
import HomeNotificationsModal from './HomeNotificationsModal';
import HomePropertyDetailsModal from './HomePropertyDetailsModal';

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

const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];

function Home() {
  const darkMode = useSelector(state => state.theme.darkMode);
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

  const navigate = useHistory();
  const location = useLocation();

  const villageFilterCandidates = useCallback(village => {
    const raw = String(village || '').trim();
    if (!raw) return [];
    const noSuffix = stripVillageSuffix(raw);
    const withSuffix = `${noSuffix} Village`;
    return Array.from(new Set([raw, noSuffix, withSuffix])).filter(Boolean);
  }, []);

  const normalizeVillageName = useCallback(
    village => stripVillageSuffix(village).toLowerCase(),
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const village = params.get('village');
    if (village) {
      setSelectedVillage(village);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchVillagesData = async () => {
      try {
        const villages = await fetchVillages();
        setAllVillages(villages);
      } catch (fetchError) {
        console.error('Error fetching villages:', fetchError);
        setAllVillages([...FIXED_VILLAGES]);
      }
    };

    fetchVillagesData();
  }, []);

  const filteredVillages = useMemo(
    () =>
      allVillages.filter(village =>
        village.toLowerCase().includes(villageSearchTerm.toLowerCase()),
      ),
    [villageSearchTerm, allVillages],
  );

  const paginatedVillages = useMemo(() => {
    const startIdx = (villagePagination.currentPage - 1) * villagePagination.pageSize;
    return filteredVillages.slice(startIdx, startIdx + villagePagination.pageSize);
  }, [filteredVillages, villagePagination]);

  const totalVillagePages = useMemo(
    () => Math.max(1, Math.ceil(filteredVillages.length / villagePagination.pageSize)),
    [filteredVillages.length, villagePagination.pageSize],
  );

  useHomeTabData({
    activeTab,
    pagination,
    selectedVillage,
    dateRange,
    villageFilterCandidates,
    setAllListings,
    setAllBiddings,
    setPagination,
    setIsLoading,
    setError,
  });

  const baseItems = activeTab === 'listings' ? allListings : allBiddings;
  const currentItems = useMemo(
    () => filterItemsByVillage(baseItems, selectedVillage, normalizeVillageName),
    [baseItems, normalizeVillageName, selectedVillage],
  );

  const mapItems = useMemo(() => {
    if (!selectedVillage) return currentItems;
    return currentItems.filter(item => item.village === selectedVillage);
  }, [currentItems, selectedVillage]);

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

    globalThis.addEventListener('keydown', handleEsc);
    return () => globalThis.removeEventListener('keydown', handleEsc);
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
  }, []);

  const viewPropertyDetailsFromMap = useCallback(property => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
    setShowPropertyMap(false);
  }, []);

  const handleViewPropertyNavigate = useCallback(
    (property, tab) => {
      const path =
        tab === 'listings'
          ? `/lbdashboard/listOverview/${property.id}`
          : `/lbdashboard/bidOverview/${property.id}`;
      navigate.push(path);
    },
    [navigate],
  );

  const handlePageSizeChange = useCallback(e => {
    const newSize = Number(e.target.value);
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1,
    }));
  }, []);

  const handleVillageSearchChange = useCallback(value => {
    setVillageSearchTerm(value);
    setVillagePagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleVillageChipClick = useCallback(village => {
    setSelectedVillage(prev => (prev === village ? '' : village));
  }, []);

  const isListingsTab = activeTab === 'listings';
  const listingsTabClass = isListingsTab ? styles.lbActiveTab : styles.lbInactiveTab;
  const biddingTabClass = isListingsTab ? styles.lbInactiveTab : styles.lbActiveTab;

  return (
    <div
      className={`${styles.lbOutsideContainer} ${darkMode ? styles.lbOutsideContainerDark : ''}`}
    >
      <div className={styles.lbLogo}>
        <img src={logo} alt="Logo" />
      </div>

      <nav className={`${styles.lbNavbar} ${darkMode ? styles.lbNavbarDark : ''}`}>
        <div className={styles.lbNavLeft}>
          <select
            className={`${styles.lbVillageFilter} ${darkMode ? styles.lbVillageFilterDark : ''}`}
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
          >
            <option value="">Filter by Village</option>
            {allVillages.map(v => (
              <option key={v} value={v}>
                {formatVillageLabel(v)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`${styles.lbGoButton} ${darkMode ? styles.lbGoButtonDark : ''}`}
            onClick={handleGoButtonClick}
          >
            Go
          </button>
        </div>
        <div className={styles.lbNavRight}>
          <span className={`${styles.lbWelcomeText} ${darkMode ? styles.lbWelcomeTextDark : ''}`}>
            WELCOME {userName}
          </span>
          <ThemeIconToggle
            buttonClassName={`${styles.lbThemeIconBtn} ${darkMode ? styles.lbNavIconDark : ''}`}
            iconClassName={styles.lbNavIcon}
          />
          <FaRegCommentDots
            className={`${styles.lbNavIcon} ${darkMode ? styles.lbNavIconDark : ''}`}
            title="Messages"
            onClick={() => navigate.push('/chat')}
          />
          <div className={styles.lbNotificationBadge}>
            <FaRegBell
              className={`${styles.lbNavIcon} ${darkMode ? styles.lbNavIconDark : ''}`}
              title="Notifications"
              onClick={() => setShowNotifications(true)}
            />
            <span className={styles.lbBadge}>3</span>
          </div>
          <FaUser
            className={`${styles.lbNavIcon} ${styles.lbUserIcon} ${
              darkMode ? styles.lbNavIconDark : ''
            }`}
            title="Profile"
            onClick={() => navigate.push('/profile')}
          />
        </div>
      </nav>

      <div
        className={`${styles.lbInsideContainer} ${darkMode ? styles.lbInsideContainerDark : ''}`}
      >
        <div className={styles.lbContentHeader}>
          <div
            className={styles.lbPropertyMap}
            onClick={() => setShowPropertyMap(true)}
            title="View Property Map"
          >
            <FaMapMarkerAlt className={styles.lbMapIcon} />
            <span className={styles.lbMapText}>Property Map</span>
          </div>

          <div className={styles.lbHeaderContent}>
            <div
              className={styles.lbFilterSection}
              onClick={() => setShowDatePicker(true)}
              title="Filter by Date Range"
            >
              <BsSliders className={styles.lbFilterIcon} />
              <span className={styles.lbFilterText}>Filter by date</span>
            </div>

            <div className={styles.lbTabsSection}>
              <button
                type="button"
                className={`${styles.lbTab} ${listingsTabClass}`}
                onClick={() => setActiveTab('listings')}
              >
                Listings
              </button>
              <button
                type="button"
                className={`${styles.lbTab} ${biddingTabClass}`}
                onClick={() => setActiveTab('bidding')}
              >
                Bidding
              </button>
            </div>

            <div className={styles.lbViewToggle}>
              <button
                type="button"
                className={`${styles.lbViewBtn} ${viewMode === 'Grid' ? styles.active : ''}`}
                onClick={() => setViewMode('Grid')}
                title="Grid View"
              >
                <FaTh />
              </button>
              <button
                type="button"
                className={`${styles.lbViewBtn} ${viewMode === 'List' ? styles.active : ''}`}
                onClick={() => setViewMode('List')}
                title="List View"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        <HomePropertiesPanel
          isLoading={isLoading}
          error={error}
          currentItems={currentItems}
          viewMode={viewMode}
          pagination={pagination}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPropertySelect={handlePropertySelect}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {showDatePicker && (
        <HomeDatePickerModal
          dateRange={dateRange}
          onClose={() => setShowDatePicker(false)}
          onStartDateChange={value => setDateRange(prev => ({ ...prev, startDate: value }))}
          onEndDateChange={value => setDateRange(prev => ({ ...prev, endDate: value }))}
          onAdjustWeek={adjustDatesByWeek}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      )}

      {showPropertyMap && (
        <HomePropertyMapModal
          unitIcon={unitIcon}
          selectedVillage={selectedVillage}
          mapItems={mapItems}
          paginatedVillages={paginatedVillages}
          filteredVillages={filteredVillages}
          villageSearchTerm={villageSearchTerm}
          villagePagination={villagePagination}
          totalVillagePages={totalVillagePages}
          onClose={() => setShowPropertyMap(false)}
          onMarkerClick={setSelectedProperty}
          onViewDetails={viewPropertyDetailsFromMap}
          onVillageSearchChange={handleVillageSearchChange}
          onVillagePagePrev={() =>
            setVillagePagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
          }
          onVillagePageNext={() =>
            setVillagePagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
          }
          onVillageChipClick={handleVillageChipClick}
        />
      )}

      {showNotifications && <HomeNotificationsModal onClose={() => setShowNotifications(false)} />}

      {showPropertyDetails && selectedProperty && (
        <HomePropertyDetailsModal
          property={selectedProperty}
          activeTab={activeTab}
          onClose={() => setShowPropertyDetails(false)}
          onViewProperty={handleViewPropertyNavigate}
        />
      )}
    </div>
  );
}

export default Home;
