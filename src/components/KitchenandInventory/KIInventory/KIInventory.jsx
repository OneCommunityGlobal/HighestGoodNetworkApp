import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import styles from './KIInventory.module.css';
import MetricCard from '../MetricCards/MetricCard';
import classnames from 'classnames';
// Icons
import { TbToolsKitchen2 } from 'react-icons/tb';
import { BsBoxSeam } from 'react-icons/bs';
import { LiaSeedlingSolid } from 'react-icons/lia';
import { GiMasonJar } from 'react-icons/gi';
import { MdOutlineShoppingCart } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

// import { ENDPOINTS } from '../../utils/URL';
// import axios from 'axios';

const KIInventory = () => {
  const tabs = [
    'Ingredients',
    'Equipment & Supplies',
    'Seeds',
    'Canning Supplies',
    'Animal Supplies',
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const toggleTab = tab => {
    if (activeTab !== tabs[tab]) setActiveTab(tabs[tab]);
  };
  // console.log('Active Tab:', activeTab);
  return (
    <div className={`${styles.inventoryContainer}`}>
      <header className={`${styles.inventorypageheader}`}>
        <div>
          <h2>Inventory Management</h2>
          <p>Track ingredients, equipment, and supplies across all kitchen operations</p>
        </div>
        <div className={styles.inventoryMetricCards}>
          <MetricCard metricname={'Total Items'} metricvalue={'18'} />
          <MetricCard metricname={'Critical Stock'} metricvalue={'1'} />
          <MetricCard metricname={'Low Stock'} metricvalue={'2'} />
          <MetricCard metricname={'Onsite Grown'} metricvalue={'15'} />
        </div>
        <Nav className={`${styles.inventoryNavBar}`} style={{ color: 'black' }}>
          <NavItem className={`${styles.inventoryNavBarItem}`}>
            <NavLink
              style={{ color: 'black' }}
              className={`${classnames({ active: true })}`}
              onClick={() => toggleTab(0)}
            >
              <TbToolsKitchen2 className={styles.inventoryNavBarIcon} />
              Ingredients
            </NavLink>
          </NavItem>
          <NavItem className={`${styles.inventoryNavBarItem}`}>
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(1)}>
              <BsBoxSeam className={styles.inventoryNavBarIcon} />
              Equipment & Supplies
            </NavLink>
          </NavItem>
          <NavItem className={`${styles.inventoryNavBarItem}`}>
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(2)}>
              <LiaSeedlingSolid className={styles.inventoryNavBarIcon} />
              Seeds
            </NavLink>
          </NavItem>
          <NavItem className={`${styles.inventoryNavBarItem}`}>
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(3)}>
              <GiMasonJar className={styles.inventoryNavBarIcon} />
              Canning Supplies
            </NavLink>
          </NavItem>
          <NavItem
            className={`${styles.inventoryNavBarItem}`}
            style={{ paddingRight: 0, marginRight: 0 }}
          >
            <NavLink style={{ color: 'black' }} onClick={() => toggleTab(4)}>
              <MdOutlineShoppingCart className={styles.inventoryNavBarIcon} />
              Animal Supplies
            </NavLink>
          </NavItem>
        </Nav>
        <div className={`${styles.inventoryInteraction}`}>
          <div className={styles.inventorySearchBar}>
            <span>
              <FiSearch />
            </span>
            <input type="text" placeholder={`Search ${activeTab}...`} />
          </div>
          <button className={`${styles.button} ${styles.addItemButton}`}>{'+ Add Item'}</button>
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
