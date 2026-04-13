import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import styles from './KIInventory.module.css';
import MetricCard from '../MetricCards/MetricCard';
import classnames from 'classnames';
// Icons
import { TbToolsKitchen2 } from 'react-icons/tb';
import { LiaSeedlingSolid } from 'react-icons/lia';
import { GiMasonJar } from 'react-icons/gi';
import { PiBarcode } from 'react-icons/pi';
import {
  FiSearch,
  FiPackage,
  FiAlertCircle,
  FiAlertTriangle,
  FiShoppingCart,
  FiArchive,
} from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import KIItemCard from './KIItemCard';
import {
  fetchInventoryItems,
  fetchInventoryStats,
  fetchPreservedItems,
} from '../../../actions/KIInventoryActions';

// Category enum values — must match backend model enum exactly
const CATEGORY_MAP = {
  ingredients: 'INGREDIENT',
  'equipment & supplies': 'EQUIPEMENTANDSUPPLIES',
  seeds: 'SEEDS',
  'canning supplies': 'CANNINGSUPPLIES',
  'animal supplies': 'ANIMALSUPPLIES',
};

const KIInventory = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { items, preservedItems, stats, loading } = useSelector(state => state.kiInventory);

  const tabs = [
    'ingredients',
    'equipment & supplies',
    'seeds',
    'canning supplies',
    'animal supplies',
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTab = tab => {
    if (activeTab !== tabs[tab]) {
      setActiveTab(tabs[tab]);
      setSearchTerm('');
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchInventoryItems());
    dispatch(fetchInventoryStats());
    dispatch(fetchPreservedItems());
  }, [dispatch]);

  // Onsite grown — computed from all items
  const onsiteGrown = items.filter(i => i.onsite).length;

  // Items for active tab filtered by category and search term
  const activeCategory = CATEGORY_MAP[activeTab];
  const tabItems = items
    .filter(i => i.category === activeCategory)
    .filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Preserved items description for notification banner
  const preservedDesc =
    preservedItems.length > 0
      ? preservedItems.map(item => `${item.presentQuantity} ${item.unit} of ${item.name}`)
      : [];

  return (
    <div className={classnames(styles.inventoryContainer, darkMode ? styles.darkContainer : '')}>
      <header className={classnames(styles.inventoryPageHeader, darkMode ? styles.darkHeader : '')}>
        <div>
          <h2 className={styles.inventoryText}>Inventory Management</h2>
          <p>Track ingredients, equipment, and supplies across all kitchen operations</p>
        </div>
        <div className={styles.inventoryMetricCards}>
          <MetricCard
            metricname={'Total Items'}
            metricvalue={stats.totalItems}
            iconcolor={'#023f80'}
          >
            <FiPackage />
          </MetricCard>
          <MetricCard
            metricname={'Critical Stock'}
            metricvalue={stats.criticalStock}
            iconcolor={'#ef2d2dff'}
          >
            <FiAlertCircle />
          </MetricCard>
          <MetricCard metricname={'Low Stock'} metricvalue={stats.lowStock} iconcolor={'#dea208ff'}>
            <FiAlertTriangle />
          </MetricCard>
          <MetricCard metricname={'Onsite Grown'} metricvalue={onsiteGrown} iconcolor={'#12ad36ff'}>
            <RiLeafLine />
          </MetricCard>
        </div>
        <Nav className={classnames(styles.inventoryNavBar, darkMode ? styles.darkNavBar : '')}>
          <NavItem>
            <NavLink
              className={classnames(styles.inventoryNavBarLink)}
              style={{
                backgroundColor: `${activeTab === tabs[0] ? '#a1a5d1' : ''}`,
                borderRadius: `${activeTab === tabs[0] ? '30px' : ''}`,
              }}
              onClick={() => toggleTab(0)}
            >
              <TbToolsKitchen2 className={styles.inventoryNavBarIcon} />
              Ingredients
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames(styles.inventoryNavBarLink)}
              style={{
                backgroundColor: `${activeTab === tabs[1] ? '#a1a5d1' : ''}`,
                borderRadius: `${activeTab === tabs[1] ? '30px' : ''}`,
              }}
              onClick={() => toggleTab(1)}
            >
              <FiPackage className={styles.inventoryNavBarIcon} />
              Equipment &amp; Supplies
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames(styles.inventoryNavBarLink)}
              style={{
                backgroundColor: `${activeTab === tabs[2] ? '#a1a5d1' : ''}`,
                borderRadius: `${activeTab === tabs[2] ? '30px' : ''}`,
              }}
              onClick={() => toggleTab(2)}
            >
              <LiaSeedlingSolid className={styles.inventoryNavBarIcon} />
              Seeds
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames(styles.inventoryNavBarLink)}
              style={{
                backgroundColor: `${activeTab === tabs[3] ? '#a1a5d1' : ''}`,
                borderRadius: `${activeTab === tabs[3] ? '30px' : ''}`,
              }}
              onClick={() => toggleTab(3)}
            >
              <GiMasonJar className={styles.inventoryNavBarIcon} />
              Canning Supplies
            </NavLink>
          </NavItem>
          <NavItem style={{ paddingRight: 0, marginRight: 0 }}>
            <NavLink
              className={classnames(styles.inventoryNavBarLink)}
              style={{
                backgroundColor: `${activeTab === tabs[4] ? '#a1a5d1' : ''}`,
                borderRadius: `${activeTab === tabs[4] ? '30px' : ''}`,
              }}
              onClick={() => toggleTab(4)}
            >
              <FiShoppingCart className={styles.inventoryNavBarIcon} />
              Animal Supplies
            </NavLink>
          </NavItem>
        </Nav>
        <div className={`${styles.inventoryInteraction}`}>
          <div
            className={classnames(styles.inventorySearchBar, darkMode ? styles.darkSearchBar : '')}
          >
            <span className={`${styles.otherIcons}`}>
              <FiSearch />
            </span>
            <input
              name="search"
              className={classnames(styles.searchBarInput, darkMode ? styles.darkSearchInput : '')}
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button className={`${styles.clearSearch}`} onClick={() => setSearchTerm('')}>
              x
            </button>
          </div>
          <div>
            <button className={classnames(styles.button, styles.addItemButton)}>
              {'+ Add Item'}
            </button>
            <button className={classnames(styles.button, styles.scanBarcodeButton)}>
              <span className={`${styles.otherIcons}`}>{<PiBarcode />}</span> {'Scan Barcode'}
            </button>
          </div>
        </div>
      </header>
      <TabContent
        activeTab={activeTab}
        className={`${styles.inventoryTabContent} ${darkMode ? styles.darkTabContent : ''}`}
      >
        {tabs.map((tab, index) => (
          <TabPane key={tab} tabId={tab}>
            <div className={styles.tabContainer}>
              {/* Preserved items notification — only on the Ingredients tab */}
              {index === 0 && preservedItems.length > 0 && (
                <div
                  className={`${styles.notificationContainer} ${
                    darkMode ? styles.darkModeNotification : ''
                  }`}
                >
                  <div className={styles.notificationHeader}>
                    <p style={{ margin: 0, padding: 0 }}>
                      <FiArchive style={{ marginRight: '10px' }} />
                      Preserved Stock Available
                    </p>
                    <p style={{ margin: 0, padding: 0, fontSize: 'small' }}>
                      Extended shelf life items for year-round use
                    </p>
                  </div>
                  <div className={styles.notificationBody}>
                    <p style={{ color: 'rgb(175, 124, 62)' }}>{preservedDesc.join(', ')}</p>
                    <div>
                      <button
                        className={styles.viewAllButton}
                        style={darkMode ? { backgroundColor: 'rgb(245, 162, 61)' } : {}}
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.ingredientsContainer}>
                {loading ? (
                  <p style={{ padding: '1rem' }}>Loading...</p>
                ) : tabItems.length > 0 ? (
                  tabItems.map(item => (
                    <div key={item._id}>
                      <KIItemCard item={item} />
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '1rem', opacity: 0.6 }}>
                    {searchTerm ? `No results for "${searchTerm}"` : `No items in ${tab} yet.`}
                  </p>
                )}
              </div>
            </div>
          </TabPane>
        ))}
      </TabContent>
    </div>
  );
};

export default KIInventory;
