import { useState } from 'react';
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
} from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

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
  return (
    <div className={classnames(styles.inventoryContainer, darkMode ? styles.darkContainer : '')}>
      <header className={classnames(styles.inventoryPageHeader, darkMode ? styles.darkHeader : '')}>
        <div>
          <h2 className={styles.inventoryText}>Inventory Management</h2>
          <p>Track ingredients, equipment, and supplies across all kitchen operations</p>
        </div>
        <div className={styles.inventoryMetricCards}>
          <MetricCard metricname={'Total Items'} metricvalue={'18'} iconcolor={'#023f80'}>
            <FiPackage />
          </MetricCard>
          <MetricCard metricname={'Critical Stock'} metricvalue={'1'} iconcolor={'#ef2d2dff'}>
            <FiAlertCircle />
          </MetricCard>
          <MetricCard metricname={'Low Stock'} metricvalue={'2'} iconcolor={'#dea208ff'}>
            <FiAlertTriangle />
          </MetricCard>
          <MetricCard metricname={'Onsite Grown'} metricvalue={'15'} iconcolor={'#12ad36ff'}>
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
          <div>Ingredients Content</div>
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
