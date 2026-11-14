import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

// Quick actions for rented tools and equipment (project dashboard).
// Each resolves to { ok, status, data } and never throws, so callers can
// show the server's message on failure.
const toResult = request =>
  request
    .then(response => ({ ok: true, status: response.status, data: response.data }))
    .catch(error => ({
      ok: false,
      status: error.response?.status ?? 0,
      data: error.response?.data ?? { message: error.message },
    }));

export const markRentalReturned = itemId => toResult(axios.put(ENDPOINTS.BM_RENTAL_RETURN(itemId)));

export const extendRental = (itemId, rentalDueDate) =>
  toResult(axios.put(ENDPOINTS.BM_RENTAL_EXTEND(itemId), { rentalDueDate }));

export const sendRentalReminder = itemId =>
  toResult(axios.post(ENDPOINTS.BM_RENTAL_REMINDER(itemId)));
