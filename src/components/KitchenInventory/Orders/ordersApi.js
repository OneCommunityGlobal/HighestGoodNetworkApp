import axios from 'axios';

const ORDERS_BASE_URL = '/api/kitchenandinventory/orders';
const SUPPLIERS_BASE_URL = '/api/kitchenandinventory/suppliers';

export const fetchOrders = () => axios.get(ORDERS_BASE_URL);

export const createOrder = orderData => axios.post(ORDERS_BASE_URL, orderData);

export const updateOrderStatus = (orderId, status) =>
  axios.patch(`${ORDERS_BASE_URL}/${orderId}/status`, { status });

export const fetchSuppliers = () => axios.get(SUPPLIERS_BASE_URL);

export const createSupplier = supplierData => axios.post(SUPPLIERS_BASE_URL, supplierData);

export const updateSupplier = (supplierId, supplierData) =>
  axios.put(`${SUPPLIERS_BASE_URL}/${supplierId}`, supplierData);
