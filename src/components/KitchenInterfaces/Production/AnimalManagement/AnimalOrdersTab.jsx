import React, { useState } from 'react';
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

  const handleCreateOrder = e => {
    e.preventDefault();
    const orderData = {
      id: `AO-00${orders.length + 1}`,
      supplierName: newOrder.supplierName,
      items: newOrder.items,
      orderedDate: new Date().toISOString().split('T')[0],
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
                <span className={`${styles['status-badge']} ${styles[`status-${order.status}`]}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setShowModal(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Escape') setShowModal(false);
          }}
        >
          <div
            className={styles['modal-content']}
            onClick={e => e.stopPropagation()}
            role="presentation"
          >
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalOrdersTab;
