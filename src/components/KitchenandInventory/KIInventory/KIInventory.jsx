import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  items,
  preservedItems,
  lowStock,
  criticalStock,
  onsiteGrown,
} from './KIInventorySampleItems.js';

const KIInventory = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
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
    if (activeTab !== tabs[tab]) setActiveTab(tabs[tab]);
  };
  useEffect(() => {
    // This is where you would fetch real data from an API or database
    // For this example, we're using static sample data from KIInventorySampleItems.js
  }, []);
  let preservedDesc = [];
  if (preservedItems.length > 0) {
    preservedDesc = preservedItems.map(
      item => `${item.presentQuantity} ${item.unit} of ${item.name}`,
    );
  }
  return (
    <div className={classnames(styles.inventoryContainer, darkMode ? styles.darkContainer : '')}>
      <header className={classnames(styles.inventoryPageHeader, darkMode ? styles.darkHeader : '')}>
        <div>
          <h2 className={styles.inventoryText}>Inventory Management</h2>
          <p>Track ingredients, equipment, and supplies across all kitchen operations</p>
        </div>
        <div className={styles.inventoryMetricCards}>
          <MetricCard metricname={'Total Items'} metricvalue={items.length} iconcolor={'#023f80'}>
            <FiPackage />
          </MetricCard>
          <MetricCard
            metricname={'Critical Stock'}
            metricvalue={criticalStock}
            iconcolor={'#ef2d2dff'}
          >
            <FiAlertCircle />
          </MetricCard>
          <MetricCard metricname={'Low Stock'} metricvalue={lowStock} iconcolor={'#dea208ff'}>
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
              Equipment & Supplies
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
              onChange={e => {
                setSearchTerm(e.target.value);
              }}
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
        <TabPane tabId={tabs[0]}>
          <div className={styles.tabContainer}>
            {preservedItems.length > 0 && (
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
              {items.map(item => (
                <div key={item._id}>
                  <KIItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </TabPane>
        <TabPane tabId={tabs[1]}>
          <div>Equipment & Supplies Content</div>
        </TabPane>
        <TabPane tabId={tabs[2]}>
          <div>Seeds Content</div>
        </TabPane>
        <TabPane tabId={tabs[3]}>
          <div>Canning Supplies Content</div>
        </TabPane>
        <TabPane tabId={tabs[4]}>
          <div>Animal Supplies Content</div>
        </TabPane>
      </TabContent>
    </div>
  );
};

export default KIInventory;
