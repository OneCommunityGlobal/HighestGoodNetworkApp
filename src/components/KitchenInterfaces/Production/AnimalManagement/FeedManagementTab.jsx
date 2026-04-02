import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShoppingCart, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import styles from './AnimalManagement.module.css';

const FeedManagementTab = ({ feedOrders, setFeedOrders, feedInventory, setFeedInventory }) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ supplierName: '', items: '', expectedDate: '' });
  const [newItem, setNewItem] = useState({
    name: '',
    unit: '',
    stockLeft: '',
    reorderThreshold: '',
  });

  const handleStatusChange = (id, currentStatus) => {
    let nextStatus = currentStatus;
    if (currentStatus === 'ordered') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';
    setFeedOrders(feedOrders.map(o => (o.id === id ? { ...o, status: nextStatus } : o)));
  };

  const handleCreateOrder = e => {
    e.preventDefault();
    const order = {
      id: `FO-${String(feedOrders.length + 1).padStart(3, '0')}`,
      supplierName: newOrder.supplierName,
      items: newOrder.items,
      orderedDate: new Date().toISOString().split('T')[0],
      expectedDate: newOrder.expectedDate,
      status: 'ordered',
    };
    setFeedOrders([order, ...feedOrders]);
    setShowOrderModal(false);
    setNewOrder({ supplierName: '', items: '', expectedDate: '' });
  };

  const handleAddInventoryItem = e => {
    e.preventDefault();
    const item = {
      id: `FI-${Date.now()}`,
      name: newItem.name,
      unit: newItem.unit,
      stockLeft: parseFloat(newItem.stockLeft),
      reorderThreshold: parseFloat(newItem.reorderThreshold),
    };
    setFeedInventory([...feedInventory, item]);
    setShowInventoryModal(false);
    setNewItem({ name: '', unit: '', stockLeft: '', reorderThreshold: '' });
  };

  return (
    <div className={styles['feed-split-layout']}>
      {/* ─── LEFT: Feed Inventory ─── */}
      <div className={styles['feed-panel']}>
        <div className={styles['feed-panel-header']}>
          <FontAwesomeIcon icon={faBoxOpen} className={styles['panel-icon-green']} />
          <div>
            <h3 className={styles['panel-title']}>Feed Inventory</h3>
            <p className={styles['panel-subtitle']}>Current feed stock levels</p>
          </div>
        </div>

        <div className={styles['feed-inventory-list']}>
          {feedInventory.length === 0 ? (
            <div className={styles['empty-state']}>No inventory items.</div>
          ) : (
            feedInventory.map(item => {
              const isLow = item.stockLeft < item.reorderThreshold;
              return (
                <div key={item.id} className={styles['inventory-row']}>
                  <div className={styles['inventory-row-info']}>
                    <span className={styles['inventory-row-name']}>{item.name}</span>
                    <span className={styles['inventory-row-detail']}>
                      Stock: {item.stockLeft} {item.unit}
                    </span>
                    <span className={styles['inventory-row-detail']}>
                      Reorder at {item.reorderThreshold} {item.unit}
                    </span>
                  </div>
                  <span
                    className={`${styles['status-badge']} ${
                      isLow ? styles['status-warning'] : styles['status-good']
                    }`}
                  >
                    {isLow ? 'warning' : 'good'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button className={styles['btn-add-row']} onClick={() => setShowInventoryModal(true)}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '6px' }} />
          Add Feed Item
        </button>
      </div>

      {/* ─── RIGHT: Feed Orders ─── */}
      <div className={styles['feed-panel']}>
        <div className={styles['feed-panel-header']}>
          <FontAwesomeIcon icon={faShoppingCart} className={styles['panel-icon-blue']} />
          <div>
            <h3 className={styles['panel-title']}>Feed Orders</h3>
            <p className={styles['panel-subtitle']}>Track feed purchases</p>
          </div>
        </div>

        <div className={styles['list-container']}>
          {feedOrders.length === 0 ? (
            <div className={styles['empty-state']}>No feed orders found.</div>
          ) : (
            feedOrders.map(order => (
              <div key={order.id} className={styles['list-item']}>
                <div className={styles['item-main']}>
                  <div className={styles['order-row-top']}>
                    <span className={styles['item-title']}>{order.id}</span>
                    <span
                      className={`${styles['status-badge']} ${styles[`status-${order.status}`]}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className={styles['item-subtitle']}>{order.supplierName}</span>
                  <p className={styles['item-details']}>{order.items}</p>
                  <div className={styles['item-dates']}>
                    <span>Ordered: {order.orderedDate}</span>
                    <span>
                      {order.status === 'delivered'
                        ? `Delivered: ${order.expectedDate}`
                        : `Expected: ${order.expectedDate}`}
                    </span>
                  </div>
                  {order.status === 'ordered' && (
                    <div className={styles['item-actions']}>
                      <button
                        className={styles['btn-secondary']}
                        onClick={() => handleStatusChange(order.id, order.status)}
                      >
                        Mark as Shipped
                      </button>
                    </div>
                  )}
                  {order.status === 'shipped' && (
                    <div className={styles['item-actions']}>
                      <button
                        className={styles['btn-secondary']}
                        onClick={() => handleStatusChange(order.id, order.status)}
                      >
                        Mark as Delivered
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button className={styles['btn-order-feed']} onClick={() => setShowOrderModal(true)}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
          Order Feed
        </button>
      </div>

      {/* ─── ORDER MODAL ─── */}
      {showOrderModal && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setShowOrderModal(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Escape') setShowOrderModal(false);
          }}
        >
          <div
            className={styles['modal-content']}
            onClick={e => e.stopPropagation()}
            role="presentation"
          >
            <div className={styles['modal-header']}>
              <h2>New Feed Order</h2>
              <button className={styles['modal-close']} onClick={() => setShowOrderModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className={styles['form-group']}>
                <label htmlFor="feedSupplierName">Supplier Name</label>
                <input
                  id="feedSupplierName"
                  required
                  type="text"
                  value={newOrder.supplierName}
                  onChange={e => setNewOrder({ ...newOrder, supplierName: e.target.value })}
                  placeholder="e.g. Farm Supply Co."
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="feedItems">Items (Description &amp; Qty)</label>
                <input
                  id="feedItems"
                  required
                  type="text"
                  value={newOrder.items}
                  onChange={e => setNewOrder({ ...newOrder, items: e.target.value })}
                  placeholder="e.g. Layer Feed (100 lbs), Scratch Grains (50 lbs)"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="feedExpectedDate">Expected Delivery Date</label>
                <input
                  id="feedExpectedDate"
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
                  onClick={() => setShowOrderModal(false)}
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

      {/* ─── INVENTORY MODAL ─── */}
      {showInventoryModal && (
        <div
          className={styles['modal-overlay']}
          onClick={() => setShowInventoryModal(false)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Escape') setShowInventoryModal(false);
          }}
        >
          <div
            className={styles['modal-content']}
            onClick={e => e.stopPropagation()}
            role="presentation"
          >
            <div className={styles['modal-header']}>
              <h2>Add Feed Item</h2>
              <button
                className={styles['modal-close']}
                onClick={() => setShowInventoryModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddInventoryItem}>
              <div className={styles['form-group']}>
                <label htmlFor="inventoryName">Feed Name</label>
                <input
                  id="inventoryName"
                  required
                  type="text"
                  value={newItem.name}
                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g. Layer Feed"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="inventoryUnit">Unit</label>
                <input
                  id="inventoryUnit"
                  required
                  type="text"
                  value={newItem.unit}
                  onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="e.g. lbs, bags, bales"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="inventoryStock">Current Stock</label>
                <input
                  id="inventoryStock"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={newItem.stockLeft}
                  onChange={e => setNewItem({ ...newItem, stockLeft: e.target.value })}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="inventoryThreshold">Reorder Threshold</label>
                <input
                  id="inventoryThreshold"
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={newItem.reorderThreshold}
                  onChange={e => setNewItem({ ...newItem, reorderThreshold: e.target.value })}
                />
              </div>
              <div className={styles['modal-actions']}>
                <button
                  type="button"
                  className={styles['btn-secondary']}
                  onClick={() => setShowInventoryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles['btn-primary']}>
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedManagementTab;
