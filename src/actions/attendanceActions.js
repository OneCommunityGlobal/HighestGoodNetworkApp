import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

export async function getEventById(eventId) {
  try {
    const url = ENDPOINTS.EVENT_BY_ID(eventId);
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getAttendanceByEvent(eventId, status = null) {
  try {
    const url = ENDPOINTS.ATTENDANCE_BY_EVENT(eventId);
    const params = status ? { status } : {};
    const response = await axios.get(url, { params });
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getAttendanceSummary(eventId, totalRegistrations = null) {
  try {
    const url = ENDPOINTS.ATTENDANCE_SUMMARY(eventId);
    const params = totalRegistrations ? { registrations: totalRegistrations } : {};
    const response = await axios.get(url, { params });
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function createAttendanceLog(attendanceData) {
  try {
    const url = ENDPOINTS.ATTENDANCE;
    const response = await axios.post(url, attendanceData);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function updateAttendanceLog(attendanceId, updateData) {
  try {
    const url = ENDPOINTS.ATTENDANCE_BY_ID(attendanceId);
    const response = await axios.put(url, updateData);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function deleteAttendanceLog(attendanceId) {
  try {
    const url = ENDPOINTS.ATTENDANCE_BY_ID(attendanceId);
    const response = await axios.delete(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function seedAttendanceForEvent(eventId, attendees = []) {
  try {
    const url = ENDPOINTS.ATTENDANCE_SEED(eventId);
    const response = await axios.post(url, { attendees });
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

export async function getMockAttendanceForEvent(eventId) {
  try {
    const url = ENDPOINTS.ATTENDANCE_MOCK(eventId);
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    return {
      message: error.response?.data?.error || error.message,
      errorCode: error.response?.status,
      status: error.response?.status || 500,
    };
  }
}

