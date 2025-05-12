import { GET_RENTAL_COSTS } from '../../constants/bmdashboard/rentalChartConstants';

const initialState = {
    rentals: [], 
    loading: true,
};

export default function rentalChartReducer(state = initialState, action) {
    switch (action.type) {
        case GET_RENTAL_COSTS:
            return {
                ...state,
                rentals: action.payload, 
                loading: false,
            };
        default: 
            return state;
    }
}
