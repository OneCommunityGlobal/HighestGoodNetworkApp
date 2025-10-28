import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';

export async function getEvent(eventId) {
  const res = await httpService.get(`${ENDPOINTS.EVENTS}/${eventId}`);
  return res.data;
}

export async function updateEventDescription(eventId, description) {
  const res = await httpService.patch(`${ENDPOINTS.EVENTS}/${eventId}`, { description });
  return res.data;
}

export async function updateEventMeta(eventId, meta) {
  const res = await httpService.patch(`${ENDPOINTS.EVENTS}/${eventId}`, meta);
  return res.data;
}

export default {
  getEvent,
  updateEventDescription,
  updateEventMeta,
};
