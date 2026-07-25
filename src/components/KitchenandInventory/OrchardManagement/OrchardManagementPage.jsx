import { useState, useEffect } from 'react';
import styles from './OrchardManagementPage.module.css';

const initOrders = [
  {
    id: 'OR-001',
    supplier: 'Heritage Orchard Nursery',
    items: '2x Peach Trees, 1x Plum Tree',
    ordered: '2024-10-01',
    expected: '2024-11-15',
    status: 'ordered',
  },
  {
    id: 'OR-002',
    supplier: 'Berry Best Plants',
    items: '5x Strawberry Plants',
    ordered: '2024-10-10',
    expected: '2024-10-28',
    status: 'shipped',
  },
  {
    id: 'OR-003',
    supplier: 'Green Roots Nursery',
    items: '3x Apple Trees',
    ordered: '2024-10-15',
    expected: '2024-12-01',
    status: 'delivered',
  },
];

const initPlanting = [
  {
    id: 1,
    qty: '2x Peach Trees',
    location: 'Row 3, Positions 1-2',
    notes: 'Requires full sun',
    date: '2024-11-20',
  },
  {
    id: 2,
    qty: '1x Plum Tree',
    location: 'Row 3, Position 4',
    notes: 'Plant with companion pollinators',
    date: '2024-11-20',
  },
  {
    id: 3,
    qty: '5x Strawberry Plants',
    location: 'Berry Section C',
    notes: 'Add compost before planting',
    date: '2024-11-01',
  },
];

const TABS = [
  'Trees & Bushes',
  'Orders',
  'Planting Schedule',
  'Trimming Schedule',
  'Harvest Calendar',
];
const NAV_LINKS = [
  'Dashboard',
  'Production',
  'Processing',
  'Recipes',
  'Inventory',
  'Orders',
  'Reports',
];

export default function OrchardManagementPage() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState('Orders');
  const [orders, setOrders] = useState(initOrders);
  const [planting, setPlanting] = useState(initPlanting);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPlantForm, setShowPlantForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [newOrder, setNewOrder] = useState({ supplier: '', items: '', ordered: '', expected: '' });
  const [newPlant, setNewPlant] = useState({ qty: '', location: '', notes: '', date: '' });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setDark(mq.matches);
    const handler = e => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const pending = orders.filter(o => o.status !== 'delivered').length;
  const d = dark ? styles.dark : '';

  const dashCards = [
    {
      label: 'Total Trees & Bushes',
      value: 5,
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3a7d44"
          strokeWidth="2"
        >
          <path d="M12 22V12M12 12C12 7 7 3 7 3s0 5 5 9M12 12c0-5 5-9 5-9s0 5-5 9" />
          <path d="M5 22h14" />
        </svg>
      ),
    },
    {
      label: 'Pending Orders',
      value: pending,
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5b8dd9"
          strokeWidth="2"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
    },
    {
      label: 'Trimming Tasks',
      value: 4,
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9b59b6"
          strokeWidth="2"
        >
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: 'Expected Harvests',
      value: 6,
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d4a843"
          strokeWidth="2"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
    },
  ];

  const getBadgeClass = status => {
    if (status === 'ordered') return `${styles.badge} ${styles.badgeOrdered}`;
    if (status === 'shipped') return `${styles.badge} ${styles.badgeShipped}`;
    if (status === 'delivered') return `${styles.badge} ${styles.badgeDelivered}`;
    return `${styles.badge} ${styles.badgeOrdered}`;
  };

  const advanceStatus = id => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== id) return o;
        const next =
          o.status === 'ordered' ? 'shipped' : o.status === 'shipped' ? 'delivered' : o.status;
        return { ...o, status: next };
      }),
    );
  };

  const addOrder = () => {
    if (!newOrder.supplier || !newOrder.items || !newOrder.ordered || !newOrder.expected) return;
    const id = `OR-00${orders.length + 1}`;
    setOrders(prev => [...prev, { ...newOrder, id, status: 'ordered' }]);
    setNewOrder({ supplier: '', items: '', ordered: '', expected: '' });
    setShowOrderForm(false);
  };

  const addPlant = () => {
    if (!newPlant.qty || !newPlant.location || !newPlant.date) return;
    setPlanting(prev => [...prev, { ...newPlant, id: Date.now() }]);
    setNewPlant({ qty: '', location: '', notes: '', date: '' });
    setShowPlantForm(false);
  };

  const renderOrders = () => (
    <div className={`${styles.card} ${d}`}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>🌿 Tree & Bush Orders</div>
          <div className={styles.cardSub}>Track orders from nurseries and suppliers</div>
        </div>
        <button className={styles.btnGreen} onClick={() => setShowOrderForm(true)}>
          + New Order
        </button>
      </div>
      {orders.filter(o => o.status !== 'delivered').length === 0 && (
        <div className={styles.emptyState}>No pending orders 🎉</div>
      )}
      {orders.map(o => (
        <div key={o.id} className={`${styles.orderCard} ${d}`}>
          <div className={styles.orderTop}>
            <span className={styles.orderId}>{o.id}</span>
            <span className={getBadgeClass(o.status)}>{o.status}</span>
          </div>
          <div className={styles.orderSupplier}>{o.supplier}</div>
          <div className={styles.orderMeta}>📦 Items: {o.items}</div>
          <div className={styles.orderMeta}>📅 Ordered: {o.ordered}</div>
          <div className={styles.orderMeta}>🚚 Expected: {o.expected}</div>
          <div className={styles.orderActions}>
            <button className={`${styles.btnOutline} ${d}`} onClick={() => setShowDetail(o)}>
              View Details
            </button>
            {o.status === 'ordered' && (
              <button className={styles.btnGreen} onClick={() => advanceStatus(o.id)}>
                Mark as Shipped
              </button>
            )}
            {o.status === 'shipped' && (
              <button className={styles.btnGreen} onClick={() => advanceStatus(o.id)}>
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPlanting = () => (
    <div className={`${styles.card} ${d}`}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>📅 Planting Schedule</div>
          <div className={styles.cardSub}>Upcoming planting tasks for new trees and bushes</div>
        </div>
      </div>
      {planting.map(p => (
        <div key={p.id} className={`${styles.plantCard} ${d}`}>
          <div className={styles.plantInfo}>
            <div className={styles.plantQty}>{p.qty}</div>
            <div className={styles.plantMeta}>📍 Location: {p.location}</div>
            {p.notes && <div className={styles.plantMeta}>📝 Notes: {p.notes}</div>}
          </div>
          <div className={styles.plantDateBadge}>{p.date}</div>
        </div>
      ))}
      <button className={`${styles.addPlantBtn} ${d}`} onClick={() => setShowPlantForm(true)}>
        + Add Planting Task
      </button>
    </div>
  );

  return (
    <div className={`${styles.page} ${dark ? styles.pageDark : ''}`}>
      {/* Navbar */}
      <div className={`${styles.nav} ${d}`}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17 8C8 10 5.9 16.17 3.82 20.34L5.71 21l1-2.3A4.49 4.49 0 0 0 8 19c8-2 9-9 9-9" />
              <path d="M10.72 11.21A11 11 0 0 1 19 3c0 0-4 2-4 8" />
            </svg>
          </div>
          <div>
            <div className={styles.navTitle}>Transition Kitchen</div>
            <div className={styles.navSub}>One Community Global</div>
          </div>
        </div>
        <div className={styles.navLinks}>
          {NAV_LINKS.map(n => (
            <span
              key={n}
              className={n === 'Production' ? styles.navLinkActive : `${styles.navLink} ${d}`}
            >
              {n}
              {n === 'Production' ? ' ▾' : ''}
            </span>
          ))}
          <button className={`${styles.darkToggle} ${d}`} onClick={() => setDark(!dark)}>
            {dark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className={styles.main}>
        <div className={styles.pageTitle}>Orchard Management</div>
        <div className={styles.pageSub}>
          Manage fruit trees, bushes, and orchard maintenance schedules
        </div>

        {/* Dashboard Cards */}
        <div className={styles.dashGrid}>
          {dashCards.map(c => (
            <div key={c.label} className={`${styles.dashCard} ${d}`}>
              <div className={styles.dashLabel}>{c.label}</div>
              <div className={styles.dashRow}>
                <div className={styles.dashNum}>{c.value}</div>
                {c.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabRow}>
          {TABS.map(tb => (
            <button
              key={tb}
              className={`${styles.tabBtn} ${d} ${tab === tb ? styles.tabBtnActive : ''}`}
              onClick={() => setTab(tb)}
            >
              {tb}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'Orders' && renderOrders()}
        {tab === 'Planting Schedule' && renderPlanting()}
        {['Trees & Bushes', 'Trimming Schedule', 'Harvest Calendar'].includes(tab) && (
          <div className={`${styles.card} ${styles.emptyTab} ${d}`}>
            <div className={styles.emptyIcon}>🚧</div>
            <div>{tab} section coming soon</div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetail && (
        <div
          className={styles.modal}
          role="button"
          tabIndex={0}
          onClick={() => setShowDetail(null)}
          onKeyDown={e => e.key === 'Enter' && setShowDetail(null)}
        >
          <div
            className={`${styles.modalBox} ${d}`}
            role="button"
            tabIndex={0}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>Order Details — {showDetail.id}</div>
            <div className={styles.detailRow}>
              <b>Supplier:</b> {showDetail.supplier}
            </div>
            <div className={styles.detailRow}>
              <b>Items:</b> {showDetail.items}
            </div>
            <div className={styles.detailRow}>
              <b>Ordered:</b> {showDetail.ordered}
            </div>
            <div className={styles.detailRow}>
              <b>Expected:</b> {showDetail.expected}
            </div>
            <div className={styles.detailRow}>
              <b>Status:</b>{' '}
              <span className={getBadgeClass(showDetail.status)}>{showDetail.status}</span>
            </div>
            <div className={styles.modalBtns}>
              <button className={`${styles.btnOutline} ${d}`} onClick={() => setShowDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showOrderForm && (
        <div
          className={styles.modal}
          role="button"
          tabIndex={0}
          onClick={() => setShowOrderForm(false)}
          onKeyDown={e => e.key === 'Enter' && setShowOrderForm(false)}
        >
          <div
            className={`${styles.modalBox} ${d}`}
            role="button"
            tabIndex={0}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>+ New Order</div>
            <label htmlFor="supplier-input" className={styles.label}>
              Supplier Name
            </label>
            <input
              id="supplier-input"
              className={`${styles.input} ${d}`}
              value={newOrder.supplier}
              onChange={e => setNewOrder({ ...newOrder, supplier: e.target.value })}
              placeholder="e.g. Heritage Orchard Nursery"
            />
            <label htmlFor="items-input" className={styles.label}>
              Items
            </label>
            <input
              id="items-input"
              className={`${styles.input} ${d}`}
              value={newOrder.items}
              onChange={e => setNewOrder({ ...newOrder, items: e.target.value })}
              placeholder="e.g. 2x Peach Trees"
            />
            <label htmlFor="ordered-input" className={styles.label}>
              Order Date
            </label>
            <input
              id="ordered-input"
              className={`${styles.input} ${d}`}
              type="date"
              value={newOrder.ordered}
              onChange={e => setNewOrder({ ...newOrder, ordered: e.target.value })}
            />
            <label htmlFor="expected-input" className={styles.label}>
              Expected Date
            </label>
            <input
              id="expected-input"
              className={`${styles.input} ${d}`}
              type="date"
              value={newOrder.expected}
              onChange={e => setNewOrder({ ...newOrder, expected: e.target.value })}
            />
            <div className={styles.modalBtns}>
              <button
                className={`${styles.btnOutline} ${d}`}
                onClick={() => setShowOrderForm(false)}
              >
                Cancel
              </button>
              <button className={styles.btnGreen} onClick={addOrder}>
                Add Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Planting Task Modal */}
      {showPlantForm && (
        <div
          className={styles.modal}
          role="button"
          tabIndex={0}
          onClick={() => setShowPlantForm(false)}
          onKeyDown={e => e.key === 'Enter' && setShowPlantForm(false)}
        >
          <div
            className={`${styles.modalBox} ${d}`}
            role="button"
            tabIndex={0}
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>+ Add Planting Task</div>
            <label htmlFor="qty-input" className={styles.label}>
              Quantity & Plant Type
            </label>
            <input
              id="qty-input"
              className={`${styles.input} ${d}`}
              value={newPlant.qty}
              onChange={e => setNewPlant({ ...newPlant, qty: e.target.value })}
              placeholder="e.g. 3x Apple Trees"
            />
            <label htmlFor="location-input" className={styles.label}>
              Location
            </label>
            <input
              id="location-input"
              className={`${styles.input} ${d}`}
              value={newPlant.location}
              onChange={e => setNewPlant({ ...newPlant, location: e.target.value })}
              placeholder="e.g. Row 4, Position 2"
            />
            <label htmlFor="notes-input" className={styles.label}>
              Notes (optional)
            </label>
            <input
              id="notes-input"
              className={`${styles.input} ${d}`}
              value={newPlant.notes}
              onChange={e => setNewPlant({ ...newPlant, notes: e.target.value })}
              placeholder="e.g. Water daily for first week"
            />
            <label htmlFor="date-input" className={styles.label}>
              Scheduled Date
            </label>
            <input
              id="date-input"
              className={`${styles.input} ${d}`}
              type="date"
              value={newPlant.date}
              onChange={e => setNewPlant({ ...newPlant, date: e.target.value })}
            />
            <div className={styles.modalBtns}>
              <button
                className={`${styles.btnOutline} ${d}`}
                onClick={() => setShowPlantForm(false)}
              >
                Cancel
              </button>
              <button className={styles.btnGreen} onClick={addPlant}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
