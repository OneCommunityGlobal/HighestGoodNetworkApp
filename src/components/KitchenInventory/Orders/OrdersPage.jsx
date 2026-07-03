import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormGroup,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiChevronRight, FiSearch, FiPlus } from 'react-icons/fi';
import { boxStyle, boxStyleDark } from '~/styles';
import '../../Header/DarkMode.css';
import { fetchOrders, createOrder, updateOrderStatus, fetchSuppliers } from './mockOrdersData';
import styles from './OrdersPage.module.css';

const ORDERS_PER_PAGE = 5;

const StatusBadge = ({ status }) => {
  const cls =
    status === 'ordered'
      ? styles.badgeOrdered
      : status === 'received'
      ? styles.badgeReceived
      : styles.badgeStocked;
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
    <div className={styles.statIcon} style={{ backgroundColor: bgColor }}>
      {icon}
    </div>
  </div>
);

const OrderCard = ({ order, onStatusChange, darkMode }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleConfirm = () => {
    if (confirmTarget) {
      onStatusChange(order._id, confirmTarget);
    }
    setConfirmOpen(false);
    setConfirmTarget(null);
  };

  const openConfirm = status => {
    setConfirmTarget(status);
    setConfirmOpen(true);
  };

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
          {order.items.map((item, idx) => (
            <div key={idx} className={styles.itemRow}>
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
          <div className={styles.urgentBanner}>
            <span>⚠️</span> {order.notes}
          </div>
        )}

        <div className={styles.actions}>
          {getActionButton()}
          <button className={`${styles.actionBtn} ${styles.actionView}`}>View Details</button>
        </div>
      </div>

      <Modal
        isOpen={confirmOpen}
        toggle={() => setConfirmOpen(false)}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader
          toggle={() => setConfirmOpen(false)}
          className={darkMode ? 'bg-space-cadet' : ''}
        >
          Confirm Status Change
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{confirmMessage}</ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color="secondary"
            onClick={() => setConfirmOpen(false)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleConfirm}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            {confirmLabel}
          </Button>
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
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'lbs', unitPrice: '' }]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: '', unit: 'lbs', unitPrice: '' }]);
  };

  const removeItem = index => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!supplierId || !orderDate || !deliveryDate) {
      toast.error('Please fill in all required fields.');
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
    setOrderDate('');
    setDeliveryDate('');
    setNotes('');
    setItems([{ name: '', quantity: '', unit: 'lbs', unitPrice: '' }]);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      size="lg"
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader toggle={onClose} className={darkMode ? 'bg-space-cadet' : ''}>
        New Purchase Order
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <FormGroup>
          <Label for="supplier">Supplier *</Label>
          <Input
            type="select"
            id="supplier"
            value={supplierId}
            onChange={e => setSupplierId(e.target.value)}
          >
            <option value="">Select a supplier…</option>
            {supplierList.map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.category})
              </option>
            ))}
          </Input>
        </FormGroup>

        <div className={styles.formRow}>
          <FormGroup className={styles.formGroup}>
            <Label for="orderDate">Order Date *</Label>
            <Input
              type="date"
              id="orderDate"
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
            />
          </FormGroup>
          <FormGroup className={styles.formGroup}>
            <Label for="deliveryDate">Expected Delivery *</Label>
            <Input
              type="date"
              id="deliveryDate"
              value={deliveryDate}
              onChange={e => setDeliveryDate(e.target.value)}
            />
          </FormGroup>
        </div>

        <Label>Order Items *</Label>
        <div className={styles.itemsFormHeader}>
          <span className={styles.itemFormColName}>Item Name</span>
          <span className={styles.itemFormColSm}>Qty</span>
          <span className={styles.itemFormColSm}>Unit</span>
          <span className={styles.itemFormColSm}>Unit Price</span>
          <span />
        </div>
        {items.map((item, idx) => (
          <div key={idx} className={styles.itemFormRow}>
            <Input
              className={styles.itemFormColName}
              placeholder="Item name"
              value={item.name}
              onChange={e => handleItemChange(idx, 'name', e.target.value)}
            />
            <Input
              className={styles.itemFormColSm}
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              value={item.quantity}
              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
            />
            <Input
              className={styles.itemFormColSm}
              type="select"
              value={item.unit}
              onChange={e => handleItemChange(idx, 'unit', e.target.value)}
            >
              <option value="lbs">lbs</option>
              <option value="kg">kg</option>
              <option value="bottles">bottles</option>
              <option value="dozen">dozen</option>
              <option value="bunches">bunches</option>
              <option value="gallons">gallons</option>
              <option value="containers">containers</option>
              <option value="pcs">pcs</option>
            </Input>
            <Input
              className={styles.itemFormColSm}
              type="number"
              min="0"
              step="0.01"
              placeholder="$0.00"
              value={item.unitPrice}
              onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
            />
            <button
              type="button"
              className={styles.removeItemBtn}
              onClick={() => removeItem(idx)}
              disabled={items.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" className={styles.addItemBtn} onClick={addItem}>
          + Add Item
        </button>

        <FormGroup className={styles.formGroup}>
          <Label for="notes">Notes</Label>
          <Input
            type="textarea"
            id="notes"
            rows="2"
            placeholder="Optional notes…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={onClose} style={darkMode ? boxStyleDark : boxStyle}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} style={darkMode ? boxStyleDark : boxStyle}>
          Create Order
        </Button>
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

            {loading ? (
              <div className={`${styles.orderCard} ${styles.emptyState}`}>
                <div className={styles.spinner} /> Loading orders…
              </div>
            ) : paginatedOrders.length > 0 ? (
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
                        className={`${styles.pageBtn} ${
                          page === safePage ? styles.pageBtnActive : ''
                        }`}
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
            ) : (
              <div className={`${styles.orderCard} ${styles.emptyState}`}>
                No orders found matching your search.
              </div>
            )}
          </>
        )}

        {activeTab === 'suppliers' && (
          <div className={`${styles.orderCard} ${styles.emptyState}`}>
            Suppliers section — Coming soon
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
