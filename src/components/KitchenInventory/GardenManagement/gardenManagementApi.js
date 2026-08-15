import axios from 'axios';

const BASE_URL = '/api/kitchenandinventory/gardenmanagement';

/* =========================
 * Seed Inventory
 * ========================= */

export const getSeedInventory = async () => {
  const response = await axios.get(`${BASE_URL}/seeds`);

  return response.data;
};

export const getSeedInventoryById = async id => {
  const response = await axios.get(`${BASE_URL}/seeds/${id}`);

  return response.data;
};

export const createSeedInventory = async data => {
  const response = await axios.post(`${BASE_URL}/seeds`, data);

  return response.data;
};

export const updateSeedInventory = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/seeds/${id}`, data);

  return response.data;
};

export const deleteSeedInventory = async id => {
  const response = await axios.delete(`${BASE_URL}/seeds/${id}`);

  return response.data;
};

/* =========================
 * Seed Orders
 * ========================= */

export const getSeedOrders = async () => {
  const response = await axios.get(`${BASE_URL}/orders`);

  return response.data;
};

export const getSeedOrderById = async id => {
  const response = await axios.get(`${BASE_URL}/orders/${id}`);

  return response.data;
};

export const createSeedOrder = async data => {
  const response = await axios.post(`${BASE_URL}/orders`, data);

  return response.data;
};

export const updateSeedOrder = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/orders/${id}`, data);

  return response.data;
};

export const deleteSeedOrder = async id => {
  const response = await axios.delete(`${BASE_URL}/orders/${id}`);

  return response.data;
};

export const updateSeedOrderStatus = async (id, status) => {
  const response = await axios.patch(`${BASE_URL}/orders/${id}/status`, { status });

  return response.data;
};

/* =========================
 * Garden Calendar
 * ========================= */

export const getGardenCalendar = async () => {
  const response = await axios.get(`${BASE_URL}/calendar`);

  return response.data;
};

export const getGardenCalendarEventById = async id => {
  const response = await axios.get(`${BASE_URL}/calendar/${id}`);

  return response.data;
};

export const createGardenCalendarEvent = async data => {
  const response = await axios.post(`${BASE_URL}/calendar`, data);

  return response.data;
};

export const updateGardenCalendarEvent = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/calendar/${id}`, data);

  return response.data;
};

export const deleteGardenCalendarEvent = async id => {
  const response = await axios.delete(`${BASE_URL}/calendar/${id}`);

  return response.data;
};

export const updateGardenCalendarEventStatus = async (id, status) => {
  const response = await axios.patch(`${BASE_URL}/calendar/${id}/status`, { status });

  return response.data;
};
