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
import { MdOutlineQrCodeScanner } from 'react-icons/md';
import {
  FiSearch,
  FiPackage,
  FiAlertCircle,
  FiAlertTriangle,
  FiShoppingCart,
} from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

// import { ENDPOINTS } from '../../utils/URL';
// import axios from 'axios';

const KIInventory = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const tabs = [
    'Ingredients',
    'Equipment & Supplies',
    'Seeds',
    'Canning Supplies',
    'Animal Supplies',
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const toggleTab = tab => {
    if (activeTab !== tabs[tab]) setActiveTab(tabs[tab]);
  };
  // console.log('Active Tab:', activeTab);
  // console.log('Search Term:', searchTerm);
  return (
    <div className={`${styles.inventoryContainer}`}>
      <header className={`${styles.inventorypageheader}`}>
        <div>
          <h2>Inventory Management</h2>
          <p>Track ingredients, equipment, and supplies across all kitchen operations</p>
        </div>
        <div className={styles.inventoryMetricCards}>
          <MetricCard metricname={'Total Items'} metricvalue={'18'} color={'#023f80'}>
            <FiPackage />
          </MetricCard>
          <MetricCard metricname={'Critical Stock'} metricvalue={'1'} color={'#ef2d2dff'}>
            <FiAlertCircle />
          </MetricCard>
          <MetricCard metricname={'Low Stock'} metricvalue={'2'} color={'#dea208ff'}>
            <FiAlertTriangle />
          </MetricCard>
          <MetricCard metricname={'Onsite Grown'} metricvalue={'15'} color={'#12ad36ff'}>
            <RiLeafLine />
          </MetricCard>
        </div>
        <Nav className={`${styles.inventoryNavBar}`}>
          <NavItem
            className={`${styles.inventoryNavBarItem} ${classnames({
              active: activeTab === tabs[0],
            })}`}
          >
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(0)}>
              <TbToolsKitchen2 className={styles.inventoryNavBarIcon} />
              Ingredients
            </NavLink>
          </NavItem>
          <NavItem
            className={`${styles.inventoryNavBarItem} ${classnames({
              active: activeTab === tabs[1],
            })}`}
          >
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(1)}>
              <FiPackage className={styles.inventoryNavBarIcon} />
              Equipment & Supplies
            </NavLink>
          </NavItem>
          <NavItem
            className={`${styles.inventoryNavBarItem} ${classnames({
              active: activeTab === tabs[2],
            })}`}
          >
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(2)}>
              <LiaSeedlingSolid className={styles.inventoryNavBarIcon} />
              Seeds
            </NavLink>
          </NavItem>
          <NavItem
            className={`${styles.inventoryNavBarItem} ${classnames({
              active: activeTab === tabs[3],
            })}`}
          >
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(3)}>
              <GiMasonJar className={styles.inventoryNavBarIcon} />
              Canning Supplies
            </NavLink>
          </NavItem>
          <NavItem
            className={`${styles.inventoryNavBarItem} ${classnames({
              active: activeTab === tabs[4],
            })}`}
            style={{ paddingRight: 0, marginRight: 0 }}
          >
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(4)}>
              <FiShoppingCart className={styles.inventoryNavBarIcon} />
              Animal Supplies
            </NavLink>
          </NavItem>
        </Nav>
        <div className={`${styles.inventoryInteraction}`}>
          <div className={styles.inventorySearchBar}>
            <span>
              <FiSearch />
            </span>
            <input
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
            <button className={`${styles.button} ${styles.addItemButton}`}>{'+ Add Item'}</button>
            <button className={`${styles.button} ${styles.scanQRButton}`}>
              {<MdOutlineQrCodeScanner />} {'Scan QR'}
            </button>
          </div>
        </div>
      </header>
      <TabContent activeTab={activeTab} className={styles.inventoryTabContent}>
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
