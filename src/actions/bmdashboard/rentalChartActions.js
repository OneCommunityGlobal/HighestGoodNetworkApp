import axios from 'axios';
import { ENDPOINTS } from "utils/URL";
import { GET_ERRORS } from "constants/errors";
import GET_RENTAL_COSTS from '../../constants/bmdashboard/rentalChartConstants';

export const setRentals = payload => {
    return {
        type: GET_RENTAL_COSTS,
        payload
    };
};

export const setErrors = payload => {
    return {
        type: GET_ERRORS,
        payload
    };
};

export const fetchRentalCharts = () => {
    const url = ENDPOINTS.BM_RENTAL_CHART;
    return async (dispatch) => {
        try {
            const response = await axios.get(url);
            const rentalsData = response.data.data;
            dispatch(setRentals(rentalsData));
            return rentalsData;
        } catch (err) {
            dispatch(setErrors(err.response?.data || { message: err.message }));
            return null;
        }
    }
}
