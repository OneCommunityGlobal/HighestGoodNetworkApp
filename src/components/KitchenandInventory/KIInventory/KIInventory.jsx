import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
import { Nav, NavItem, NavLink } from 'reactstrap';
import styles from './KIInventory.module.css';
import MetricCard from '../MetricCards/MetricCard';

// import { ENDPOINTS } from '../../utils/URL';
// import axios from 'axios';

const KIInventory = () => {
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
        <Nav>
          <NavItem>
            <NavLink>Ingredients</NavLink>
          </NavItem>
        </Nav>
      </header>
    </div>
  );
};

export default KIInventory;
