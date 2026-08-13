import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiChevronRight, FiSearch, FiPlus } from 'react-icons/fi';

import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  fetchSuppliers,
  createSupplier,
  updateSupplier,
} from './ordersApi';

import styles from './OrdersPage.module.css';

const ORDERS_PER_PAGE = 5;

/* -------------------------------------------------------------------------- */
/*                                   MODAL                                    */
/* -------------------------------------------------------------------------- */

function Modal({ isOpen, toggle, size, className, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

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
    <div
      className={styles.modalOverlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      role="presentation"
    >
      <div className={`${styles.modalContent} ${sizeClass} ${className || ''}`}>{children}</div>
    </div>,
    document.body,
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  size: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

/* -------------------------------------------------------------------------- */
/*                              MODAL HEADER                                  */
/* -------------------------------------------------------------------------- */

function ModalHeader({ toggle, children }) {
  return (
    <div className={styles.modalHeader}>
      <h3 className={styles.modalTitle}>{children}</h3>
      <button type="button" className={styles.modalClose} onClick={toggle} aria-label="Close modal">
        &times;
      </button>
    </div>
  );
}

ModalHeader.propTypes = {
  toggle: PropTypes.func.isRequired,
  children: PropTypes.node,
};

/* -------------------------------------------------------------------------- */
/*                               MODAL BODY                                   */
/* -------------------------------------------------------------------------- */

function ModalBody({ children }) {
  return <div className={styles.modalBody}>{children}</div>;
}

ModalBody.propTypes = {
  children: PropTypes.node,
};

/* -------------------------------------------------------------------------- */
/*                              MODAL FOOTER                                  */
/* -------------------------------------------------------------------------- */

function ModalFooter({ children }) {
  return <div className={styles.modalFooter}>{children}</div>;
}

ModalFooter.propTypes = {
  children: PropTypes.node,
};

/* -------------------------------------------------------------------------- */
/*                                STATUS BADGE                                */
/* -------------------------------------------------------------------------- */

const badgeClassForStatus = status => {
  if (status === 'Pending') return styles.badgeOrdered;
  if (status === 'Ordered' || status === 'Shipped') return styles.badgeReceived;
  return styles.badgeStocked;
};

const StatusBadge = ({ status }) => (
  <span className={`${styles.badge} ${badgeClassForStatus(status)}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

/* -------------------------------------------------------------------------- */
/*                                 STAT CARD                                  */
/* -------------------------------------------------------------------------- */

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

StatCard.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  bgColor: PropTypes.string,
  icon: PropTypes.node,
};

/* -------------------------------------------------------------------------- */
/*                                ORDER CARD                                  */
/* -------------------------------------------------------------------------- */

const OrderCard = ({ order, onStatusChange, darkMode }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleConfirm = () => {
    if (confirmTarget) onStatusChange(order._id, confirmTarget);
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const openConfirm = status => {
    setConfirmTarget(status);
    setConfirmOpen(true);
  };

  const getActionButton = () => {
    if (order.status === 'Pending') {
      return (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionReceive}`}
          onClick={() => openConfirm('Ordered')}
        >
          Mark as Ordered
        </button>
      );
    }

    if (order.status === 'Ordered') {
      return (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionReceive}`}
          onClick={() => openConfirm('Shipped')}
        >
          Mark as Shipped
        </button>
      );
    }

    if (order.status === 'Shipped') {
      return (
        <button
          type="button"
          className={`${styles.actionBtn} ${styles.actionStock}`}
          onClick={() => openConfirm('Delivered')}
        >
          Mark as Delivered
        </button>
      );
    }

    return null;
  };

  const confirmLabel = confirmTarget ? `Mark as ${confirmTarget}` : '';
  const displayOrderId = order._id || 'N/A';
  const confirmMessage = confirmTarget
    ? `Mark order ${displayOrderId} as ${confirmTarget.toLowerCase()}?`
    : '';

  const supplierName =
    order.supplier ||
    (typeof order.supplierId === 'object' ? order.supplierId?.name : null) ||
    'N/A';

  return (
    <>
      <div className={`${styles.orderCard} ${darkMode ? styles.cardDark : ''}`}>
        <div className={styles.orderHeader}>
          <div className={styles.orderIdRow}>
            <span className={styles.orderId}>{displayOrderId}</span>
            <StatusBadge status={order.status} />
          </div>
          <span className={styles.orderTotal}>${Number(order.totalAmount || 0).toFixed(2)}</span>
        </div>

        <div className={styles.supplier}>
          <span role="img" aria-label="supplier">
            🏢
          </span>{' '}
          {supplierName}
        </div>

        <div className={styles.orderMeta}>
          <div>
            <p className={styles.metaLabel}>Order Date</p>
            <p className={styles.metaValue}>
              📅 {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <p className={styles.metaLabel}>Expected Delivery</p>
            <p className={styles.metaValue}>
              🚚{' '}
              {order.expectedDeliveryDate
                ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>

          <div>
            <p className={styles.metaLabel}>Items</p>
            <p className={styles.metaValue}>📦 {order.items?.length || 0} items</p>
          </div>
        </div>

        <div className={styles.itemsSection}>
          <p className={styles.itemsSectionTitle}>Order Items:</p>

          {order.items?.map((item, index) => (
            <div key={item._id || item.itemName || index} className={styles.itemRow}>
              <div className={styles.itemInfo}>
                <div className={styles.itemIcon}>✓</div>
                <div>
                  <div className={styles.itemName}>{item.itemName || 'Unnamed item'}</div>
                  <div className={styles.itemQty}>
                    {item.quantity} × ${Number(item.pricePerItem || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <span className={styles.itemPrice}>
                ${(Number(item.quantity || 0) * Number(item.pricePerItem || 0)).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          {getActionButton()}

          <button
            type="button"
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
          <button
            type="button"
            className={styles.btnModalSecondary}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </button>

          <button type="button" className={styles.btnModalPrimary} onClick={handleConfirm}>
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
          Order Details — {displayOrderId}
        </ModalHeader>

        <ModalBody>
          <div className={styles.detailSection}>
            <p className={styles.detailLabel}>Status</p>
            <StatusBadge status={order.status} />
          </div>

          <div className={styles.detailSection}>
            <p className={styles.detailLabel}>Supplier</p>
            <p className={styles.detailValue}>{supplierName}</p>
          </div>

          <div className={styles.detailRow}>
            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>Order Date</p>
              <p className={styles.detailValue}>
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className={styles.detailSection}>
              <p className={styles.detailLabel}>Expected Delivery</p>
              <p className={styles.detailValue}>
                {order.expectedDeliveryDate
                  ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            {order.actualDeliveryDate && (
              <div className={styles.detailSection}>
                <p className={styles.detailLabel}>Delivered On</p>
                <p className={styles.detailValue}>
                  {new Date(order.actualDeliveryDate).toLocaleDateString()}
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
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={item._id || item.itemName || index}>
                    <td>{item.itemName || 'Unnamed item'}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.pricePerItem || 0).toFixed(2)}</td>
                    <td>
                      ${(Number(item.quantity || 0) * Number(item.pricePerItem || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan="3" className={styles.detailTotalLabel}>
                    Order Total
                  </td>
                  <td className={styles.detailTotalValue}>
                    ${Number(order.totalAmount || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            className={styles.btnModalSecondary}
            onClick={() => setDetailsOpen(false)}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

const orderItemShape = PropTypes.shape({
  _id: PropTypes.string,
  itemName: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  pricePerItem: PropTypes.number.isRequired,
});

const supplierReferenceShape = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string,
});

const orderShape = PropTypes.shape({
  _id: PropTypes.string,
  status: PropTypes.oneOf(['Pending', 'Ordered', 'Shipped', 'Delivered', 'Cancelled']).isRequired,
  supplierId: PropTypes.oneOfType([PropTypes.string, supplierReferenceShape]).isRequired,
  supplier: PropTypes.string,
  orderDate: PropTypes.string,
  expectedDeliveryDate: PropTypes.string,
  actualDeliveryDate: PropTypes.string,
  totalAmount: PropTypes.number,
  items: PropTypes.arrayOf(orderItemShape),
});

OrderCard.propTypes = {
  order: orderShape.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

/* -------------------------------------------------------------------------- */
/*                           SUPPLIER FORM MODAL                              */
/* -------------------------------------------------------------------------- */

const SupplierFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  darkMode,
  supplier,
  title,
  submitLabel,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [specialties, setSpecialties] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setName(supplier?.name || '');
    setContact(supplier?.contact || '');
    setEmail(supplier?.email || '');
    setPhone(supplier?.phone || '');
    setWebsite(supplier?.websiteUrl || supplier?.website || supplier?.url || '');
    setSpecialties(Array.isArray(supplier?.specialities) ? supplier.specialities.join(', ') : '');
  }, [isOpen, supplier]);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    onSubmit({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      specialities: specialties
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      website: website.trim(),
      isActive: supplier?.isActive ?? true,
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="lg" className={darkMode ? styles.modalDark : ''}>
      <ModalHeader toggle={onClose}>{title}</ModalHeader>

      <ModalBody>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="supplierName">
            Supplier Name <span className={styles.required}>*</span>
          </label>
          <input
            id="supplierName"
            type="text"
            className={styles.input}
            placeholder="Enter supplier name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="supplierContact">
            Contact Person
          </label>
          <input
            id="supplierContact"
            type="text"
            className={styles.input}
            placeholder="Contact name"
            value={contact}
            onChange={e => setContact(e.target.value)}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="supplierEmail">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="supplierEmail"
              type="email"
              className={styles.input}
              placeholder="supplier@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="supplierPhone">
              Phone <span className={styles.required}>*</span>
            </label>
            <input
              id="supplierPhone"
              type="tel"
              className={styles.input}
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="supplierWebsite">
            Website
          </label>
          <input
            id="supplierWebsite"
            type="url"
            className={styles.input}
            placeholder="https://example.com"
            value={website}
            onChange={e => setWebsite(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="supplierSpecialties">
            Specialties
          </label>
          <input
            id="supplierSpecialties"
            type="text"
            className={styles.input}
            placeholder="Produce, Organic, Local"
            value={specialties}
            onChange={e => setSpecialties(e.target.value)}
          />
          <small>Separate multiple specialties with commas.</small>
        </div>
      </ModalBody>

      <ModalFooter>
        <button type="button" className={styles.btnModalSecondary} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={styles.btnModalPrimary} onClick={handleSubmit}>
          <FiPlus size={15} />
          {submitLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
};

SupplierFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  supplier: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    contact: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    website: PropTypes.string,
    websiteUrl: PropTypes.string,
    url: PropTypes.string,
    specialities: PropTypes.arrayOf(PropTypes.string),
    isActive: PropTypes.bool,
  }),
  title: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
};

/* -------------------------------------------------------------------------- */
/*                             NEW ORDER MODAL                                */
/* -------------------------------------------------------------------------- */

const NewOrderModal = ({ isOpen, onClose, onSubmit, suppliers: supplierList, darkMode }) => {
  const [supplierId, setSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [items, setItems] = useState([
    { id: 1, name: '', quantity: '', unit: 'lbs', unitPrice: '' },
  ]);

  const getToday = () => new Date().toISOString().split('T')[0];
  const today = getToday();

  useEffect(() => {
    if (isOpen) {
      setSupplierId('');
      setOrderDate(getToday());
      setDeliveryDate('');
      setItems([{ id: Date.now(), name: '', quantity: '', unit: 'lbs', unitPrice: '' }]);
    }
  }, [isOpen]);

  const handleOrderDateChange = value => {
    setOrderDate(value);

    if (deliveryDate && value && deliveryDate <= value) {
      setDeliveryDate('');
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(currentItems =>
      currentItems.map(item => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems(currentItems => [
      ...currentItems,
      {
        id: Date.now() + Math.random(),
        name: '',
        quantity: '',
        unit: 'lbs',
        unitPrice: '',
      },
    ]);
  };

  const removeItem = itemId => {
    if (items.length <= 1) return;
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
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

    const validItems = items.filter(
      item => item.name.trim() && Number(item.quantity) >= 1 && Number(item.unitPrice) >= 0,
    );

    if (validItems.length === 0) {
      toast.error('Add at least one valid item.');
      return;
    }

    onSubmit({
      supplierId,
      status: 'Pending',
      orderDate: new Date(`${orderDate}T00:00:00`).toISOString(),
      expectedDeliveryDate: new Date(`${deliveryDate}T00:00:00`).toISOString(),
      items: validItems.map(item => ({
        itemName: item.name.trim(),
        quantity: Number(item.quantity),
        pricePerItem: Number(item.unitPrice),
      })),
    });
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
            {supplierList.map(supplier => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>

          {supplierList.length === 0 && (
            <small>
              No suppliers are available. Create a supplier first from the Suppliers tab.
            </small>
          )}
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
              min={orderDate ? orderDate : today}
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
              min="1"
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
              aria-label="Remove item"
            >
              ✕
            </button>
          </div>
        ))}

        <button type="button" className={styles.addItemBtn} onClick={addItem}>
          + Add Item
        </button>
      </ModalBody>

      <ModalFooter>
        <button type="button" className={styles.btnModalSecondary} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={styles.btnModalPrimary} onClick={handleSubmit}>
          Create Order
        </button>
      </ModalFooter>
    </Modal>
  );
};

NewOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  suppliers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  darkMode: PropTypes.bool.isRequired,
};

/* -------------------------------------------------------------------------- */
/*                              ORDERS PAGE                                   */
/* -------------------------------------------------------------------------- */

function OrdersPage() {
  const darkMode = useSelector(state => state.theme?.darkMode ?? false);

  const [orders, setOrders] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [newSupplierOpen, setNewSupplierOpen] = useState(false);
  const [editSupplierOpen, setEditSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const [orderRes, supplierRes] = await Promise.all([fetchOrders(), fetchSuppliers()]);

      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
      setSupplierList(Array.isArray(supplierRes.data) ? supplierRes.data : []);
    } catch (error) {
      console.error('Failed to load orders/suppliers:', error);
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

      setOrders(prev =>
        prev.map(order => (order._id === orderId ? { ...order, status: newStatus } : order)),
      );

      toast.success(`Order marked as ${newStatus}.`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status.');
    }
  };

  const handleCreateOrder = async orderData => {
    try {
      /*
       * The supplier's Total Orders value is derived from the orders returned
       * by the API. After creating an order we reload both resources so the
       * supplier card immediately reflects the new order count.
       */
      await createOrder(orderData);

      toast.success('Purchase order created.');
      setNewOrderOpen(false);

      setCurrentPage(1);
      await loadOrders();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order.');
    }
  };

  const handleCreateSupplier = async supplierData => {
    try {
      await createSupplier(supplierData);

      toast.success('Supplier created successfully.');
      setNewSupplierOpen(false);

      await loadOrders();
    } catch (error) {
      console.error('Failed to create supplier:', error);
      toast.error('Failed to create supplier.');
    }
  };

  const handleUpdateSupplier = async supplierData => {
    if (!editingSupplier?._id) return;

    try {
      await updateSupplier(editingSupplier._id, supplierData);

      toast.success('Supplier updated successfully.');
      setEditSupplierOpen(false);
      setEditingSupplier(null);

      await loadOrders();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Failed to update supplier.');
    }
  };

  const handleAutoGenerate = () => {
    toast.info(
      'Auto-generate from shortages will be available once the inventory module is connected.',
    );
  };

  /*
   * Calculate supplier order counts from the actual orders collection.
   * This prevents the Suppliers tab from becoming stale when the backend
   * supplier document does not yet contain a totalOrders/orderCount field.
   */
  const supplierOrderCounts = orders.reduce((counts, order) => {
    const supplierId =
      typeof order.supplierId === 'object' ? order.supplierId?._id : order.supplierId;

    if (supplierId) {
      counts[supplierId] = (counts[supplierId] || 0) + 1;
    }

    return counts;
  }, {});

  const pendingCount = orders.filter(
    order => order.status === 'Pending' || order.status === 'Ordered',
  ).length;

  const awaitingStock = orders.filter(order => order.status === 'Delivered').length;

  const now = new Date();

  const monthlySpend = orders
    .filter(order => {
      const orderDate = new Date(order.orderDate);

      return (
        orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    const orderId = order._id?.toLowerCase() || '';

    const supplierName =
      order.supplier?.toLowerCase() ||
      (typeof order.supplierId === 'object' ? order.supplierId?.name?.toLowerCase() : '') ||
      '';

    const itemMatches = order.items?.some(item =>
      (item.itemName?.toLowerCase() || '').includes(query),
    );

    return orderId.includes(query) || supplierName.includes(query) || itemMatches;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const statusOrder = {
      Pending: 0,
      Ordered: 1,
      Shipped: 2,
      Delivered: 3,
      Cancelled: 4,
    };

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
          <div className={styles.spinner} />
          Loading orders…
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
              type="button"
              className={styles.pageBtn}
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(page => page - 1)}
            >
              <FiChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                type="button"
                key={page}
                className={`${styles.pageBtn} ${page === safePage ? styles.pageBtnActive : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className={styles.pageBtn}
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(page => page + 1)}
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
              type="button"
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

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setNewOrderOpen(true)}
              >
                <FiPlus size={16} />
                New Order
              </button>

              <button type="button" className={styles.btnSecondary} onClick={handleAutoGenerate}>
                🔄 Auto-Generate from Shortages
              </button>
            </div>

            {renderOrdersContent()}
          </>
        )}

        {activeTab === 'suppliers' && (
          <section className={styles.suppliersSection} aria-labelledby="suppliers-heading">
            <div className={styles.suppliersHeader}>
              <div>
                <h2 id="suppliers-heading" className={styles.sectionTitle}>
                  Suppliers
                </h2>

                <p className={styles.sectionSubtitle}>
                  Manage your suppliers and supplier information
                </p>
              </div>

              <div className={styles.suppliersHeaderActions}>
                <span className={styles.supplierCount}>
                  {supplierList.length} {supplierList.length === 1 ? 'Supplier' : 'Suppliers'}
                </span>

                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setNewSupplierOpen(true)}
                >
                  <FiPlus size={16} />
                  Add Supplier
                </button>
              </div>
            </div>

            {supplierList.length > 0 ? (
              <div className={styles.supplierGrid}>
                {supplierList.map(supplier => {
                  const specialties = Array.isArray(supplier.specialities)
                    ? supplier.specialities
                    : [];

                  const avgDeliveryDays =
                    supplier.avgDeliveryDays ?? supplier.averageDeliveryDays ?? 'N/A';

                  /*
                   * IMPORTANT:
                   * Use the count from the orders currently loaded instead of
                   * relying only on supplier.totalOrders/orderCount.
                   *
                   * Therefore:
                   * Supplier A = 2 existing orders
                   * Create another order for Supplier A
                   * -> loadOrders()
                   * -> supplierOrderCounts[A] = 3
                   * -> Total Orders immediately shows 3
                   */
                  const backendTotalOrders = supplier.totalOrders ?? supplier.orderCount;

                  const calculatedTotalOrders = supplierOrderCounts[supplier._id] ?? 0;

                  const totalOrders = Object.prototype.hasOwnProperty.call(
                    supplierOrderCounts,
                    supplier._id,
                  )
                    ? calculatedTotalOrders
                    : backendTotalOrders ?? 0;

                  const websiteUrl = supplier.websiteUrl || supplier.website || supplier.url;

                  return (
                    <article
                      key={supplier._id}
                      className={`${styles.supplierCard} ${darkMode ? styles.cardDark : ''}`}
                    >
                      <div className={styles.supplierCardHeader}>
                        <div className={styles.supplierIdentity}>
                          <div className={styles.supplierIcon} aria-hidden="true">
                            🏢
                          </div>

                          <div>
                            <h3 className={styles.supplierCardName}>{supplier.name}</h3>
                          </div>
                        </div>

                        {supplier.trusted && <span className={styles.trustedBadge}>Trusted</span>}
                      </div>

                      <div className={styles.supplierDetails}>
                        <div className={styles.supplierDetail}>
                          <span className={styles.detailIcon} aria-hidden="true">
                            👤
                          </span>
                          <div>
                            <p className={styles.supplierDetailLabel}>Contact</p>
                            <p className={styles.supplierDetailValue}>
                              {supplier.contact || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className={styles.supplierDetail}>
                          <span className={styles.detailIcon} aria-hidden="true">
                            ✉
                          </span>
                          <div>
                            <p className={styles.supplierDetailLabel}>Email</p>
                            <p className={styles.supplierDetailValue}>{supplier.email || 'N/A'}</p>
                          </div>
                        </div>

                        <div className={styles.supplierDetail}>
                          <span className={styles.detailIcon} aria-hidden="true">
                            ☎
                          </span>
                          <div>
                            <p className={styles.supplierDetailLabel}>Phone</p>
                            <p className={styles.supplierDetailValue}>{supplier.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.supplierStats}>
                        <div className={styles.supplierStat}>
                          <span className={styles.supplierStatIcon} aria-hidden="true">
                            🚚
                          </span>
                          <div>
                            <p className={styles.supplierStatLabel}>Avg Delivery</p>
                            <p className={styles.supplierStatValue}>
                              {avgDeliveryDays === 'N/A'
                                ? 'N/A'
                                : `${avgDeliveryDays} ${
                                    Number(avgDeliveryDays) === 1 ? 'day' : 'days'
                                  }`}
                            </p>
                          </div>
                        </div>

                        <div className={styles.supplierStat}>
                          <span className={styles.supplierStatIcon} aria-hidden="true">
                            📦
                          </span>
                          <div>
                            <p className={styles.supplierStatLabel}>Total Orders</p>
                            <p className={styles.supplierStatValue}>{totalOrders}</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.specialtiesSection}>
                        <p className={styles.specialtiesLabel}>Specialties</p>

                        {specialties.length > 0 ? (
                          <div className={styles.specialtiesList}>
                            {specialties.map((specialty, index) => (
                              <span key={`${specialty}-${index}`} className={styles.specialtyTag}>
                                {specialty}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.noSpecialties}>No specialties listed</span>
                        )}
                      </div>

                      <div className={styles.supplierActions}>
                        <button
                          type="button"
                          className={`${styles.supplierActionBtn} ${styles.pricingBtn}`}
                          onClick={() =>
                            toast.info(
                              `Pricing history for ${supplier.name} will be available soon.`,
                            )
                          }
                        >
                          View Pricing History
                        </button>

                        <button
                          type="button"
                          className={`${styles.supplierActionBtn} ${styles.editSupplierBtn}`}
                          onClick={() => {
                            setEditingSupplier(supplier);
                            setEditSupplierOpen(true);
                          }}
                        >
                          Edit Supplier Info
                        </button>

                        {websiteUrl && (
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.supplierActionBtn} ${styles.newOrderBtn}`}
                          >
                            <FiPlus size={15} />
                            New Order
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className={`${styles.orderCard} ${styles.emptyState}`}>
                <span className={styles.emptyStateIcon} aria-hidden="true">
                  🏢
                </span>

                <p>No suppliers found.</p>

                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => setNewSupplierOpen(true)}
                >
                  <FiPlus size={16} />
                  Add Your First Supplier
                </button>
              </div>
            )}
          </section>
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

      <SupplierFormModal
        isOpen={newSupplierOpen}
        onClose={() => setNewSupplierOpen(false)}
        onSubmit={handleCreateSupplier}
        darkMode={darkMode}
        title="Add New Supplier"
        submitLabel="Add Supplier"
      />

      <SupplierFormModal
        isOpen={editSupplierOpen}
        onClose={() => {
          setEditSupplierOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={handleUpdateSupplier}
        darkMode={darkMode}
        supplier={editingSupplier}
        title="Edit Supplier Information"
        submitLabel="Save Changes"
      />
    </div>
  );
}

export default OrdersPage;
