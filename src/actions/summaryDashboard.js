/* eslint-disable consistent-return */
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  GET_SUPPLIER_PERFORMANCE,
  SUPPLIER_PERFORMANCE_ERROR,
} from '../constants/summayDashboardConstants';
import { ENDPOINTS } from '../utils/URL';

// Action creators
export const getSupplierPerformanceActionCreator = data => ({
  type: GET_SUPPLIER_PERFORMANCE,
  payload: data,
});

export const supplierPerformanceError = error => ({
  type: SUPPLIER_PERFORMANCE_ERROR,
  payload: error,
});

// Fetch Projects with Supplier Performance Data
export const fetchSupplierProjects = () => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.SUPPLIER_PROJECTS);
      return response.data;
    } catch (error) {
      dispatch(supplierPerformanceError(error.message));
      toast.error('Failed to fetch projects with supplier data');
      throw error;
    }
  };
};

// Fetch Supplier Performance
export const fetchSupplierPerformance = ({ projectId = 'all', startDate, endDate }) => {
  return async dispatch => {
    try {
      const response = await axios.get(
        ENDPOINTS.SUPPLIER_PERFORMANCE(projectId, startDate, endDate),
      );

      // dispatch(getSupplierPerformanceActionCreator(response.data));
      return response.data;
    } catch (error) {
      dispatch(supplierPerformanceError(error.message));
      toast.error('Failed to fetch supplier performance data');
    }
  };
};
