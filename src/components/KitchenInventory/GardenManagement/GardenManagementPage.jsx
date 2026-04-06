import { useState } from 'react';
import styles from './GardenManagementPage.module.css';

const calendarEventsData = {
  seeding: [
    {
      id: 1,
      name: 'Tomatoes',
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      location: 'Indoor',
      status: 'upcoming',
    },
    {
      id: 2,
      name: 'Peppers',
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      location: 'Indoor',
      status: 'upcoming',
    },
    {
      id: 3,
      name: 'Lettuce',
      startDate: '2025-02-15',
      endDate: '2025-03-01',
      location: 'Cold Frame',
      status: 'active',
    },
    {
      id: 4,
      name: 'Carrots',
      startDate: '2025-04-01',
      endDate: '2025-04-15',
      location: 'Garden Bed 1',
      status: 'upcoming',
    },
  ],
  transplanting: [
    {
      id: 1,
      name: 'Tomatoes',
      date: '2025-05-01',
      from: 'Indoor',
      to: 'Garden Pot A',
      status: 'upcoming',
    },
    {
      id: 2,
      name: 'Peppers',
      date: '2025-05-10',
      from: 'Indoor',
      to: 'Garden Pot B',
      status: 'upcoming',
    },
    {
      id: 3,
      name: 'Cabbage',
      date: '2025-04-20',
      from: 'Cold Frame',
      to: 'Garden Bed 2',
      status: 'upcoming',
    },
  ],
  succession: [
    {
      id: 1,
      name: 'Lettuce',
      lastSow: '2025-03-01',
      nextSow: '2025-03-15',
      interval: 'Every 14 days',
      status: 'active',
    },
    {
      id: 2,
      name: 'Radishes',
      lastSow: '2025-03-10',
      nextSow: '2025-03-24',
      interval: 'Every 14 days',
      status: 'active',
    },
    {
      id: 3,
      name: 'Beans',
      lastSow: '2025-05-01',
      nextSow: '2025-05-15',
      interval: 'Every 14 days',
      status: 'upcoming',
    },
  ],
  harvesting: [
    { id: 1, name: 'Tomatoes', expected: '2025-07-15', yield: '80 lbs', status: 'growing' },
    { id: 2, name: 'Carrots', expected: '2025-06-01', yield: '50 lbs', status: 'growing' },
    { id: 3, name: 'Lettuce', expected: '2025-04-20', yield: '30 lbs', status: 'growing' },
    { id: 4, name: 'Basil', expected: '2025-06-10', yield: '15 lbs', status: 'growing' },
  ],
};

const seedInventoryData = [
  {
    id: 1,
    name: 'Tomato Seeds (Heirloom)',
    collectedDate: '2024-09-15',
    quantity: 250,
    viable: 95,
  },
  { id: 2, name: 'Carrot Seeds', collectedDate: '2024-08-20', quantity: 180, viable: 88 },
  { id: 3, name: 'Lettuce Seeds', collectedDate: '2024-07-10', quantity: 320, viable: 92 },
  { id: 4, name: 'Basil Seeds', collectedDate: '2024-09-01', quantity: 150, viable: 90 },
];

const seedOrdersData = [
  {
    id: 'ORD-001',
    supplier: 'GreenThumb Seeds Co.',
    items: [
      { name: 'Heirloom Tomato Seeds', qty: 5, unit: 'packets' },
      { name: 'Basil Seeds', qty: 3, unit: 'packets' },
    ],
    orderDate: '2025-02-10',
    deliveryDate: '2025-02-20',
    status: 'pending',
  },
  {
    id: 'ORD-002',
    supplier: "Nature's Best Nursery",
    items: [
      { name: 'Carrot Seeds', qty: 10, unit: 'packets' },
      { name: 'Lettuce Seeds', qty: 6, unit: 'packets' },
    ],
    orderDate: '2025-02-15',
    deliveryDate: '2025-02-25',
    status: 'received',
  },
  {
    id: 'ORD-003',
    supplier: 'Organic Farm Supply',
    items: [{ name: 'Pepper Seeds', qty: 4, unit: 'packets' }],
    orderDate: '2025-02-18',
    deliveryDate: '2025-03-01',
    status: 'pending',
  },
];

const onlineToolsData = [
  {
    id: 1,
    name: 'Gardenate',
    description: 'Plan your vegetable garden with a planting calendar tailored to your climate.',
    features: ['Planting calendar', 'Climate-based suggestions', 'Monthly reminders'],
    url: 'https://www.gardenate.com',
    icon: '🌱',
  },
  {
    id: 2,
    name: "Old Farmer's Almanac Garden Planner",
    description: 'Drag-and-drop garden layout tool with companion planting suggestions.',
    features: ['Garden layout designer', 'Companion planting', 'Frost date calculator'],
    url: 'https://www.almanac.com/garden/planner',
    icon: '📅',
  },
  {
    id: 3,
    name: 'SeedSavers Exchange',
    description: 'Find and exchange rare and heirloom seeds from a global community.',
    features: ['Seed library', 'Heirloom varieties', 'Community exchange'],
    url: 'https://www.seedsavers.org',
    icon: '🫘',
  },
  {
    id: 4,
    name: "Dave's Garden",
    description: 'Comprehensive plant database and gardening community forum.',
    features: ['Plant database', 'Gardening forum', 'Plant reviews'],
    url: 'https://davesgarden.com',
    icon: '🌿',
  },
];

const StatCard = ({ label, value, icon, bgColor }) => (
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

const CalendarEventCard = ({ event, type }) => {
  const getStatusClass = status => {
    if (status === 'active') return styles.statusActive;
    if (status === 'upcoming') return styles.statusUpcoming;
    if (status === 'growing') return styles.statusGrowing;
    return '';
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <span className={styles.eventName}>{event.name}</span>
        <span className={`${styles.statusBadge} ${getStatusClass(event.status)}`}>
          {event.status}
        </span>
      </div>
      {type === 'seeding' && (
        <div className={styles.eventDetails}>
          <p>
            Start: {event.startDate} - End: {event.endDate}
          </p>
          <p>Location: {event.location}</p>
        </div>
      )}
      {type === 'transplanting' && (
        <div className={styles.eventDetails}>
          <p>Date: {event.date}</p>
          <p>
            Move: {event.from} → {event.to}
          </p>
        </div>
      )}
      {type === 'succession' && (
        <div className={styles.eventDetails}>
          <p>Last sow: {event.lastSow}</p>
          <p>
            Next sow: {event.nextSow} ({event.interval})
          </p>
        </div>
      )}
      {type === 'harvesting' && (
        <div className={styles.eventDetails}>
          <p>Expected: {event.expected}</p>
          <p>Yield: {event.yield}</p>
        </div>
      )}
    </div>
  );
};

const CalendarSection = ({ title, events, type, icon }) => {
  const getButtonText = () => {
    switch (type) {
      case 'seeding':
        return '+ Add Seeding';
      case 'transplanting':
        return '+ Schedule Transplant';
      case 'succession':
        return '+ Add Succession Plan';
      case 'harvesting':
        return '+ Log Harvest';
      default:
        return '+ Add Event';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'seeding':
        return 'Upcoming seed starting schedule';
      case 'transplanting':
        return 'Scheduled transplant dates';
      case 'succession':
        return 'Continuous planting schedule';
      case 'harvesting':
        return 'Expected harvest dates and yields';
      default:
        return '';
    }
  };

  return (
    <div className={styles.calendarCard}>
      <div className={styles.calendarHeader}>
        <h3 className={styles.calendarTitle}>
          <span>{icon}</span> {title}
        </h3>
        <button className={styles.addButton} onClick={() => console.log(`Adding ${type} event`)}>
          {getButtonText()}
        </button>
      </div>
      <p className={styles.calendarSubtitle}>{getSubtitle()}</p>
      <div className={styles.eventsContainer}>
        {events.map(event => (
          <CalendarEventCard key={event.id} event={event} type={type} />
        ))}
      </div>
    </div>
  );
};

const SeedInventoryCard = ({ seed }) => (
  <div className={styles.seedCard}>
    <div className={styles.seedIcon}>🌱</div>
    <div className={styles.seedInfo}>
      <div className={styles.seedName}>{seed.name}</div>
      <div className={styles.seedDate}>Collected: {seed.collectedDate}</div>
    </div>
    <div className={styles.seedStats}>
      <div className={styles.seedQuantity}>{seed.quantity} seeds</div>
      <div className={styles.viabilityBadge}>{seed.viable}% viable</div>
    </div>
  </div>
);

const SeedOrderCard = ({ order }) => {
  const getStatusClass = status =>
    status === 'pending' ? styles.statusPending : styles.statusReceived;

  const getStatusLabel = status => (status === 'pending' ? '⏳ Pending' : '✅ Received');

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div>
          <span className={styles.orderId}>{order.id}</span>
          <span className={styles.orderSupplier}>{order.supplier}</span>
        </div>
        <span className={`${styles.orderStatusBadge} ${getStatusClass(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>
      <div className={styles.orderItems}>
        {order.items.map((item, idx) => (
          <span key={idx} className={styles.orderItemTag}>
            {item.name} × {item.qty} {item.unit}
          </span>
        ))}
      </div>
      <div className={styles.orderDates}>
        <span>📦 Ordered: {order.orderDate}</span>
        <span>🚚 Delivery: {order.deliveryDate}</span>
      </div>
      <div className={styles.orderActions}>
        <button className={styles.viewDetailsBtn}>View Details</button>
        {order.status === 'pending' && (
          <button
            className={styles.markReceivedBtn}
            onClick={() => console.log(`Marked ${order.id} as received`)}
          >
            Mark as Received
          </button>
        )}
      </div>
    </div>
  );
};

const OnlineToolCard = ({ tool }) => (
  <div className={styles.toolCard}>
    <div className={styles.toolIcon}>{tool.icon}</div>
    <div className={styles.toolInfo}>
      <h3 className={styles.toolName}>{tool.name}</h3>
      <p className={styles.toolDescription}>{tool.description}</p>
      <ul className={styles.toolFeatures}>
        {tool.features.map((f, idx) => (
          <li key={idx}>✓ {f}</li>
        ))}
      </ul>
    </div>
    <a href={tool.url} target="_blank" rel="noopener noreferrer" className={styles.toolLink}>
      Visit Tool →
    </a>
  </div>
);

function GardenManagementPage() {
  const [activeTab, setActiveTab] = useState('calendars');
  const [darkMode, setDarkMode] = useState(false);

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
          {[
            'Dashboard',
            'Production',
            'Processing',
            'Recipes',
            'Inventory',
            'Orders',
            'Reports',
            'Food Bars',
          ].map(item => (
            <span key={item} className={styles.navLink}>
              {item}
            </span>
          ))}
        </nav>
        <button className={styles.darkModeToggle} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Garden Management</h1>
        <p className={styles.pageSubtitle}>
          Manage seeds, plan seasonal calendars, and track garden productivity
        </p>

        {/* Summary Cards */}
        <div className={styles.statsGrid}>
          <StatCard
            label="Seed Varieties"
            value={seedInventoryData.length}
            icon="🌱"
            bgColor="#e8f5e9"
          />
          <StatCard label="Active Plantings" value="12" icon="🌿" bgColor="#f1f8e9" />
          <StatCard label="Upcoming Harvests" value="4" icon="🌾" bgColor="#fff3e0" />
          <StatCard
            label="Seed Orders"
            value={seedOrdersData.filter(o => o.status === 'pending').length}
            icon="🛒"
            bgColor="#e3f2fd"
          />
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { id: 'calendars', label: 'Calendars' },
            { id: 'seed-inventory', label: 'Seed Inventory' },
            { id: 'seed-orders', label: 'Seed Orders' },
            { id: 'online-tools', label: 'Online Tools' },
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

        {/* Calendars Section */}
        {activeTab === 'calendars' && (
          <div className={styles.calendarsGrid}>
            <CalendarSection
              title="Seeding Calendar"
              events={calendarEventsData.seeding}
              type="seeding"
              icon="🌱"
            />
            <CalendarSection
              title="Transplanting Calendar"
              events={calendarEventsData.transplanting}
              type="transplanting"
              icon="📋"
            />
            <CalendarSection
              title="Succession Calendar"
              events={calendarEventsData.succession}
              type="succession"
              icon="🕐"
            />
            <CalendarSection
              title="Harvesting Calendar"
              events={calendarEventsData.harvesting}
              type="harvesting"
              icon="🌾"
            />
          </div>
        )}

        {/* Seed Inventory Section */}
        {activeTab === 'seed-inventory' && (
          <div className={styles.seedInventorySection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Seed Collection</h2>
                <p className={styles.sectionSubtitle}>
                  Seeds collected from the garden for next season
                </p>
              </div>
              <button className={styles.addSeedsButton} onClick={() => console.log('Add seeds')}>
                + Add Seeds
              </button>
            </div>
            <div className={styles.seedsList}>
              {seedInventoryData.map(seed => (
                <SeedInventoryCard key={seed.id} seed={seed} />
              ))}
            </div>
          </div>
        )}

        {/* Seed Orders Section */}
        {activeTab === 'seed-orders' && (
          <div className={styles.seedOrdersSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Seed Orders</h2>
                <p className={styles.sectionSubtitle}>Recent seed orders and delivery status</p>
              </div>
              <button className={styles.addSeedsButton} onClick={() => console.log('New order')}>
                + New Order
              </button>
            </div>
            <h3 className={styles.orderGroupTitle}>⏳ Pending Orders</h3>
            <div className={styles.ordersList}>
              {seedOrdersData
                .filter(o => o.status === 'pending')
                .map(order => (
                  <SeedOrderCard key={order.id} order={order} />
                ))}
            </div>
            <h3 className={styles.orderGroupTitle}>✅ Received Orders</h3>
            <div className={styles.ordersList}>
              {seedOrdersData
                .filter(o => o.status === 'received')
                .map(order => (
                  <SeedOrderCard key={order.id} order={order} />
                ))}
            </div>
          </div>
        )}

        {/* Online Tools Section */}
        {activeTab === 'online-tools' && (
          <div className={styles.onlineToolsSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Online Garden Tools</h2>
                <p className={styles.sectionSubtitle}>Helpful external tools for garden planning</p>
              </div>
            </div>
            <div className={styles.toolsGrid}>
              {onlineToolsData.map(tool => (
                <OnlineToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default GardenManagementPage;
