import GET_RENTAL_COSTS from '../../constants/bmdashboard/rentalChartConstants';

const initialState = {
  rentalCosts: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
const rentalChartReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_RENTAL_COSTS:
      return {
        ...state,
        rentalCosts: action.payload,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export default rentalChartReducer;
