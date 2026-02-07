import { useState } from 'react';
import styles from './OrdersPage.module.css';

const ordersData = [
  {
    id: 'PO-2025-004',
    status: 'ordered',
    supplier: 'Green Valley Farms',
    orderDate: '10/25/2025',
    expectedDelivery: '10/27/2025',
    itemCount: 3,
    total: 48.87,
    items: [
      { name: 'Organic Spinach', quantity: '5 lbs', unitPrice: 3.99, total: 19.95 },
      { name: 'Bell Peppers (Mixed)', quantity: '8 lbs', unitPrice: 2.99, total: 23.92 },
      { name: 'Fresh Rosemary', quantity: '2 bunches', unitPrice: 2.5, total: 5.0 },
    ],
  },
  {
    id: 'PO-2025-002',
    status: 'received',
    supplier: 'Wholesome Grains Co.',
    orderDate: '10/19/2025',
    expectedDelivery: '10/22/2025',
    itemCount: 3,
    total: 217.2,
    items: [
      { name: 'Quinoa (Organic)', quantity: '20 lbs', unitPrice: 4.5, total: 90.0 },
      { name: 'Brown Rice', quantity: '25 lbs', unitPrice: 2.99, total: 74.75 },
      { name: 'Whole Wheat Flour', quantity: '30 lbs', unitPrice: 1.89, total: 56.7 },
    ],
  },
  {
    id: 'PO-2025-001',
    status: 'stocked',
    supplier: 'Sustainable Oils & More',
    orderDate: '10/24/2025',
    expectedDelivery: '10/28/2025',
    itemCount: 3,
    total: 107.41,
    urgent: 'Urgent - running low on olive oil',
    items: [
      { name: 'Olive Oil (Extra Virgin)', quantity: '6 bottles', unitPrice: 12.99, total: 77.94 },
      { name: 'Balsamic Vinegar', quantity: '3 bottles', unitPrice: 8.5, total: 25.5 },
      { name: 'Sea Salt', quantity: '2 containers', unitPrice: 5.99, total: 11.98 },
    ],
  },
  {
    id: 'PO-2025-003',
    status: 'stocked',
    supplier: 'Local Dairy Collective',
    orderDate: '10/21/2025',
    expectedDelivery: '10/22/2025',
    itemCount: 3,
    total: 129.85,
    items: [
      { name: 'Whole Milk', quantity: '10 gallons', unitPrice: 4.99, total: 49.9 },
      { name: 'Free-Range Eggs', quantity: '8 dozen', unitPrice: 5.5, total: 44.0 },
      { name: 'Butter (Unsalted)', quantity: '5 lbs', unitPrice: 6.99, total: 34.95 },
    ],
  },
];

const StatusBadge = ({ status }) => {
  const badgeClass = `${styles.badge} ${
    status === 'ordered'
      ? styles.badgeOrdered
      : status === 'received'
      ? styles.badgeReceived
      : styles.badgeStocked
  }`;
  return <span className={badgeClass}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const StatCard = ({ label, value, bgColor, icon }) => (
  <div className={styles.statCard}>
    <div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
    <div className={styles.statIcon} style={{ backgroundColor: bgColor }}>
      {icon}
    </div>
  </div>
);

const OrderCard = ({ order, onStatusChange }) => {
  const getActionButton = () => {
    if (order.status === 'ordered') {
      return (
        <button className={styles.actionLink} onClick={() => onStatusChange(order.id, 'received')}>
          Mark as Received
        </button>
      );
    }
    if (order.status === 'received') {
      return (
        <button className={styles.actionLink} onClick={() => onStatusChange(order.id, 'stocked')}>
          Mark as Stocked
        </button>
      );
    }
    return null;
  };

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div className={styles.orderIdRow}>
          <span className={styles.orderId}>{order.id}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
      </div>

      <div className={styles.supplier}>
        <span>🏢</span> {order.supplier}
      </div>

      <div className={styles.orderMeta}>
        <div>
          <p className={styles.metaLabel}>Order Date</p>
          <p className={styles.metaValue}>📅 {order.orderDate}</p>
        </div>
        <div>
          <p className={styles.metaLabel}>Expected Delivery</p>
          <p className={styles.metaValue}>🚚 {order.expectedDelivery}</p>
        </div>
        <div>
          <p className={styles.metaLabel}>Items</p>
          <p className={styles.metaValue}>📦 {order.itemCount} items</p>
        </div>
      </div>

      <div className={styles.itemsSection}>
        <p className={styles.itemsSectionTitle}>Order Items:</p>
        {order.items.map((item, idx) => (
          <div key={idx} className={styles.itemRow}>
            <div className={styles.itemInfo}>
              <div className={styles.itemIcon}>✓</div>
              <div>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemQty}>
                  {item.quantity} × ${item.unitPrice.toFixed(2)}
                </div>
              </div>
            </div>
            <span className={styles.itemPrice}>${item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {order.urgent && (
        <div className={styles.urgentBanner}>
          <span>⚠️</span> {order.urgent}
        </div>
      )}

      <div className={styles.actions}>
        {getActionButton()}
        <button className={styles.actionLink}>View Details</button>
      </div>
    </div>
  );
};

function OrdersPage() {
  const [orders, setOrders] = useState(ordersData);
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)),
    );
  };

  const pendingCount = orders.filter(o => o.status === 'ordered').length;
  const awaitingStock = orders.filter(o => o.status === 'received').length;
  const monthlySpend = orders.reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(
    order =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusOrder = { ordered: 0, received: 1, stocked: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const navItems = [
    'Dashboard',
    'Production',
    'Processing',
    'Recipes',
    'Inventory',
    'Orders',
    'Reports',
    'Food Bars',
  ];

  const containerClass = `${styles.container} ${darkMode ? styles.containerDark : ''}`;

  return (
    <div className={containerClass}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>TK</div>
          <div>
            <p className={styles.logoText}>Transition Kitchen</p>
            <p className={styles.logoSubtext}>One Community Global</p>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => (
            <span
              key={item}
              className={`${styles.navLink} ${item === 'Orders' ? styles.navLinkActive : ''}`}
            >
              {item}
            </span>
          ))}
        </nav>
        <button className={styles.darkModeToggle} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Ordering & Procurement</h1>
        <p className={styles.pageSubtitle}>
          Manage purchase orders, supplier relationships, and procurement budget
        </p>

        <div className={styles.statsGrid}>
          <StatCard
            label="Pending Orders"
            value={pendingCount}
            bgColor={darkMode ? '#3d2c00' : '#fff3e0'}
            icon="🕐"
          />
          <StatCard
            label="Awaiting Stock"
            value={awaitingStock}
            bgColor={darkMode ? '#1b4332' : '#e8f5e9'}
            icon="📦"
          />
          <StatCard
            label="Monthly Spend"
            value={`$${monthlySpend.toFixed(2)}`}
            bgColor={darkMode ? '#0d3b66' : '#e3f2fd'}
            icon="💰"
          />
          <StatCard
            label="Surplus Savings"
            value="$306"
            bgColor={darkMode ? '#4a1259' : '#f3e5f5'}
            icon="📈"
          />
        </div>

        <div className={styles.tabs}>
          {[
            { id: 'purchase-orders', label: '📋 Purchase Orders' },
            { id: 'suppliers', label: '🏢 Suppliers' },
            { id: 'surplus', label: '↗️ Surplus Opportunities' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button className={styles.btnPrimary}>+ New Order</button>
          <button className={styles.btnSecondary}>🔄 Auto-Generate from Shortages</button>
        </div>

        {activeTab === 'purchase-orders' && (
          <div>
            {sortedOrders.length > 0 ? (
              sortedOrders.map(order => (
                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))
            ) : (
              <div className={`${styles.orderCard} ${styles.emptyState}`}>
                No orders found matching your search.
              </div>
            )}
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className={`${styles.orderCard} ${styles.emptyState}`}>
            Suppliers section - Coming soon
          </div>
        )}

        {activeTab === 'surplus' && (
          <div className={`${styles.orderCard} ${styles.emptyState}`}>
            Surplus Opportunities section - Coming soon
          </div>
        )}
      </main>
    </div>
  );
}

export default OrdersPage;
