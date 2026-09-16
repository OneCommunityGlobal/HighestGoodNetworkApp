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
import KIAddItemModal from './KIAddItemModal/KIAddItemModal';
import KIReorderItemModal from './KIReorderItemModal/KIReorderItemModal';
import KIUpdateItemModal from './KIUpdateItemModal/KIUpdateItemModal';
import {
  addInventoryItem,
  deleteInventoryItem,
  fetchInventoryItems,
  fetchInventoryStats,
  fetchPreservedItems,
  reorderInventoryItem,
  updateInventoryItem,
} from '../../../actions/KIInventoryActions';

// Category enum values — must match backend model enum exactly
const CATEGORY_MAP = {
  ingredients: 'INGREDIENT',
  'equipment & supplies': 'EQUIPEMENTANDSUPPLIES',
  seeds: 'SEEDS',
  'canning supplies': 'CANNINGSUPPLIES',
  'animal supplies': 'ANIMALSUPPLIES',
};

const CATEGORY_LABEL_MAP = Object.entries(CATEGORY_MAP).reduce(
  (labels, [label, value]) => ({ ...labels, [value]: label }),
  {},
);

const KIInventory = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const {
    items,
    preservedItems,
    stats,
    loading,
    addItemLoading,
    addItemError,
    updateItemLoading,
    updateItemError,
    deleteItemLoading,
    deleteItemError,
    reorderItemLoading,
    reorderItemError,
  } = useSelector(state => state.kiInventory);

  const tabs = [
    'ingredients',
    'equipment & supplies',
    'seeds',
    'canning supplies',
    'animal supplies',
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [selectedReorderItem, setSelectedReorderItem] = useState(null);

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

  // Search helper
  const filterItems = itemsToFilter => {
    if (!searchTerm.trim()) {
      return itemsToFilter;
    }

    return itemsToFilter.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  // Items for active tab
  const activeCategory = CATEGORY_MAP[activeTab];

  const categoryItems = items.filter(i => i.category === activeCategory);

  const tabItems = filterItems(categoryItems);

  const handleAddItem = payload => dispatch(addInventoryItem(payload));
  const handleUpdateItem = (itemId, payload) => dispatch(updateInventoryItem(itemId, payload));
  const handleDeleteItem = itemId => dispatch(deleteInventoryItem(itemId));
  const handleReorderItem = (itemId, payload) => dispatch(reorderInventoryItem(itemId, payload));
  const handleOpenUpdateItemModal = item => setSelectedInventoryItem(item);
  const handleCloseUpdateItemModal = () => setSelectedInventoryItem(null);
  const handleOpenReorderItemModal = item => setSelectedReorderItem(item);
  const handleCloseReorderItemModal = () => setSelectedReorderItem(null);
  const selectedItemCategoryValue = selectedInventoryItem?.category || activeCategory;
  const selectedItemCategoryLabel = CATEGORY_LABEL_MAP[selectedItemCategoryValue] || activeTab;

  // Preserved items description for notification banner
  const preservedDesc =
    preservedItems.length > 0
      ? preservedItems.map(item => `${item.presentQuantity} ${item.unit} of ${item.name}`)
      : [];

  const renderItems = tabName => {
    if (loading) {
      return <p style={{ padding: '1rem' }}>Loading...</p>;
    }
    if (tabItems.length > 0) {
      return tabItems.map(item => (
        <div key={item._id}>
          <KIItemCard
            item={item}
            onUpdateItem={handleOpenUpdateItemModal}
            onReorder={handleOpenReorderItemModal}
          />
        </div>
      ));
    }
    if (searchTerm) {
      return (
        <p className={`${styles.noResults} ${darkMode ? styles.darkNoResults : ''}`}>
          No results for "{searchTerm}"
        </p>
      );
    }
    return <p style={{ padding: '1rem', opacity: 0.6 }}>No items in {tabName} yet.</p>;
  };

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
          {[
            {
              index: 0,
              label: 'Ingredients',
              icon: <TbToolsKitchen2 className={styles.inventoryNavBarIcon} />,
            },
            {
              index: 1,
              label: 'Equipment & Supplies',
              icon: <FiPackage className={styles.inventoryNavBarIcon} />,
            },
            {
              index: 2,
              label: 'Seeds',
              icon: <LiaSeedlingSolid className={styles.inventoryNavBarIcon} />,
            },
            {
              index: 3,
              label: 'Canning Supplies',
              icon: <GiMasonJar className={styles.inventoryNavBarIcon} />,
            },
            {
              index: 4,
              label: 'Animal Supplies',
              icon: <FiShoppingCart className={styles.inventoryNavBarIcon} />,
            },
          ].map((tabItem, idx) => (
            <NavItem
              key={tabItem.index}
              style={idx === 4 ? { paddingRight: 0, marginRight: 0 } : {}}
            >
              <NavLink
                className={classnames(styles.inventoryNavBarLink)}
                style={{
                  backgroundColor: `${activeTab === tabs[tabItem.index] ? '#a1a5d1' : ''}`,
                  borderRadius: `${activeTab === tabs[tabItem.index] ? '30px' : ''}`,
                  color: darkMode && activeTab !== tabs[tabItem.index] ? '#ffffff' : '#404040',
                }}
                onClick={() => toggleTab(tabItem.index)}
              >
                {tabItem.icon}
                {tabItem.label}
              </NavLink>
            </NavItem>
          ))}
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
            {searchTerm && (
              <button
                className={`${styles.clearSearch} ${darkMode ? styles.darkClearSearch : ''}`}
                onClick={() => setSearchTerm('')}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '4px 8px',
                  marginLeft: '5px',
                }}
              >
                CLEAR
              </button>
            )}
          </div>
          <div>
            <button
              type="button"
              className={classnames(styles.button, styles.addItemButton)}
              onClick={() => setIsAddItemModalOpen(true)}
            >
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
              {index === 0 && preservedItems.length > 0 && !searchTerm && (
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
                    <p style={{ color: darkMode ? '#f5a23d' : 'rgb(175, 124, 62)' }}>
                      {preservedDesc.join(', ')}
                    </p>
                    <div>
                      <button
                        className={styles.viewAllButton}
                        style={
                          darkMode ? { backgroundColor: 'rgb(245, 162, 61)', color: 'white' } : {}
                        }
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className={styles.ingredientsContainer}>{renderItems(tab)}</div>
            </div>
          </TabPane>
        ))}
      </TabContent>
      <KIAddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onSubmit={handleAddItem}
        categoryLabel={activeTab}
        categoryValue={activeCategory}
        isSubmitting={addItemLoading}
        submitError={addItemError}
        darkMode={darkMode}
      />
      <KIUpdateItemModal
        isOpen={Boolean(selectedInventoryItem)}
        item={selectedInventoryItem}
        onClose={handleCloseUpdateItemModal}
        onSubmit={handleUpdateItem}
        onDelete={handleDeleteItem}
        categoryLabel={selectedItemCategoryLabel}
        categoryValue={selectedItemCategoryValue}
        isSubmitting={updateItemLoading}
        isDeleting={deleteItemLoading}
        submitError={updateItemError}
        deleteError={deleteItemError}
        darkMode={darkMode}
      />
      <KIReorderItemModal
        isOpen={Boolean(selectedReorderItem)}
        item={selectedReorderItem}
        onClose={handleCloseReorderItemModal}
        onSubmit={handleReorderItem}
        isSubmitting={reorderItemLoading}
        submitError={reorderItemError}
        darkMode={darkMode}
      />
    </div>
  );
};

export default KIInventory;
