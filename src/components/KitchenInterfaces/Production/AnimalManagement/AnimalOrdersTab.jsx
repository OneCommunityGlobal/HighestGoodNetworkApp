import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './AnimalManagement.module.css';

const AnimalOrdersTab = ({ orders, setOrders }) => {
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ supplierName: '', items: '', expectedDate: '' });

  const handleStatusChange = (id, currentStatus) => {
    let nextStatus = currentStatus;
    if (currentStatus === 'ordered') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';

    setOrders(orders.map(o => (o.id === id ? { ...o, status: nextStatus } : o)));
  };

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreateOrder = e => {
    e.preventDefault();
    const todayStr = getTodayDateString();
    if (newOrder.expectedDate < todayStr) {
      alert('Expected date cannot be in the past.');
      return;
    }
    const orderData = {
      id: `AO-00${orders.length + 1}`,
      supplierName: newOrder.supplierName,
      items: newOrder.items,
      orderedDate: todayStr,
      expectedDate: newOrder.expectedDate,
      status: 'ordered',
    };
    setOrders([orderData, ...orders]);
    setShowModal(false);
    setNewOrder({ supplierName: '', items: '', expectedDate: '' });
  };

  return (
    <div className={styles['tab-content']}>
      <div className={styles['tab-header']}>
        <div className={styles['tab-title-group']}>
          <h3>Animal Orders</h3>
          <p>Track orders for new livestock</p>
        </div>
        <button className={styles['btn-primary']} onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} /> New Order
        </button>
      </div>

      <div className={styles['list-container']}>
        {orders.length === 0 ? (
          <div className={styles['empty-state']}>No animal orders found.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className={styles['list-item']}>
              <div className={styles['item-main']}>
                <span className={styles['item-title']}>{order.id}</span>
                <span className={styles['item-subtitle']}>{order.supplierName}</span>
                <p className={styles['item-details']}>Items: {order.items}</p>
                <div className={styles['item-dates']}>
                  <span>Ordered: {order.orderedDate}</span>
                  <span>Expected: {order.expectedDate}</span>
                </div>
                <div className={styles['item-actions']}>
                  <button className={styles['btn-secondary']}>View Details</button>
                  {order.status === 'ordered' && (
                    <button
                      className={styles['btn-secondary']}
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      className={styles['btn-secondary']}
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
              <div className={styles['item-status']}>
                {(() => {
                  const statusClass = styles[`status-${order.status}`];
                  return (
                    <span className={`${styles['status-badge']} ${statusClass}`}>
                      {order.status}
                    </span>
                  );
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <>
          <button
            type="button"
            className={styles['modal-overlay']}
            onClick={() => setShowModal(false)}
            aria-label="Close modal"
          />
          <dialog open className={styles['modal-content']} aria-modal="true">
            <div className={styles['modal-header']}>
              <h2>Create New Order</h2>
              <button className={styles['modal-close']} onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className={styles['form-group']}>
                <label htmlFor="supplierName">Supplier Name</label>
                <input
                  id="supplierName"
                  required
                  type="text"
                  value={newOrder.supplierName}
                  onChange={e => setNewOrder({ ...newOrder, supplierName: e.target.value })}
                  placeholder="e.g. Heritage Hatchery"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="items">Items (Description & Qty)</label>
                <input
                  id="items"
                  required
                  type="text"
                  value={newOrder.items}
                  onChange={e => setNewOrder({ ...newOrder, items: e.target.value })}
                  placeholder="e.g. 6x Chicks (Buff Orpington)"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="expectedDate">Expected Date</label>
                <input
                  id="expectedDate"
                  required
                  type="date"
                  min={getTodayDateString()}
                  value={newOrder.expectedDate}
                  onChange={e => setNewOrder({ ...newOrder, expectedDate: e.target.value })}
                />
              </div>
              <div className={styles['modal-actions']}>
                <button
                  type="button"
                  className={styles['btn-secondary']}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles['btn-primary']}>
                  Submit Order
                </button>
              </div>
            </form>
          </dialog>
        </>
      )}
    </div>
  );
};

AnimalOrdersTab.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
  setOrders: PropTypes.func.isRequired,
};

export default AnimalOrdersTab;
