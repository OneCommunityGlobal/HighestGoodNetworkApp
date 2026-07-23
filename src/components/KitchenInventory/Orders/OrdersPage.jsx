import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiChevronRight, FiSearch, FiPlus } from 'react-icons/fi';
import { fetchOrders, createOrder, updateOrderStatus, fetchSuppliers } from './mockOrdersData';
import styles from './OrdersPage.module.css';

const ORDERS_PER_PAGE = 5;

function Modal({ isOpen, toggle, size, className, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = e => {
      if (e.key === 'Escape') toggle();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, toggle]);

  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target === overlayRef.current) toggle();
  };

  const handleOverlayKeyDown = e => {
    if (e.target === overlayRef.current && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle();
    }
  };

  const sizeClass = size === 'lg' ? styles.modalLg : '';

  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Modal overlay backdrop
    <div
      className={styles.modalOverlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
    >
      <div className={`${styles.modalContent} ${sizeClass} ${className || ''}`}>{children}</div>
    </div>,
    document.body,
  );
}

function ModalHeader({ toggle, children }) {
  return (
    <div className={styles.modalHeader}>
      <h3 className={styles.modalTitle}>{children}</h3>
      <button type="button" className={styles.modalClose} onClick={toggle}>
        &times;
      </button>
    </div>
  );
}

function ModalBody({ children }) {
  return <div className={styles.modalBody}>{children}</div>;
}

function ModalFooter({ children }) {
  return <div className={styles.modalFooter}>{children}</div>;
}

const badgeClassForStatus = status => {
  if (status === 'ordered') return styles.badgeOrdered;
  if (status === 'received') return styles.badgeReceived;
  return styles.badgeStocked;
};

const suppliersData = [
  {
    id: 'SUP-001',
    name: 'Green Valley Farms',
    contact: 'Sarah Martinez',
    email: 'sarah@greenvalley.com',
    phone: '(555) 123-4567',
    avgDelivery: '2 days',
    totalOrders: 145,
    reliability: 98,
    specialties: ['Organic Produce', 'Seasonal Vegetables', 'Herbs'],
    website: 'https://greenvalleyfarms.com',
  },
  {
    id: 'SUP-002',
    name: 'Wholesome Grains Co.',
    contact: 'Michael Chen',
    email: 'michael@wholesomegrains.com',
    phone: '(555) 234-5678',
    avgDelivery: '3 days',
    totalOrders: 89,
    reliability: 95,
    specialties: ['Grains', 'Legumes', 'Flour', 'Rice'],
    website: 'https://wholesomegrains.com',
  },
  {
    id: 'SUP-003',
    name: 'Local Dairy Collective',
    contact: 'Emma Thompson',
    email: 'emma@localdairy.com',
    phone: '(555) 345-6789',
    avgDelivery: '1 day',
    totalOrders: 203,
    reliability: 99,
    specialties: ['Dairy Products', 'Eggs', 'Butter', 'Cheese'],
    website: 'https://localdairy.com',
  },
  {
    id: 'SUP-004',
    name: 'Sustainable Oils & More',
    contact: 'David Rodriguez',
    email: 'david@sustainableoils.com',
    phone: '(555) 456-7890',
    avgDelivery: '4 days',
    totalOrders: 67,
    reliability: 92,
    specialties: ['Olive Oil', 'Condiments', 'Vinegars', 'Spices'],
    website: 'https://sustainableoils.com',
  },
];

const StatusBadge = ({ status }) => {
  const cls = badgeClassForStatus(status);
  return (
    <span className={`${styles.badge} ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({ label, value, bgColor, icon }) => (
  <div className={styles.statCard}>
    <div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
    <div className={styles.statIcon} style={{ '--stat-bg': bgColor }}>
      {icon}
    </div>
  </div>
);

// const SupplierCard = ({ supplier }) => {
//   const handleNewOrder = () => {
//     window.open(supplier.website, '_blank');
//   };

//   return (
//     <div className={styles.supplierCard}>
//       <div className={styles.supplierHeader}>
//         <div className={styles.supplierName}>
//           <span>🏢</span>
//           {supplier.name}
//         </div>
//         <span className={styles.reliabilityBadge}>{supplier.reliability}% reliable</span>
//       </div>

//       <div className={styles.supplierContact}>Contact: {supplier.contact}</div>

//       <div className={styles.supplierDetails}>
//         <div className={styles.detailRow}>
//           <span className={styles.detailLabel}>Email</span>
//           <span className={styles.detailValue}>{supplier.email}</span>
//         </div>
//         <div className={styles.detailRow}>
//           <span className={styles.detailLabel}>Phone</span>
//           <span className={styles.detailValue}>{supplier.phone}</span>
//         </div>
//         <div className={styles.detailRow}>
//           <span className={styles.detailLabel}>📦 Avg Delivery</span>
//           <span className={styles.detailValue}>{supplier.avgDelivery}</span>
//         </div>
//         <div className={styles.detailRow}>
//           <span className={styles.detailLabel}>🛒 Total Orders</span>
//           <span className={styles.detailValue}>{supplier.totalOrders}</span>
//         </div>
//       </div>

//       <div className={styles.specialties}>
//         <p className={styles.specialtiesLabel}>Specialties</p>
//         <div className={styles.specialtyTags}>
//           {supplier.specialties.map((specialty, idx) => (
//             <span key={idx} className={styles.specialtyTag}>
//               {specialty}
//             </span>
//           ))}
//         </div>
//       </div>

//       <div className={styles.supplierActions}>
//         <button type="button" className={styles.btnOutline}>
//           View Pricing History
//         </button>
//         <button type="button" className={styles.btnOutline}>
//           Edit Supplier Info
//         </button>
//         <button type="button" className={styles.btnPrimary} onClick={handleNewOrder}>
//           New Order
//         </button>
//       </div>
//     </div>
//   );
// };

const SupplierCard = ({ supplier }) => {
  const handleNewOrder = () => {
    if (supplier.website) {
      window.open(supplier.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePricingHistory = () => {
    console.log(`View pricing history for ${supplier.name}`);
  };

  const handleEditSupplier = () => {
    console.log(`Edit supplier info for ${supplier.name}`);
  };

  return (
    <div className={styles.supplierCard}>
      <div className={styles.supplierHeader}>
        <div className={styles.supplierName}>
          <span>🏢</span>
          {supplier.name}
        </div>

        <span className={styles.reliabilityBadge}>{supplier.reliability}% reliable</span>
      </div>

      <div className={styles.supplierContact}>Contact: {supplier.contact}</div>

      <div className={styles.supplierDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Email</span>
          <span className={styles.detailValue}>{supplier.email}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Phone</span>
          <span className={styles.detailValue}>{supplier.phone}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>📦 Avg Delivery</span>
          <span className={styles.detailValue}>{supplier.avgDelivery}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>🛒 Total Orders</span>
          <span className={styles.detailValue}>{supplier.totalOrders}</span>
        </div>
      </div>

      <div className={styles.specialties}>
        <p className={styles.specialtiesLabel}>Specialties</p>

        <div className={styles.specialtyTags}>
          {supplier.specialties.map((specialty, idx) => (
            <span key={idx} className={styles.specialtyTag}>
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.supplierActions}>
        <button type="button" className={styles.btnOutline} onClick={handlePricingHistory}>
          View Pricing History
        </button>

        <button type="button" className={styles.btnOutline} onClick={handleEditSupplier}>
          Edit Supplier Info
        </button>

        <button type="button" className={styles.btnPrimary} onClick={handleNewOrder}>
          New Order
        </button>
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusChange }) => {
  const getActionButton = () => {
    if (order.status === 'ordered') {
      return (
        <button
          className={`${styles.actionBtn} ${styles.actionReceive}`}
          onClick={() => openConfirm('received')}
        >
          Mark as Received
        </button>
      );
    }
    if (order.status === 'received') {
      return (
        <button
          className={`${styles.actionBtn} ${styles.actionStock}`}
          onClick={() => openConfirm('stocked')}
        >
          Mark as Stocked
        </button>
      );
    }
    return null;
  };

  const confirmLabel = confirmTarget === 'received' ? 'Mark as Received' : 'Mark as Stocked';
  const confirmMessage =
    confirmTarget === 'received'
      ? `Mark order ${order.orderNumber} as received? This confirms delivery has arrived.`
      : `Mark order ${order.orderNumber} as stocked? This confirms items are shelved in inventory.`;

  return (
    <>
      <div className={`${styles.orderCard} ${darkMode ? styles.cardDark : ''}`}>
        <div className={styles.orderHeader}>
          <div className={styles.orderIdRow}>
            <span className={styles.orderId}>{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <span className={styles.orderTotal}>${order.total.toFixed(2)}</span>
        </div>

        <div className={styles.supplier}>
          <span role="img" aria-label="supplier">
            🏢
          </span>{' '}
          {order.supplier}
        </div>

        <div className={styles.orderMeta}>
          <div>
            <p className={styles.metaLabel}>Order Date</p>
            <p className={styles.metaValue}>📅 {new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className={styles.metaLabel}>Expected Delivery</p>
            <p className={styles.metaValue}>
              🚚 {new Date(order.expectedDelivery).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className={styles.metaLabel}>Items</p>
            <p className={styles.metaValue}>📦 {order.items.length} items</p>
          </div>
        </div>

        <div className={styles.itemsSection}>
          <p className={styles.itemsSectionTitle}>Order Items:</p>
          {order.items.map(item => (
            <div key={item.name} className={styles.itemRow}>
              <div className={styles.itemInfo}>
                <div className={styles.itemIcon}>✓</div>
                <div>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemQty}>
                    {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <span className={styles.itemPrice}>${item.total.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className={styles.notesBanner}>
            <span>📝</span> {order.notes}
          </div>
        )}

        <div className={styles.actions}>
          {getActionButton()}
          <button
            className={`${styles.actionBtn} ${styles.actionView}`}
            onClick={() => setDetailsOpen(true)}
          >
            View Details
          </button>
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        toggle={() => setConfirmOpen(false)}
        className={darkMode ? styles.modalDark : ''}
      >
        <ModalHeader toggle={() => setConfirmOpen(false)}>Confirm Status Change</ModalHeader>
        <ModalBody>{confirmMessage}</ModalBody>
        <ModalFooter>
          <button className={styles.btnModalSecondary} onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
          <button className={styles.btnModalPrimary} onClick={handleConfirm}>
            {confirmLabel}
          </button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={detailsOpen}
        toggle={() => setDetailsOpen(false)}
        size="lg"
        className={darkMode ? styles.modalDark : ''}
      >
        <ModalHeader toggle={() => setDetailsOpen(false)}>
          Order Details — {order.orderNumber}
        </ModalHeader>
        <ModalBody>
          <div className={styles.detailSection}>
            <p className={styles.detailLabel}>Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div className={styles.detailSection}>
            <p className={styles.detailLabel}>Supplier</p>
            <p className={styles.detailValue}>{order.supplier}</p>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>Order Date</p>
              <p className={styles.detailValue}>{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>Expected Delivery</p>
              <p className={styles.detailValue}>
                {new Date(order.expectedDelivery).toLocaleDateString()}
              </p>
            </div>
            {order.deliveredDate && (
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Delivered On</p>
                <p className={styles.detailValue}>
                  {new Date(order.deliveredDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className={styles.detailItemsHeader}>Order Items</div>
          <div className={styles.detailTableWrap}>
            <table className={styles.detailTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className={styles.detailTotalLabel}>
                    Order Total
                  </td>
                  <td className={styles.detailTotalValue}>${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {order.notes && (
            <div className={styles.detailNotes}>
              <p className={styles.detailLabel}>Notes</p>
              <p className={styles.detailValue}>{order.notes}</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button className={styles.btnModalSecondary} onClick={() => setDetailsOpen(false)}>
            Close
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const NewOrderModal = ({ isOpen, onClose, onSubmit, suppliers: supplierList, darkMode }) => {
  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: '', unit: 'lbs', unitPrice: '' },
  ]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      setOrderDate(today);
      setDeliveryDate('');
    }
  }, [isOpen, today]);

  const handleOrderDateChange = value => {
    setOrderDate(value);
    if (deliveryDate && value && deliveryDate <= value) {
      setDeliveryDate('');
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(items.map(item => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', quantity: '', unit: 'lbs', unitPrice: '' }]);
  };

  const removeItem = itemId => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSubmit = () => {
    if (!supplierId || !orderDate || !deliveryDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (orderDate < today) {
      toast.error('Order date cannot be in the past.');
      return;
    }
    if (deliveryDate <= orderDate) {
      toast.error('Expected delivery must be after the order date.');
      return;
    }
    const supplier = supplierList.find(s => s._id === supplierId);
    const validItems = items.filter(i => i.name && i.quantity && i.unitPrice);
    if (validItems.length === 0) {
      toast.error('Add at least one valid item.');
      return;
    }

    const computed = validItems.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));

    onSubmit({
      supplierId,
      supplier: supplier?.name || '',
      orderDate: new Date(orderDate).toISOString(),
      expectedDelivery: new Date(deliveryDate).toISOString(),
      items: computed,
      total: computed.reduce((sum, i) => sum + i.total, 0),
      notes,
    });

    setSupplierId('');
    setOrderDate(today);
    setDeliveryDate('');
    setNotes('');
    setItems([{ id: 1, name: '', quantity: '', unit: 'lbs', unitPrice: '' }]);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" className={darkMode ? styles.modalDark : ''}>
      <ModalHeader toggle={onClose}>New Purchase Order</ModalHeader>
      <ModalBody>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="supplier">
            Supplier <span className={styles.required}>*</span>
          </label>
          <select
            id="supplier"
            className={styles.select}
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
          >
            <option value="">Select a supplier…</option>
            {supplierList.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.category})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="orderDate">
              Order Date <span className={styles.required}>*</span>
            </label>
            <input
              id="orderDate"
              type="date"
              className={styles.input}
              value={orderDate}
              min={today}
              onChange={e => handleOrderDateChange(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="deliveryDate">
              Expected Delivery <span className={styles.required}>*</span>
            </label>
            <input
              id="deliveryDate"
              type="date"
              className={styles.input}
              value={deliveryDate}
              min={orderDate || today}
              disabled={!orderDate}
              onChange={e => setDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        <p className={styles.label}>
          Order Items <span className={styles.required}>*</span>
        </p>
        <div className={styles.itemsFormHeader}>
          <span className={styles.itemFormColName}>Item Name</span>
          <span className={styles.itemFormColSm}>Qty</span>
          <span className={styles.itemFormColSm}>Unit</span>
          <span className={styles.itemFormColSm}>Unit Price</span>
          <span />
        </div>
        {items.map(item => (
          <div key={item.id} className={styles.itemFormRow}>
            <input
              className={`${styles.input} ${styles.itemFormColName}`}
              placeholder="Item name"
              value={item.name}
              onChange={e => handleItemChange(item.id, 'name', e.target.value)}
            />
            <input
              className={`${styles.input} ${styles.itemFormColSm}`}
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              value={item.quantity}
              onChange={e => handleItemChange(item.id, 'quantity', e.target.value)}
            />
            <select
              className={`${styles.select} ${styles.itemFormColSm}`}
              value={item.unit}
              onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
              <option value="bottles">bottles</option>
              <option value="dozen">dozen</option>
              <option value="bunches">bunches</option>
              <option value="gallons">gallons</option>
              <option value="containers">containers</option>
              <option value="pcs">pcs</option>
            </select>
            <input
              className={`${styles.input} ${styles.itemFormColSm}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="$0.00"
              value={item.unitPrice}
              onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)}
            />
            <button
              type="button"
              className={styles.removeItemBtn}
              onClick={() => removeItem(item.id)}
              disabled={items.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className={styles.addItemBtn} onClick={addItem}>
          + Add Item
        </button>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            className={styles.textarea}
            rows="2"
            placeholder="Optional notes…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <button className={styles.btnModalSecondary} onClick={onClose}>
          Cancel
        </button>
        <button className={styles.btnModalPrimary} onClick={handleSubmit}>
          Create Order
        </button>
      </ModalFooter>
    </Modal>
  );
};

function OrdersPage() {
  const darkMode = useSelector(state => state.theme?.darkMode ?? false);

  const [orders, setOrders] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const [orderRes, supplierRes] = await Promise.all([fetchOrders(), fetchSuppliers()]);
      setOrders(orderRes.data);
      setSupplierList(supplierRes.data);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Order marked as ${newStatus}.`);
    } catch {
      toast.error('Failed to update order status.');
    }
  };

  const handleCreateOrder = async orderData => {
    try {
      await createOrder(orderData);
      toast.success('Purchase order created.');
      setNewOrderOpen(false);
      loadOrders();
    } catch {
      toast.error('Failed to create order.');
    }
  };

  const handleAutoGenerate = () => {
    toast.info(
      'Auto-generate from shortages will be available once the inventory module is connected.',
    );
  };

  const pendingCount = orders.filter(o => o.status === 'ordered').length;
  const awaitingStock = orders.filter(o => o.status === 'received').length;
  const monthlySpend = orders.reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(
    order =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusOrder = { ordered: 0, received: 1, stocked: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(b.orderDate) - new Date(a.orderDate);
  });

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = sortedOrders.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE,
  );

  const containerClass = `${styles.container} ${darkMode ? styles.containerDark : ''}`;

  const renderOrdersContent = () => {
    if (loading) {
      return (
        <div className={`${styles.orderCard} ${styles.emptyState}`}>
          <div className={styles.spinner} /> Loading orders…
        </div>
      );
    }
    if (paginatedOrders.length === 0) {
      return (
        <div className={`${styles.orderCard} ${styles.emptyState}`}>
          No orders found matching your search.
        </div>
      );
    }
    return (
      <>
        {paginatedOrders.map(order => (
          <OrderCard
            key={order._id}
            order={order}
            onStatusChange={handleStatusChange}
            darkMode={darkMode}
          />
        ))}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === safePage ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={containerClass}>
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

        {activeTab === 'purchase-orders' && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Search by order #, supplier, or item…"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`${styles.searchInput} ${darkMode ? styles.searchInputDark : ''}`}
                />
              </div>
              <button className={styles.btnPrimary} onClick={() => setNewOrderOpen(true)}>
                <FiPlus size={16} /> New Order
              </button>
              <button className={styles.btnSecondary} onClick={handleAutoGenerate}>
                🔄 Auto-Generate from Shortages
              </button>
            </div>

            {renderOrdersContent()}
          </>
        )}

        {activeTab === 'suppliers' && (
          <div className={styles.suppliersGrid}>
            {suppliersData.map(supplier => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        )}

        {activeTab === 'surplus' && (
          <div className={`${styles.orderCard} ${styles.emptyState}`}>
            Surplus Opportunities section — Coming soon
          </div>
        )}
      </main>

      <NewOrderModal
        isOpen={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onSubmit={handleCreateOrder}
        suppliers={supplierList}
        darkMode={darkMode}
      />
    </div>
  );
}

export default OrdersPage;
