import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import styles from './OrchardManagement.module.css';
import { GiFruitTree } from 'react-icons/gi';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import { PiScissorsLight, PiLeafLight } from 'react-icons/pi';
import { LuCalendarDays } from 'react-icons/lu';

const orchardItems = [
  {
    id: 1,
    name: 'Apple Tree (Honeycrisp)',
    location: 'Row 1, Position 3',
    plantedDate: '2022-04-15',
    condition: 'excellent',
  },
  {
    id: 2,
    name: 'Pear Tree (Bartlett)',
    location: 'Row 1, Position 5',
    plantedDate: '2022-04-15',
    condition: 'good',
  },
  {
    id: 3,
    name: 'Cherry Tree (Bing)',
    location: 'Row 2, Position 2',
    plantedDate: '2021-03-20',
    condition: 'excellent',
  },
  {
    id: 4,
    name: 'Blueberry Bush',
    location: 'Berry Section A',
    plantedDate: '2023-05-10',
    condition: 'good',
  },
  {
    id: 5,
    name: 'Raspberry Bush',
    location: 'Berry Section B',
    plantedDate: '2023-05-10',
    condition: 'excellent',
  },
];

const initialOrders = [
  {
    id: 'OR-001',
    supplier: 'Heritage Orchard Nursery',
    items: '2x Peach Trees, 1x Plum Tree',
    orderedDate: '2024-10-01',
    expectedDate: '2024-11-15',
    status: 'ordered',
  },
  {
    id: 'OR-002',
    supplier: 'Berry Best Plants',
    items: '5x Strawberry Plants',
    orderedDate: '2024-10-10',
    expectedDate: '2024-10-28',
    status: 'shipped',
  },
];

const initialPlantingSchedule = [
  {
    id: 1,
    quantityAndName: '2x Peach Trees',
    location: 'Row 3, Positions 1-2',
    notes: 'Requires full sun',
    scheduledDate: '2024-11-20',
  },
  {
    id: 2,
    quantityAndName: '1x Plum Tree',
    location: 'Row 3, Position 4',
    notes: 'Plant with companion pollinators',
    scheduledDate: '2024-11-20',
  },
  {
    id: 3,
    quantityAndName: '5x Strawberry Plants',
    location: 'Berry Section C',
    notes: 'Add compost before planting',
    scheduledDate: '2024-11-01',
  },
];

const sectionTabs = [
  'Trees & Bushes',
  'Orders',
  'Planting Schedule',
  'Trimming Schedule',
  'Harvest Calendar',
];

function calculateAgeInYears(plantedDate) {
  const planted = new Date(plantedDate);
  const today = new Date();
  const diffTime = today - planted;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const years = diffDays / 365.25;

  return `${years.toFixed(1)} years`;
}

function OrchardManagement() {
  const [activeSection, setActiveSection] = useState('Trees & Bushes');
  const [orders, setOrders] = useState(initialOrders);
  const [plantingTasks, setPlantingTasks] = useState(initialPlantingSchedule);
  const [isPlantingFormOpen, setIsPlantingFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  const detailsTriggerRef = useRef(null);

  const openDetails = (type, item, event) => {
    detailsTriggerRef.current = event.currentTarget;
    setSelectedDetails({ type, item });
  };

  const closeDetails = () => {
    setSelectedDetails(null);
  };

  // Explicitly handle Escape so the modal also closes reliably in tests.
  useEffect(() => {
    if (!selectedDetails) return undefined;

    const handleEscape = event => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        event.preventDefault();
        closeDetails();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedDetails]);

  const restoreDetailsFocus = () => {
    detailsTriggerRef.current?.focus();
    detailsTriggerRef.current = null;
  };

  // Status progression: ordered -> shipped -> delivered
  const handleStatusChange = orderId => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id !== orderId) return order;

        if (order.status === 'ordered') {
          return { ...order, status: 'shipped' };
        }

        if (order.status === 'shipped') {
          return { ...order, status: 'delivered' };
        }

        return order;
      }),
    );
  };

  const handleAddPlantingTask = event => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const getStringValue = name => {
      const value = formData.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };

    const quantity = Number(formData.get('quantity'));
    const plantName = getStringValue('plantName');
    const row = getStringValue('row');
    const position = getStringValue('position');
    const notes = getStringValue('notes');
    const scheduledDate = getStringValue('scheduledDate');

    if (!plantName || !quantity || quantity < 1 || !row || !position || !scheduledDate) {
      return;
    }

    setPlantingTasks(prev => [
      ...prev,
      {
        id: Math.max(0, ...prev.map(task => Number(task.id) || 0)) + 1,
        quantityAndName: `${quantity}x ${plantName}`,
        location: `Row ${row}, Position ${position}`,
        notes: notes || 'No notes provided',
        scheduledDate,
      },
    ]);

    setIsPlantingFormOpen(false);
  };

  const handleAddOrder = event => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const getStringValue = name => {
      const value = formData.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };

    const supplier = getStringValue('supplier');
    const items = getStringValue('items');
    const orderedDate = getStringValue('orderedDate');
    const expectedDate = getStringValue('expectedDate');

    if (!supplier || !items || !orderedDate || !expectedDate) return;

    setOrders(prev => {
      const nextNumber =
        Math.max(0, ...prev.map(order => Number(order.id.replace('OR-', '')) || 0)) + 1;

      return [
        ...prev,
        {
          id: `OR-${String(nextNumber).padStart(3, '0')}`,
          supplier,
          items,
          orderedDate,
          expectedDate,
          status: 'ordered',
        },
      ];
    });

    setIsOrderFormOpen(false);
  };

  // Pending orders exclude delivered items.
  const pendingOrdersCount = orders.filter(order => order.status !== 'delivered').length;

  const summaryCards = [
    {
      title: 'Total Trees & Bushes',
      value: orchardItems.length,
      icon: GiFruitTree,
      iconClass: styles.greenIcon,
    },
    {
      title: 'Pending Orders',
      value: pendingOrdersCount,
      icon: HiOutlineShoppingCart,
      iconClass: styles.blueIcon,
    },
    {
      title: 'Trimming Tasks',
      value: 4,
      icon: PiScissorsLight,
      iconClass: styles.purpleIcon,
    },
    {
      title: 'Expected Harvests',
      value: 6,
      icon: PiLeafLight,
      iconClass: styles.orangeIcon,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orchard Management</h1>
        <p className={styles.subtitle}>
          Manage fruit trees, bushes, and orchard maintenance schedules.
        </p>
      </div>

      <div className={styles.metricsGrid}>
        {summaryCards.map(card => {
          const Icon = card.icon;

          return (
            <div key={card.title} className={styles.metricCard}>
              <div className={styles.metricCardTop}>
                <p className={styles.metricTitle}>{card.title}</p>
                <Icon className={`${styles.metricIcon} ${card.iconClass}`} />
              </div>
              <h2 className={styles.metricValue}>{card.value}</h2>
            </div>
          );
        })}
      </div>

      <div className={styles.sectionNav}>
        {sectionTabs.map(tab => (
          <button
            key={tab}
            type="button"
            className={`${styles.navButton} ${activeSection === tab ? styles.activeNav : ''}`}
            onClick={() => setActiveSection(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TREES & BUSHES SECTION */}
      {activeSection === 'Trees & Bushes' && (
        <div className={styles.inventorySection}>
          <div className={styles.inventoryHeader}>
            <div>
              <h3 className={styles.inventoryTitle}>Orchard Inventory</h3>
              <p className={styles.inventorySubtitle}>All trees and bushes in the orchard</p>
            </div>

            <button type="button" className={styles.addButton}>
              + Add Tree/Bush
            </button>
          </div>

          <div className={styles.cardGrid}>
            {orchardItems.map(item => (
              <div key={item.id} className={styles.orchardCard}>
                <div className={styles.cardTopRow}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.iconWrapper}>
                      <GiFruitTree className={styles.treeIcon} />
                    </div>

                    <div>
                      <h4 className={styles.cardTitle}>{item.name}</h4>
                      <p className={styles.cardLocation}>{item.location}</p>
                    </div>
                  </div>

                  <span
                    className={`${styles.conditionTag} ${
                      item.condition === 'excellent' ? styles.excellent : styles.good
                    }`}
                  >
                    {item.condition}
                  </span>
                </div>

                <div className={styles.cardDetails}>
                  <div>
                    <p className={styles.detailLabel}>Planted</p>
                    <p className={styles.detailValue}>{item.plantedDate}</p>
                  </div>

                  <div>
                    <p className={styles.detailLabel}>Age</p>
                    <p className={styles.detailValue}>{calculateAgeInYears(item.plantedDate)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.detailsButton}
                  onClick={event => openDetails('tree', item, event)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS SECTION */}
      {activeSection === 'Orders' && (
        <div className={styles.inventorySection}>
          <div className={styles.inventoryHeader}>
            <div>
              <h3 className={styles.inventoryTitle}>Tree & Bush Orders</h3>
              <p className={styles.inventorySubtitle}>Track orders from nurseries and suppliers</p>
            </div>

            <button
              type="button"
              className={styles.addButton}
              onClick={() => setIsOrderFormOpen(open => !open)}
            >
              {isOrderFormOpen ? 'Cancel' : '+ New Order'}
            </button>
          </div>

          {isOrderFormOpen && (
            <form className={styles.entryForm} onSubmit={handleAddOrder}>
              <label className={styles.formField}>
                <span>Supplier</span>
                <input name="supplier" required />
              </label>

              <label className={styles.formField}>
                <span>Items</span>
                <input name="items" required placeholder="2x Apple Trees" />
              </label>

              <label className={styles.formField}>
                <span>Ordered date</span>
                <input name="orderedDate" type="date" required />
              </label>

              <label className={styles.formField}>
                <span>Expected delivery</span>
                <input name="expectedDate" type="date" required />
              </label>

              <button type="submit" className={styles.addButton}>
                Save Order
              </button>
            </form>
          )}

          <div className={styles.ordersList}>
            {orders.every(order => order.status === 'delivered') && (
              <p className={styles.placeholderText}>No pending orders.</p>
            )}

            {orders
              .filter(order => order.status !== 'delivered')
              .map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderCardTop}>
                    <div>
                      <h4 className={styles.orderId}>{order.id}</h4>
                      <p className={styles.orderSupplier}>{order.supplier}</p>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        order.status === 'ordered' ? styles.statusOrdered : styles.statusShipped
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className={styles.orderDetails}>
                    <p>
                      <span className={styles.detailLabel}>Items:</span> {order.items}
                    </p>
                    <p>
                      <span className={styles.detailLabel}>Ordered:</span> {order.orderedDate}
                    </p>
                    <p>
                      <span className={styles.detailLabel}>Expected:</span> {order.expectedDate}
                    </p>
                  </div>

                  <div className={styles.orderActions}>
                    <button
                      type="button"
                      className={styles.detailsButton}
                      onClick={event => openDetails('order', order, event)}
                    >
                      View Details
                    </button>

                    {order.status === 'ordered' && (
                      <button
                        type="button"
                        className={styles.statusActionButton}
                        onClick={() => handleStatusChange(order.id)}
                      >
                        Mark as Shipped
                      </button>
                    )}

                    {order.status === 'shipped' && (
                      <button
                        type="button"
                        className={styles.statusActionButton}
                        onClick={() => handleStatusChange(order.id)}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* PLANTING SCHEDULE SECTION */}
      {activeSection === 'Planting Schedule' && (
        <div className={styles.inventorySection}>
          <div className={styles.inventoryHeader}>
            <div>
              <h3 className={styles.inventoryTitle}>
                <LuCalendarDays className={styles.scheduleTitleIcon} /> Planting Schedule
              </h3>
              <p className={styles.inventorySubtitle}>
                Upcoming planting tasks for new trees and bushes
              </p>
            </div>
          </div>

          <div className={styles.plantingList}>
            {plantingTasks.map(task => (
              <div key={task.id} className={styles.plantingCard}>
                <div className={styles.plantingCardLeft}>
                  <h4 className={styles.taskQuantityName}>{task.quantityAndName}</h4>
                  <p className={styles.taskDetailText}>
                    <span className={styles.detailLabel}>Location:</span> {task.location}
                  </p>
                  <p className={styles.taskDetailText}>
                    <span className={styles.detailLabel}>Notes:</span> {task.notes}
                  </p>
                </div>

                <div className={styles.scheduledDateTag}>{task.scheduledDate}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={styles.addPlantingTaskButton}
            onClick={() => setIsPlantingFormOpen(open => !open)}
          >
            {isPlantingFormOpen ? 'Cancel' : '+ Add Planting Task'}
          </button>

          {isPlantingFormOpen && (
            <form className={styles.entryForm} onSubmit={handleAddPlantingTask}>
              <label className={styles.formField}>
                Plant name
                <input name="plantName" required placeholder="Apple Tree" />
              </label>

              <label className={styles.formField}>
                Quantity
                <input name="quantity" type="number" min="1" defaultValue="1" required />
              </label>

              <label className={styles.formField}>
                Row
                <input name="row" type="number" min="1" required />
              </label>

              <label className={styles.formField}>
                Position
                <input name="position" type="number" min="1" required />
              </label>

              <label className={styles.formField}>
                Notes
                <input name="notes" placeholder="Planting notes" />
              </label>

              <label className={styles.formField}>
                Scheduled date
                <input name="scheduledDate" type="date" required />
              </label>

              <button type="submit" className={styles.addButton}>
                Save Planting Task
              </button>
            </form>
          )}
        </div>
      )}

      {/* PLACEHOLDER SECTIONS */}
      {activeSection !== 'Trees & Bushes' &&
        activeSection !== 'Orders' &&
        activeSection !== 'Planting Schedule' && (
          <div className={styles.placeholderSection}>
            <h3 className={styles.placeholderTitle}>{activeSection}</h3>
          </div>
        )}

      {/* REUSABLE DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedDetails)}
        toggle={closeDetails}
        centered
        keyboard
        backdrop
        trapFocus
        labelledBy="orchard-details-title"
        onClosed={restoreDetailsFocus}
      >
        <ModalHeader toggle={closeDetails}>
          <span id="orchard-details-title">
            {selectedDetails?.type === 'tree' ? 'Tree & Bush Details' : 'Order Details'}
          </span>
        </ModalHeader>

        <ModalBody>
          {selectedDetails?.type === 'tree' && (
            <>
              <p>
                <strong>Name:</strong> {selectedDetails.item.name}
              </p>
              <p>
                <strong>Location:</strong> {selectedDetails.item.location}
              </p>
              <p>
                <strong>Planted:</strong> {selectedDetails.item.plantedDate}
              </p>
              <p>
                <strong>Age:</strong> {calculateAgeInYears(selectedDetails.item.plantedDate)}
              </p>
              <p>
                <strong>Condition:</strong> {selectedDetails.item.condition}
              </p>
            </>
          )}

          {selectedDetails?.type === 'order' && (
            <>
              <p>
                <strong>Order:</strong> {selectedDetails.item.id}
              </p>
              <p>
                <strong>Supplier:</strong> {selectedDetails.item.supplier}
              </p>
              <p>
                <strong>Items:</strong> {selectedDetails.item.items}
              </p>
              <p>
                <strong>Status:</strong> {selectedDetails.item.status}
              </p>
              <p>
                <strong>Ordered:</strong> {selectedDetails.item.orderedDate}
              </p>
              <p>
                <strong>Expected:</strong> {selectedDetails.item.expectedDate}
              </p>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}

export default OrchardManagement;
