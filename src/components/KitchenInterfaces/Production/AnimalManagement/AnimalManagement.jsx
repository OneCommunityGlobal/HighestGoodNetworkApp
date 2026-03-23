import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faShoppingCart, faBoxOpen, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import AnimalOrdersTab from './AnimalOrdersTab';
import CullingCalendarTab from './CullingCalendarTab';
import styles from './AnimalManagement.module.css';

const AnimalManagement = () => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([
    {
      id: 'AO-001',
      supplierName: 'Heritage Hatchery',
      items: '6x Chicks (Buff Orpington)',
      orderedDate: '2024-10-15',
      expectedDate: '2024-11-01',
      status: 'ordered',
    },
    {
      id: 'AO-002',
      supplierName: 'Local Farm',
      items: '2x Goat Kids',
      orderedDate: '2024-10-20',
      expectedDate: '2024-12-15',
      status: 'confirmed',
    },
  ]);

  const [cullingEvents, setCullingEvents] = useState([
    {
      id: 'CULL-1',
      animalName: 'Rabbits',
      count: 3,
      scheduledDate: '2024-11-15',
      notes: 'Reached optimal size',
      status: 'scheduled',
    },
    {
      id: 'CULL-2',
      animalName: 'Chickens',
      count: 2,
      scheduledDate: '2024-12-01',
      notes: 'Low production hens',
      status: 'scheduled',
    },
  ]);

  const pendingOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const upcomingCullingCount = cullingEvents.filter(e => e.status === 'scheduled').length;

  return (
    <div
      className={`${styles['animal-management-container']} ${darkMode ? styles['dark-mode'] : ''}`}
    >
      <div className={styles['page-header']} style={{ marginTop: '30px' }}>
        <h1 className={styles['page-title']}>Animal Management</h1>
        <p className={styles['page-subtitle']}>
          Manage livestock, feed orders, and animal care schedules
        </p>
      </div>

      <div className={styles['dashboard-cards']}>
        <div className={styles['dashboard-card']}>
          <div className={styles['card-info']}>
            <span className={styles['card-title']}>Total Animals</span>
            <span className={styles['card-value']}>29</span>
          </div>
          <div className={`${styles['card-icon']} ${styles['icon-paw']}`}>
            <FontAwesomeIcon icon={faPaw} />
          </div>
        </div>

        <div className={styles['dashboard-card']}>
          <div className={styles['card-info']}>
            <span className={styles['card-title']}>Animal Orders</span>
            <span className={styles['card-value']}>{pendingOrdersCount}</span>
          </div>
          <div className={`${styles['card-icon']} ${styles['icon-cart']}`}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
        </div>

        <div className={styles['dashboard-card']}>
          <div className={styles['card-info']}>
            <span className={styles['card-title']}>Feed Orders</span>
            <span className={styles['card-value']}>2</span>
          </div>
          <div className={`${styles['card-icon']} ${styles['icon-feed']}`}>
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>
        </div>

        <div className={styles['dashboard-card']}>
          <div className={styles['card-info']}>
            <span className={styles['card-title']}>Culling Tasks</span>
            <span className={styles['card-value']}>{upcomingCullingCount}</span>
          </div>
          <div className={`${styles['card-icon']} ${styles['icon-calendar']}`}>
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
        </div>
      </div>

      <div className={styles['tabs-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'inventory' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Animal Inventory
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'orders' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Animal Orders
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'feed' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Feed Management
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'culling' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('culling')}
        >
          Culling Calendar
        </button>
      </div>

      <div className={styles['tab-content-area']}>
        {activeTab === 'orders' && <AnimalOrdersTab orders={orders} setOrders={setOrders} />}
        {activeTab === 'culling' && (
          <CullingCalendarTab events={cullingEvents} setEvents={setCullingEvents} />
        )}
        {activeTab === 'inventory' && (
          <div className={styles['tab-content']}>
            <div className={styles['empty-state']}>Animal Inventory content coming soon.</div>
          </div>
        )}
        {activeTab === 'feed' && (
          <div className={styles['tab-content']}>
            <div className={styles['empty-state']}>Feed Management content coming soon.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalManagement;
