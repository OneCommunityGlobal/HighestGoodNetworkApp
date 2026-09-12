/**
 * Mock data for Kitchen Orders.
 *
 * Structure mirrors what a real API would return:
 *   { orders: Order[], suppliers: Supplier[], total: number }
 *
 * When backend integration arrives, replace fetchMockOrders / fetchMockSuppliers
 * with real axios calls and keep the same shape.
 */

export const suppliers = [
  {
    _id: 'sup-001',
    name: 'Green Valley Farms',
    contact: 'Maria Chen',
    phone: '(555) 123-4567',
    email: 'maria@greenvalleyfarms.com',
    category: 'Produce',
    trusted: true,
  },
  {
    _id: 'sup-002',
    name: 'Wholesome Grains Co.',
    contact: 'James Patel',
    phone: '(555) 234-5678',
    email: 'james@wholesomegrains.com',
    category: 'Grains & Flour',
    trusted: true,
  },
  {
    _id: 'sup-003',
    name: 'Sustainable Oils & More',
    contact: 'Aisha Johnson',
    phone: '(555) 345-6789',
    email: 'aisha@sustainableoils.com',
    category: 'Oils & Condiments',
    trusted: true,
  },
  {
    _id: 'sup-004',
    name: 'Local Dairy Collective',
    contact: 'Tom Rivera',
    phone: '(555) 456-7890',
    email: 'tom@localdairy.com',
    category: 'Dairy',
    trusted: true,
  },
  {
    _id: 'sup-005',
    name: 'Pacific Seafood Suppliers',
    contact: 'Lin Nakamura',
    phone: '(555) 567-8901',
    email: 'lin@pacificseafood.com',
    category: 'Seafood',
    trusted: false,
  },
];

export const orders = [
  {
    _id: 'po-2025-001',
    orderNumber: 'PO-2025-001',
    status: 'stocked',
    supplierId: 'sup-003',
    supplier: 'Sustainable Oils & More',
    orderDate: '2025-10-24T00:00:00.000Z',
    expectedDelivery: '2025-10-28T00:00:00.000Z',
    deliveredDate: '2025-10-27T00:00:00.000Z',
    items: [
      {
        name: 'Olive Oil (Extra Virgin)',
        quantity: 6,
        unit: 'bottles',
        unitPrice: 12.99,
        total: 77.94,
      },
      { name: 'Balsamic Vinegar', quantity: 3, unit: 'bottles', unitPrice: 8.5, total: 25.5 },
      { name: 'Sea Salt', quantity: 2, unit: 'containers', unitPrice: 5.99, total: 11.98 },
    ],
    total: 115.42,
    notes: 'Urgent – running low on olive oil',
  },
  {
    _id: 'po-2025-002',
    orderNumber: 'PO-2025-002',
    status: 'received',
    supplierId: 'sup-002',
    supplier: 'Wholesome Grains Co.',
    orderDate: '2025-10-19T00:00:00.000Z',
    expectedDelivery: '2025-10-22T00:00:00.000Z',
    deliveredDate: null,
    items: [
      { name: 'Quinoa (Organic)', quantity: 20, unit: 'lbs', unitPrice: 4.5, total: 90.0 },
      { name: 'Brown Rice', quantity: 25, unit: 'lbs', unitPrice: 2.99, total: 74.75 },
      { name: 'Whole Wheat Flour', quantity: 30, unit: 'lbs', unitPrice: 1.89, total: 56.7 },
    ],
    total: 221.45,
    notes: '',
  },
  {
    _id: 'po-2025-003',
    orderNumber: 'PO-2025-003',
    status: 'stocked',
    supplierId: 'sup-004',
    supplier: 'Local Dairy Collective',
    orderDate: '2025-10-21T00:00:00.000Z',
    expectedDelivery: '2025-10-22T00:00:00.000Z',
    deliveredDate: '2025-10-22T00:00:00.000Z',
    items: [
      { name: 'Whole Milk', quantity: 10, unit: 'gallons', unitPrice: 4.99, total: 49.9 },
      { name: 'Free-Range Eggs', quantity: 8, unit: 'dozen', unitPrice: 5.5, total: 44.0 },
      { name: 'Butter (Unsalted)', quantity: 5, unit: 'lbs', unitPrice: 6.99, total: 34.95 },
    ],
    total: 128.85,
    notes: '',
  },
  {
    _id: 'po-2025-004',
    orderNumber: 'PO-2025-004',
    status: 'ordered',
    supplierId: 'sup-001',
    supplier: 'Green Valley Farms',
    orderDate: '2025-10-25T00:00:00.000Z',
    expectedDelivery: '2025-10-27T00:00:00.000Z',
    deliveredDate: null,
    items: [
      { name: 'Organic Spinach', quantity: 5, unit: 'lbs', unitPrice: 3.99, total: 19.95 },
      { name: 'Bell Peppers (Mixed)', quantity: 8, unit: 'lbs', unitPrice: 2.99, total: 23.92 },
      { name: 'Fresh Rosemary', quantity: 2, unit: 'bunches', unitPrice: 2.5, total: 5.0 },
    ],
    total: 48.87,
    notes: '',
  },
  {
    _id: 'po-2025-005',
    orderNumber: 'PO-2025-005',
    status: 'ordered',
    supplierId: 'sup-005',
    supplier: 'Pacific Seafood Suppliers',
    orderDate: '2025-10-26T00:00:00.000Z',
    expectedDelivery: '2025-10-29T00:00:00.000Z',
    deliveredDate: null,
    items: [
      { name: 'Salmon Fillets', quantity: 10, unit: 'lbs', unitPrice: 14.99, total: 149.9 },
      { name: 'Shrimp (Shell-on)', quantity: 5, unit: 'lbs', unitPrice: 12.5, total: 62.5 },
      { name: 'Lemons', quantity: 12, unit: 'pcs', unitPrice: 0.75, total: 9.0 },
    ],
    total: 221.4,
    notes: 'For weekend dinner service',
  },
  {
    _id: 'po-2025-006',
    orderNumber: 'PO-2025-006',
    status: 'received',
    supplierId: 'sup-001',
    supplier: 'Green Valley Farms',
    orderDate: '2025-10-20T00:00:00.000Z',
    expectedDelivery: '2025-10-23T00:00:00.000Z',
    deliveredDate: null,
    items: [
      { name: 'Tomatoes (Roma)', quantity: 15, unit: 'lbs', unitPrice: 2.49, total: 37.35 },
      { name: 'Cucumbers', quantity: 10, unit: 'lbs', unitPrice: 1.99, total: 19.9 },
      { name: 'Fresh Basil', quantity: 4, unit: 'bunches', unitPrice: 3.0, total: 12.0 },
    ],
    total: 69.25,
    notes: '',
  },
  {
    _id: 'po-2025-007',
    orderNumber: 'PO-2025-007',
    status: 'stocked',
    supplierId: 'sup-002',
    supplier: 'Wholesome Grains Co.',
    orderDate: '2025-10-15T00:00:00.000Z',
    expectedDelivery: '2025-10-18T00:00:00.000Z',
    deliveredDate: '2025-10-17T00:00:00.000Z',
    items: [
      { name: 'Rolled Oats', quantity: 20, unit: 'lbs', unitPrice: 1.79, total: 35.8 },
      { name: 'Corn Meal', quantity: 10, unit: 'lbs', unitPrice: 2.29, total: 22.9 },
    ],
    total: 58.7,
    notes: '',
  },
];

let nextId = 8;

let _orders = [...orders];

export const fetchOrders = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: [..._orders], total: _orders.length });
    }, 300);
  });

export const createOrder = order =>
  new Promise(resolve => {
    setTimeout(() => {
      const newOrder = {
        ...order,
        _id: `po-2025-${String(nextId++).padStart(3, '0')}`,
        orderNumber: `PO-2025-${String(nextId - 1).padStart(3, '0')}`,
        status: 'ordered',
        deliveredDate: null,
      };
      _orders = [newOrder, ..._orders];
      resolve({ data: newOrder });
    }, 300);
  });

export const updateOrderStatus = (orderId, newStatus) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = _orders.findIndex(o => o._id === orderId);
      if (idx === -1) return reject(new Error('Order not found'));
      _orders[idx] = {
        ..._orders[idx],
        status: newStatus,
        deliveredDate:
          newStatus === 'received' ? new Date().toISOString() : _orders[idx].deliveredDate,
      };
      resolve({ data: _orders[idx] });
    }, 300);
  });

export const fetchSuppliers = () =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: [...suppliers] });
    }, 200);
  });
