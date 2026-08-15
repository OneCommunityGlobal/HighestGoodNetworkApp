import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from './GardenManagementPage.module.css';

import {
  getSeedInventory,
  getSeedOrders,
  getGardenCalendar,
  createSeedInventory,
  deleteSeedInventory,
  createSeedOrder,
  updateSeedOrderStatus,
  createGardenCalendarEvent,
  updateGardenCalendarEventStatus,
  deleteGardenCalendarEvent,
} from './gardenManagementApi';

/* =========================================================
 * Constants
 * ======================================================= */

const CALENDAR_TYPES = {
  seeding: {
    label: 'Seeding Calendar',
    subtitle: 'Upcoming seed starting schedule',
    icon: '🌱',
    addLabel: 'Add Seeding',
  },
  transplanting: {
    label: 'Transplanting Calendar',
    subtitle: 'Scheduled transplant dates',
    icon: '📅',
    addLabel: 'Schedule Transplant',
  },
  succession: {
    label: 'Succession Calendar',
    subtitle: 'Continuous planting schedule',
    icon: '🔄',
    addLabel: 'Add Succession Plan',
  },
  harvesting: {
    label: 'Harvesting Calendar',
    subtitle: 'Expected harvest dates and yields',
    icon: '🍃',
    addLabel: 'Log Harvest',
  },
};

const CALENDAR_STATUSES = ['upcoming', 'active', 'growing', 'completed'];

const ONLINE_TOOLS = [
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
    name: "Old Farmer's Almanac",
    description: 'Plan garden layouts and find helpful planting information.',
    features: ['Garden planner', 'Companion planting', 'Frost date calculator'],
    url: 'https://www.almanac.com/garden/planner',
    icon: '📅',
  },
  {
    id: 3,
    name: 'Seed Savers Exchange',
    description: 'Explore rare and heirloom seeds from a gardening community.',
    features: ['Seed library', 'Heirloom varieties', 'Community exchange'],
    url: 'https://www.seedsavers.org',
    icon: '🫘',
  },
  {
    id: 4,
    name: "Dave's Garden",
    description: 'Plant database and gardening community resources.',
    features: ['Plant database', 'Gardening forum', 'Plant reviews'],
    url: 'https://davesgarden.com',
    icon: '🌿',
  },
];

/* =========================================================
 * Helpers
 * ======================================================= */

const getId = item => item?._id || item?.id;

const formatDate = value => {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const normalizeResponse = response => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

const getStatusLabel = status => {
  if (!status) {
    return 'Pending';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusClass = (status, stylesObject) => {
  switch (status) {
    case 'active':
      return stylesObject.statusActive;

    case 'growing':
      return stylesObject.statusGrowing;

    case 'completed':
    case 'received':
      return stylesObject.statusCompleted;

    case 'cancelled':
      return stylesObject.statusCancelled;

    case 'upcoming':
    case 'pending':
    default:
      return stylesObject.statusUpcoming;
  }
};

/* =========================================================
 * Modal
 * ======================================================= */

const Modal = ({ title, subtitle, children, onClose, submitting }) => (
  <div className={styles.modalOverlay}>
    <div
      className={styles.modal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="garden-modal-title"
    >
      <div className={styles.modalHeader}>
        <div>
          <h2 id="garden-modal-title" className={styles.modalTitle}>
            {title}
          </h2>

          {subtitle && <p className={styles.modalSubtitle}>{subtitle}</p>}
        </div>

        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          disabled={submitting}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      {children}
    </div>
  </div>
);

/* =========================================================
 * Calendar Event
 * ======================================================= */

const CalendarEvent = ({ event, type, onComplete, onDelete }) => {
  const eventId = getId(event);
  const isCompleted = event.status === 'completed';

  return (
    <div className={styles.calendarEvent}>
      <div className={styles.eventMain}>
        <div className={styles.eventName}>{event.name || 'Unnamed Event'}</div>

        {type === 'seeding' && (
          <div className={styles.eventDetails}>
            {event.startDate && <span>Start: {formatDate(event.startDate)}</span>}

            {event.endDate && <span>End: {formatDate(event.endDate)}</span>}

            {event.location && <span>Location: {event.location}</span>}
          </div>
        )}

        {type === 'transplanting' && (
          <div className={styles.eventDetails}>
            {(event.date || event.startDate) && (
              <span>Date: {formatDate(event.date || event.startDate)}</span>
            )}

            {(event.from || event.to) && (
              <span>
                Move: {event.from || '—'} → {event.to || '—'}
              </span>
            )}

            {event.location && <span>Location: {event.location}</span>}
          </div>
        )}

        {type === 'succession' && (
          <div className={styles.eventDetails}>
            {event.lastSow && <span>Last sow: {formatDate(event.lastSow)}</span>}

            {event.nextSow && <span>Next sow: {formatDate(event.nextSow)}</span>}

            {event.interval && <span>Interval: {event.interval}</span>}
          </div>
        )}

        {type === 'harvesting' && (
          <div className={styles.eventDetails}>
            {event.expected && <span>Expected: {formatDate(event.expected)}</span>}

            {event.yield && <span>Yield: {event.yield}</span>}
          </div>
        )}
      </div>

      <div className={styles.eventRight}>
        <span className={`${styles.statusBadge} ${getStatusClass(event.status, styles)}`}>
          {getStatusLabel(event.status)}
        </span>

        <div className={styles.eventActions}>
          {!isCompleted && (
            <button
              type="button"
              className={styles.smallActionButton}
              onClick={() => onComplete(event)}
              disabled={!eventId}
            >
              Complete
            </button>
          )}

          <button
            type="button"
            className={styles.deleteSmallButton}
            onClick={() => onDelete(event)}
            disabled={!eventId}
            aria-label={`Delete ${event.name || 'event'}`}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
 * Calendar Card
 * ======================================================= */

const CalendarCard = ({ type, events, onAdd, onComplete, onDelete }) => {
  const config = CALENDAR_TYPES[type];

  return (
    <section className={styles.calendarCard}>
      <div className={styles.calendarCardHeader}>
        <div className={styles.calendarHeading}>
          <div className={`${styles.calendarIcon} ${styles[`calendarIcon_${type}`] || ''}`}>
            {config.icon}
          </div>

          <div>
            <h2 className={styles.calendarTitle}>{config.label}</h2>

            <p className={styles.calendarSubtitle}>{config.subtitle}</p>
          </div>
        </div>
      </div>

      <div className={styles.calendarEvents}>
        {events.length === 0 ? (
          <div className={styles.emptyEvents}>
            <span>{config.icon}</span>
            <p>No events scheduled yet.</p>
          </div>
        ) : (
          events.map((event, index) => (
            <CalendarEvent
              key={getId(event) || `${type}-${index}`}
              event={event}
              type={type}
              onComplete={onComplete}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <button type="button" className={styles.calendarAddButton} onClick={() => onAdd(type)}>
        <span>+</span>
        {config.addLabel}
      </button>
    </section>
  );
};

/* =========================================================
 * Seed Inventory Card
 * ======================================================= */

const SeedCard = ({ seed, onDelete }) => {
  const seedId = getId(seed);

  return (
    <div className={styles.seedCard}>
      <div className={styles.seedCardIcon}>🌱</div>

      <div className={styles.seedCardInfo}>
        <h3>{seed.name || 'Unnamed Seed'}</h3>

        <p>Collected: {formatDate(seed.collectedDate)}</p>
      </div>

      <div className={styles.seedCardStats}>
        <div>
          <span>Quantity</span>
          <strong>{seed.quantity ?? 0}</strong>
        </div>

        <div>
          <span>Viability</span>
          <strong>{seed.viable ?? 0}%</strong>
        </div>
      </div>

      <button
        type="button"
        className={styles.deleteButton}
        onClick={() => onDelete(seed)}
        disabled={!seedId}
      >
        Delete
      </button>
    </div>
  );
};

/* =========================================================
 * Order Card
 * ======================================================= */

const OrderCard = ({ order, onMarkReceived, onCancel }) => {
  const status = order.status || 'pending';
  const isPending = status === 'pending';
  const isReceived = status === 'received';
  const isCancelled = status === 'cancelled';

  return (
    <article className={`${styles.orderCard} ${isCancelled ? styles.cancelled : ''}`}>
      <div className={styles.orderTop}>
        <div className={styles.orderHeading}>
          <div className={styles.orderIcon}>📦</div>

          <div>
            <h3>{order.orderId || 'Order'}</h3>

            <p>{order.supplier || 'Supplier not specified'}</p>
          </div>
        </div>

        <div className={styles.orderStatus}>
          <span
            className={`${styles.orderStatusBadge} ${isPending ? styles.orderStatusPending : ''} ${
              isReceived ? styles.orderStatusReceived : ''
            } ${isCancelled ? styles.orderStatusCancelled : ''}`}
          >
            {isPending && '● '}
            {isReceived && '✓ '}
            {isCancelled && '× '}
            {getStatusLabel(status)}
          </span>
        </div>
      </div>

      <div className={styles.orderItems}>
        {Array.isArray(order.items) && order.items.length > 0 ? (
          order.items.map((item, index) => (
            <div
              key={`${getId(order) || order.orderId || 'order'}-${index}`}
              className={styles.orderItem}
            >
              <strong>
                {item.qty ?? 0} {item.unit || ''}
              </strong>
            </div>
          ))
        ) : (
          <div className={styles.orderItem}>
            <span>No items</span>
          </div>
        )}
      </div>

      <div className={styles.orderDates}>
        <span>Ordered: {formatDate(order.orderDate)}</span>

        {order.deliveryDate && <span>Delivery: {formatDate(order.deliveryDate)}</span>}
      </div>

      {isPending && (
        <div className={styles.orderActions}>
          <button
            type="button"
            className={styles.receiveButton}
            onClick={() => onMarkReceived(order)}
          >
            ✓ Mark as Received
          </button>

          <button
            type="button"
            className={styles.cancelOrderButton}
            onClick={() => onCancel(order)}
          >
            Cancel Order
          </button>
        </div>
      )}

      {isReceived && (
        <div className={styles.orderFooter}>
          <span className={styles.orderFooterInfo}>✓ This order has been received.</span>
        </div>
      )}

      {isCancelled && (
        <div className={styles.orderFooter}>
          <span className={styles.cancelledOrderMessage}>× This order was cancelled.</span>
        </div>
      )}
    </article>
  );
};

/* =========================================================
 * Online Tool Card
 * ======================================================= */

const OnlineToolCard = ({ tool }) => (
  <div className={styles.toolCard}>
    <div className={styles.toolIcon}>{tool.icon}</div>

    <div className={styles.toolContent}>
      <h3>{tool.name}</h3>

      <p>{tool.description}</p>

      <ul>
        {tool.features.map(feature => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>
    </div>

    <a href={tool.url} target="_blank" rel="noopener noreferrer" className={styles.toolLink}>
      Visit Tool →
    </a>
  </div>
);

/* =========================================================
 * Main Component
 * ======================================================= */

function GardenManagementPage() {
  const [activeTab, setActiveTab] = useState('calendars');

  const [calendarEvents, setCalendarEvents] = useState([]);

  const [seedInventory, setSeedInventory] = useState([]);

  const [seedOrders, setSeedOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [modalType, setModalType] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState('');

  const [calendarForm, setCalendarForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    date: '',
    from: '',
    to: '',
    lastSow: '',
    nextSow: '',
    interval: '',
    expected: '',
    yield: '',
    status: 'upcoming',
  });

  const [seedForm, setSeedForm] = useState({
    name: '',
    collectedDate: '',
    quantity: '',
    viable: '100',
  });

  const [orderForm, setOrderForm] = useState({
    orderId: '',
    supplier: '',
    itemName: '',
    quantity: '',
    unit: 'packets',
    orderDate: '',
    deliveryDate: '',
  });

  const darkMode = useSelector(state => state.theme?.darkMode ?? false);

  const containerClass = `${styles.container} ${darkMode ? styles.containerDark : ''}`;

  /* =======================================================
   * Load Data
   * ======================================================= */

  const loadGardenData = async () => {
    try {
      setLoading(true);
      setError('');

      const [calendarData, inventoryData, ordersData] = await Promise.all([
        getGardenCalendar(),
        getSeedInventory(),
        getSeedOrders(),
      ]);

      setCalendarEvents(normalizeResponse(calendarData));

      setSeedInventory(normalizeResponse(inventoryData));

      setSeedOrders(normalizeResponse(ordersData));
    } catch (err) {
      console.error('Failed to load garden data:', err);

      setError(err?.response?.data?.message || 'Unable to load garden management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGardenData();
  }, []);

  /* =======================================================
   * Derived Data
   * ======================================================= */

  const eventsByType = useMemo(
    () => ({
      seeding: calendarEvents.filter(event => event.type === 'seeding'),

      transplanting: calendarEvents.filter(event => event.type === 'transplanting'),

      succession: calendarEvents.filter(event => event.type === 'succession'),

      harvesting: calendarEvents.filter(event => event.type === 'harvesting'),
    }),
    [calendarEvents],
  );

  const pendingOrders = useMemo(() => seedOrders.filter(order => order.status === 'pending'), [
    seedOrders,
  ]);

  const receivedOrders = useMemo(() => seedOrders.filter(order => order.status === 'received'), [
    seedOrders,
  ]);

  const cancelledOrders = useMemo(() => seedOrders.filter(order => order.status === 'cancelled'), [
    seedOrders,
  ]);

  /* =======================================================
   * Modal Helpers
   * ======================================================= */

  const resetAllForms = () => {
    setCalendarForm({
      name: '',
      startDate: '',
      endDate: '',
      location: '',
      date: '',
      from: '',
      to: '',
      lastSow: '',
      nextSow: '',
      interval: '',
      expected: '',
      yield: '',
      status: 'upcoming',
    });

    setSeedForm({
      name: '',
      collectedDate: '',
      quantity: '',
      viable: '100',
    });

    setOrderForm({
      orderId: '',
      supplier: '',
      itemName: '',
      quantity: '',
      unit: 'packets',
      orderDate: '',
      deliveryDate: '',
    });
  };

  const openModal = type => {
    resetAllForms();
    setFormError('');
    setModalType(type);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModalType(null);
    setFormError('');
    resetAllForms();
  };

  /* =======================================================
   * Calendar
   * ======================================================= */

  const handleCalendarChange = event => {
    const { name, value } = event.target;

    setCalendarForm(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCalendarSubmit = async event => {
    event.preventDefault();
    setFormError('');

    if (!calendarForm.name.trim()) {
      setFormError('Event name is required.');
      return;
    }

    if (
      modalType !== 'seeding' &&
      modalType !== 'transplanting' &&
      modalType !== 'succession' &&
      modalType !== 'harvesting'
    ) {
      setFormError('Invalid calendar type.');
      return;
    }

    const payload = {
      name: calendarForm.name.trim(),
      type: modalType,
      status: calendarForm.status,
    };

    if (modalType === 'seeding') {
      if (!calendarForm.startDate) {
        setFormError('Start date is required.');
        return;
      }

      if (calendarForm.endDate && calendarForm.endDate < calendarForm.startDate) {
        setFormError('End date cannot be before the start date.');
        return;
      }

      payload.startDate = calendarForm.startDate;

      if (calendarForm.endDate) {
        payload.endDate = calendarForm.endDate;
      }

      if (calendarForm.location.trim()) {
        payload.location = calendarForm.location.trim();
      }
    }

    if (modalType === 'transplanting') {
      if (!calendarForm.date) {
        setFormError('Transplant date is required.');
        return;
      }

      payload.date = calendarForm.date;

      if (calendarForm.from.trim()) {
        payload.from = calendarForm.from.trim();
      }

      if (calendarForm.to.trim()) {
        payload.to = calendarForm.to.trim();
      }

      if (calendarForm.location.trim()) {
        payload.location = calendarForm.location.trim();
      }
    }

    if (modalType === 'succession') {
      if (!calendarForm.lastSow) {
        setFormError('Last sow date is required.');
        return;
      }

      if (calendarForm.nextSow && calendarForm.nextSow < calendarForm.lastSow) {
        setFormError('Next sow date cannot be before the last sow date.');
        return;
      }

      payload.lastSow = calendarForm.lastSow;

      if (calendarForm.nextSow) {
        payload.nextSow = calendarForm.nextSow;
      }

      if (calendarForm.interval.trim()) {
        payload.interval = calendarForm.interval.trim();
      }
    }

    if (modalType === 'harvesting') {
      if (!calendarForm.expected) {
        setFormError('Expected harvest date is required.');
        return;
      }

      payload.expected = calendarForm.expected;

      if (calendarForm.yield.trim()) {
        payload.yield = calendarForm.yield.trim();
      }
    }

    try {
      setSubmitting(true);

      await createGardenCalendarEvent(payload);

      setModalType(null);
      resetAllForms();

      await loadGardenData();
    } catch (err) {
      console.error('Failed to create calendar event:', err);

      setFormError(err?.response?.data?.message || 'Failed to create calendar event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalendarComplete = async event => {
    const eventId = getId(event);

    if (!eventId) {
      window.alert('Unable to update this event because its ID is missing.');
      return;
    }

    try {
      await updateGardenCalendarEventStatus(eventId, 'completed');

      await loadGardenData();
    } catch (err) {
      console.error('Failed to update calendar event:', err);

      window.alert(err?.response?.data?.message || 'Failed to update event.');
    }
  };

  const handleDeleteCalendarEvent = async event => {
    const eventId = getId(event);

    if (!eventId) {
      window.alert('Unable to delete this event because its ID is missing.');
      return;
    }

    const confirmed = window.confirm(`Delete "${event.name || 'this event'}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteGardenCalendarEvent(eventId);

      await loadGardenData();
    } catch (err) {
      console.error('Failed to delete calendar event:', err);

      window.alert(err?.response?.data?.message || 'Failed to delete event.');
    }
  };

  /* =======================================================
   * Seed Inventory
   * ======================================================= */

  const handleSeedChange = event => {
    const { name, value } = event.target;

    setSeedForm(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSeedSubmit = async event => {
    event.preventDefault();
    setFormError('');

    const quantity = Number(seedForm.quantity);
    const viable = Number(seedForm.viable);

    if (!seedForm.name.trim()) {
      setFormError('Seed name is required.');
      return;
    }

    if (!seedForm.collectedDate) {
      setFormError('Collected date is required.');
      return;
    }

    if (seedForm.quantity === '' || Number.isNaN(quantity) || quantity < 0) {
      setFormError('Quantity must be a non-negative number.');
      return;
    }

    if (Number.isNaN(viable) || viable < 0 || viable > 100) {
      setFormError('Viability must be between 0 and 100.');
      return;
    }

    try {
      setSubmitting(true);

      await createSeedInventory({
        name: seedForm.name.trim(),
        collectedDate: seedForm.collectedDate,
        quantity,
        viable,
      });

      setModalType(null);
      resetAllForms();

      await loadGardenData();
    } catch (err) {
      console.error('Failed to add seed inventory:', err);

      setFormError(err?.response?.data?.message || 'Failed to add seed inventory.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSeed = async seed => {
    const seedId = getId(seed);

    if (!seedId) {
      window.alert('Unable to delete this seed because its ID is missing.');
      return;
    }

    const confirmed = window.confirm(`Delete "${seed.name || 'this seed'}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteSeedInventory(seedId);

      await loadGardenData();
    } catch (err) {
      console.error('Failed to delete seed:', err);

      window.alert(err?.response?.data?.message || 'Failed to delete seed.');
    }
  };

  /* =======================================================
   * Seed Orders
   * ======================================================= */

  const handleOrderChange = event => {
    const { name, value } = event.target;

    setOrderForm(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleOrderSubmit = async event => {
    event.preventDefault();
    setFormError('');

    const quantity = Number(orderForm.quantity);

    if (!orderForm.orderId.trim()) {
      setFormError('Order ID is required.');
      return;
    }

    if (!orderForm.supplier.trim()) {
      setFormError('Supplier is required.');
      return;
    }

    if (!orderForm.itemName.trim()) {
      setFormError('Seed name is required.');
      return;
    }

    if (orderForm.quantity === '' || Number.isNaN(quantity) || quantity < 1) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    if (!orderForm.orderDate) {
      setFormError('Order date is required.');
      return;
    }

    if (orderForm.deliveryDate && orderForm.deliveryDate < orderForm.orderDate) {
      setFormError('Delivery date cannot be before the order date.');
      return;
    }

    const payload = {
      orderId: orderForm.orderId.trim(),
      supplier: orderForm.supplier.trim(),
      items: [
        {
          name: orderForm.itemName.trim(),
          qty: quantity,
          unit: orderForm.unit.trim() || 'packets',
        },
      ],
      orderDate: orderForm.orderDate,
      status: 'pending',
    };

    if (orderForm.deliveryDate) {
      payload.deliveryDate = orderForm.deliveryDate;
    }

    try {
      setSubmitting(true);

      await createSeedOrder(payload);

      setModalType(null);
      resetAllForms();

      await loadGardenData();
    } catch (err) {
      console.error('Failed to create seed order:', err);

      setFormError(err?.response?.data?.message || 'Failed to create seed order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReceived = async order => {
    const orderId = getId(order);

    if (!orderId) {
      window.alert('Unable to update this order because its ID is missing.');
      return;
    }

    const confirmed = window.confirm(`Mark ${order.orderId || 'this order'} as received?`);

    if (!confirmed) {
      return;
    }

    try {
      await updateSeedOrderStatus(orderId, 'received');

      await loadGardenData();
    } catch (err) {
      console.error('Failed to update order:', err);

      window.alert(err?.response?.data?.message || 'Failed to update order.');
    }
  };

  const handleCancelOrder = async order => {
    const orderId = getId(order);

    if (!orderId) {
      window.alert('Unable to cancel this order because its ID is missing.');
      return;
    }

    const confirmed = window.confirm(`Cancel ${order.orderId || 'this order'}?`);

    if (!confirmed) {
      return;
    }

    try {
      await updateSeedOrderStatus(orderId, 'cancelled');

      await loadGardenData();
    } catch (err) {
      console.error('Failed to cancel order:', err);

      window.alert(err?.response?.data?.message || 'Failed to cancel order.');
    }
  };

  /* =======================================================
   * Loading
   * ======================================================= */

  if (loading) {
    return (
      <div className={containerClass}>
        <main className={styles.main}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner} />

            <h2>Loading Garden Management</h2>

            <p>Fetching your garden data...</p>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
   * Error
   * ======================================================= */

  if (error) {
    return (
      <div className={containerClass}>
        <main className={styles.main}>
          <div className={styles.errorCard}>
            <span>⚠️</span>

            <h2>Unable to load garden data</h2>

            <p>{error}</p>

            <button type="button" className={styles.primaryButton} onClick={loadGardenData}>
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
   * Render
   * ======================================================= */

  return (
    <div className={containerClass}>
      <main className={styles.main}>
        {/* Page Header */}

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Garden Management</h1>

            <p className={styles.pageSubtitle}>
              Manage seeds, plan seasonal calendars, and track garden productivity.
            </p>
          </div>
        </div>

        {/* Tabs */}

        <div className={styles.tabs} role="tablist" aria-label="Garden management sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'calendars'}
            className={`${styles.tab} ${activeTab === 'calendars' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('calendars')}
          >
            Calendars
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inventory'}
            className={`${styles.tab} ${activeTab === 'inventory' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Seed Inventory
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Seed Orders
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tools'}
            className={`${styles.tab} ${activeTab === 'tools' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            Online Tools
          </button>
        </div>

        {/* Calendars */}

        {activeTab === 'calendars' && (
          <div className={styles.calendarGrid}>
            {Object.keys(CALENDAR_TYPES).map(type => (
              <CalendarCard
                key={type}
                type={type}
                events={eventsByType[type]}
                onAdd={openModal}
                onComplete={handleCalendarComplete}
                onDelete={handleDeleteCalendarEvent}
              />
            ))}
          </div>
        )}

        {/* Inventory */}

        {activeTab === 'inventory' && (
          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Seed Inventory</h2>

                <p className={styles.sectionSubtitle}>
                  Seeds collected and stored for future planting.
                </p>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => openModal('seed')}
              >
                + Add Seeds
              </button>
            </div>

            <div className={styles.seedList}>
              {seedInventory.length === 0 ? (
                <div className={styles.emptyState}>
                  <span>🌱</span>

                  <h3>No seed inventory</h3>

                  <p>Add your first seed variety to get started.</p>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => openModal('seed')}
                  >
                    Add First Seed
                  </button>
                </div>
              ) : (
                seedInventory.map((seed, index) => (
                  <SeedCard
                    key={getId(seed) || `seed-${index}`}
                    seed={seed}
                    onDelete={handleDeleteSeed}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* Orders */}

        {activeTab === 'orders' && (
          <section className={`${styles.contentSection} ${styles.ordersSection}`}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Seed Orders</h2>

                <p className={styles.sectionSubtitle}>Track seed purchases and delivery status.</p>
              </div>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => openModal('order')}
              >
                + New Order
              </button>
            </div>

            {/* Pending Orders */}

            <div className={`${styles.orderGroup} ${styles.pendingOrderGroup}`}>
              <div className={styles.orderGroupHeader}>
                <div>
                  <h3 className={styles.groupTitle}>Pending Orders</h3>

                  <p className={styles.orderGroupDescription}>
                    Orders waiting to be received or cancelled.
                  </p>
                </div>
              </div>

              <div className={styles.orderList}>
                {pendingOrders.length === 0 ? (
                  <div className={styles.emptyStateSmall}>
                    <span>📦</span>

                    <p>No pending orders.</p>
                  </div>
                ) : (
                  pendingOrders.map((order, index) => (
                    <OrderCard
                      key={getId(order) || order.orderId || `pending-order-${index}`}
                      order={order}
                      onMarkReceived={handleMarkReceived}
                      onCancel={handleCancelOrder}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Received Orders */}

            <div className={`${styles.orderGroup} ${styles.receivedOrderGroup}`}>
              <div className={styles.orderGroupHeader}>
                <div>
                  <h3 className={styles.groupTitle}>Received Orders</h3>

                  <p className={styles.orderGroupDescription}>Orders that have already arrived.</p>
                </div>
              </div>

              <div className={styles.orderList}>
                {receivedOrders.length === 0 ? (
                  <div className={styles.emptyStateSmall}>
                    <span>✓</span>

                    <p>No received orders.</p>
                  </div>
                ) : (
                  receivedOrders.map((order, index) => (
                    <OrderCard
                      key={getId(order) || order.orderId || `received-order-${index}`}
                      order={order}
                      onMarkReceived={handleMarkReceived}
                      onCancel={handleCancelOrder}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Cancelled Orders */}

            {cancelledOrders.length > 0 && (
              <div className={`${styles.orderGroup} ${styles.cancelledOrderGroup}`}>
                <div className={styles.orderGroupHeader}>
                  <div>
                    <h3 className={styles.groupTitle}>Cancelled Orders</h3>

                    <p className={styles.orderGroupDescription}>
                      Previous orders that were cancelled.
                    </p>
                  </div>
                </div>

                <div className={styles.orderList}>
                  {cancelledOrders.map((order, index) => (
                    <OrderCard
                      key={getId(order) || order.orderId || `cancelled-order-${index}`}
                      order={order}
                      onMarkReceived={handleMarkReceived}
                      onCancel={handleCancelOrder}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Online Tools */}

        {activeTab === 'tools' && (
          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Online Garden Tools</h2>

                <p className={styles.sectionSubtitle}>
                  Helpful resources for planning and managing your garden.
                </p>
              </div>
            </div>

            <div className={styles.toolsGrid}>
              {ONLINE_TOOLS.map(tool => (
                <OnlineToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Calendar Modal */}

      {modalType && CALENDAR_TYPES[modalType] && (
        <Modal
          title={CALENDAR_TYPES[modalType].addLabel}
          subtitle={CALENDAR_TYPES[modalType].subtitle}
          onClose={closeModal}
          submitting={submitting}
        >
          <form className={styles.modalForm} onSubmit={handleCalendarSubmit}>
            {formError && (
              <div className={styles.formError} role="alert">
                {formError}
              </div>
            )}

            <div className={styles.formGrid}>
              <label>
                Event Name *
                <input
                  name="name"
                  value={calendarForm.name}
                  onChange={handleCalendarChange}
                  placeholder="e.g. Tomatoes"
                  required
                />
              </label>

              {modalType === 'seeding' && (
                <>
                  <label>
                    Start Date *
                    <input
                      type="date"
                      name="startDate"
                      value={calendarForm.startDate}
                      onChange={handleCalendarChange}
                      required
                    />
                  </label>

                  <label>
                    End Date
                    <input
                      type="date"
                      name="endDate"
                      value={calendarForm.endDate}
                      onChange={handleCalendarChange}
                    />
                  </label>

                  <label>
                    Location
                    <input
                      name="location"
                      value={calendarForm.location}
                      onChange={handleCalendarChange}
                      placeholder="Garden Bed 1"
                    />
                  </label>
                </>
              )}

              {modalType === 'transplanting' && (
                <>
                  <label>
                    Transplant Date *
                    <input
                      type="date"
                      name="date"
                      value={calendarForm.date}
                      onChange={handleCalendarChange}
                      required
                    />
                  </label>

                  <label>
                    Move From
                    <input
                      name="from"
                      value={calendarForm.from}
                      onChange={handleCalendarChange}
                      placeholder="Indoor"
                    />
                  </label>

                  <label>
                    Move To
                    <input
                      name="to"
                      value={calendarForm.to}
                      onChange={handleCalendarChange}
                      placeholder="Garden Bed 2"
                    />
                  </label>

                  <label>
                    Location
                    <input
                      name="location"
                      value={calendarForm.location}
                      onChange={handleCalendarChange}
                      placeholder="Garden Bed 2"
                    />
                  </label>
                </>
              )}

              {modalType === 'succession' && (
                <>
                  <label>
                    Last Sow Date *
                    <input
                      type="date"
                      name="lastSow"
                      value={calendarForm.lastSow}
                      onChange={handleCalendarChange}
                      required
                    />
                  </label>

                  <label>
                    Next Sow Date
                    <input
                      type="date"
                      name="nextSow"
                      value={calendarForm.nextSow}
                      onChange={handleCalendarChange}
                    />
                  </label>

                  <label>
                    Interval
                    <input
                      name="interval"
                      value={calendarForm.interval}
                      onChange={handleCalendarChange}
                      placeholder="Every 14 days"
                    />
                  </label>
                </>
              )}

              {modalType === 'harvesting' && (
                <>
                  <label>
                    Expected Date *
                    <input
                      type="date"
                      name="expected"
                      value={calendarForm.expected}
                      onChange={handleCalendarChange}
                      required
                    />
                  </label>

                  <label>
                    Expected Yield
                    <input
                      name="yield"
                      value={calendarForm.yield}
                      onChange={handleCalendarChange}
                      placeholder="80 lbs"
                    />
                  </label>
                </>
              )}

              <label>
                Status
                <select name="status" value={calendarForm.status} onChange={handleCalendarChange}>
                  {CALENDAR_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>

              <button type="submit" className={styles.primaryButton} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Seed Inventory Modal */}

      {modalType === 'seed' && (
        <Modal
          title="Add Seed Inventory"
          subtitle="Record seeds collected from your garden."
          onClose={closeModal}
          submitting={submitting}
        >
          <form className={styles.modalForm} onSubmit={handleSeedSubmit}>
            {formError && (
              <div className={styles.formError} role="alert">
                {formError}
              </div>
            )}

            <div className={styles.formGrid}>
              <label>
                Seed Name *
                <input
                  name="name"
                  value={seedForm.name}
                  onChange={handleSeedChange}
                  placeholder="e.g. Tomatoes"
                  required
                />
              </label>

              <label>
                Collected Date *
                <input
                  type="date"
                  name="collectedDate"
                  value={seedForm.collectedDate}
                  onChange={handleSeedChange}
                  required
                />
              </label>

              <label>
                Quantity *
                <input
                  type="number"
                  name="quantity"
                  value={seedForm.quantity}
                  onChange={handleSeedChange}
                  min="0"
                  step="any"
                  placeholder="50"
                  required
                />
              </label>

              <label>
                Viability (%)
                <input
                  type="number"
                  name="viable"
                  value={seedForm.viable}
                  onChange={handleSeedChange}
                  min="0"
                  max="100"
                  step="1"
                  required
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>

              <button type="submit" className={styles.primaryButton} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Seeds'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Seed Order Modal */}

      {modalType === 'order' && (
        <Modal
          title="Create Seed Order"
          subtitle="Add a new seed purchase order."
          onClose={closeModal}
          submitting={submitting}
        >
          <form className={styles.modalForm} onSubmit={handleOrderSubmit}>
            {formError && (
              <div className={styles.formError} role="alert">
                {formError}
              </div>
            )}

            <div className={styles.formGrid}>
              <label>
                Order ID *
                <input
                  name="orderId"
                  value={orderForm.orderId}
                  onChange={handleOrderChange}
                  placeholder="ORD-001"
                  required
                />
              </label>

              <label>
                Supplier *
                <input
                  name="supplier"
                  value={orderForm.supplier}
                  onChange={handleOrderChange}
                  placeholder="Seed Supplier"
                  required
                />
              </label>

              <label>
                Seed Name *
                <input
                  name="itemName"
                  value={orderForm.itemName}
                  onChange={handleOrderChange}
                  placeholder="Tomato Seeds"
                  required
                />
              </label>

              <label>
                Quantity *
                <input
                  type="number"
                  name="quantity"
                  value={orderForm.quantity}
                  onChange={handleOrderChange}
                  min="1"
                  step="1"
                  placeholder="10"
                  required
                />
              </label>

              <label>
                Unit *
                <input
                  name="unit"
                  value={orderForm.unit}
                  onChange={handleOrderChange}
                  placeholder="packets"
                  required
                />
              </label>

              <label>
                Order Date *
                <input
                  type="date"
                  name="orderDate"
                  value={orderForm.orderDate}
                  onChange={handleOrderChange}
                  required
                />
              </label>

              <label>
                Delivery Date
                <input
                  type="date"
                  name="deliveryDate"
                  value={orderForm.deliveryDate}
                  onChange={handleOrderChange}
                />
              </label>
            </div>

            <div className={styles.orderFormNote}>
              New orders are automatically created as <strong>Pending</strong>. You can mark them as
              received or cancel them after creation.
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>

              <button type="submit" className={styles.primaryButton} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default GardenManagementPage;
