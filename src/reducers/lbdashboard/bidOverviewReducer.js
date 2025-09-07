import * as actions from '../../constants/lbdashboard/bidOverviewConstants';

const initialState = {
  propertyDetails: null,
  propertyDetailsLoading: false,
  propertyDetailsError: null,

  placeBidResult: null,
  placeBidLoading: false,
  placeBidError: null,

  notifications: [],
  notificationsLoading: false,
  notificationsError: null,
};

export const biddingOverviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_PROPERTY_DETAILS_BEGIN:
      return { ...state, propertyDetailsLoading: true, propertyDetailsError: null };
    case actions.FETCH_PROPERTY_DETAILS_SUCCESS:
      return { ...state, propertyDetailsLoading: false, propertyDetails: action.payload };
    case actions.FETCH_PROPERTY_DETAILS_ERROR:
      return { ...state, propertyDetailsLoading: false, propertyDetailsError: action.payload };

    case actions.PLACE_BID_BEGIN:
      return { ...state, placeBidLoading: true, placeBidError: null };
    case actions.PLACE_BID_SUCCESS:
      return { ...state, placeBidLoading: false, placeBidResult: action.payload };
    case actions.PLACE_BID_ERROR:
      return { ...state, placeBidLoading: false, placeBidError: action.payload };

    case actions.FETCH_NOTIFICATIONS_BEGIN:
      return { ...state, notificationsLoading: true, notificationsError: null };
    case actions.FETCH_NOTIFICATIONS_SUCCESS:
      return { ...state, notificationsLoading: false, notifications: action.payload };
    case actions.FETCH_NOTIFICATIONS_ERROR:
      return { ...state, notificationsLoading: false, notificationsError: action.payload };

    default:
      return state;
  }
};

export default biddingOverviewReducer;
