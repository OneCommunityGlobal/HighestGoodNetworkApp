import {
  FETCH_LB_USERS_REQUEST,
  FETCH_LB_USERS_SUCCESS,
  FETCH_LB_USERS_FAILURE,
  UPDATE_LB_USER_REQUEST,
  UPDATE_LB_USER_SUCCESS,
  UPDATE_LB_USER_FAILURE,
  DELETE_LB_USER_REQUEST,
  DELETE_LB_USER_SUCCESS,
  DELETE_LB_USER_FAILURE,
  SET_LB_USERS_PAGE,
  SET_LB_USERS_LIMIT,
  SET_LB_USERS_SEARCH,
  CLEAR_LB_USERS_ERROR,
} from '../../constants/lbDashboard/userManagementConstants';

export const initialState = {
  users: [],
  loading: false,
  actionLoading: false,
  error: null,
  errorStatus: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  search: '',
};

const getUserId = user => user?._id || user?.id;

export const lbUserManagementReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case FETCH_LB_USERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        errorStatus: null,
      };

    case FETCH_LB_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload?.users || [],
        page: action.payload?.page ?? state.page,
        limit: action.payload?.limit ?? state.limit,
        total: action.payload?.total ?? 0,
        totalPages: action.payload?.totalPages ?? 1,
        search: action.payload?.search ?? state.search,
        error: null,
        errorStatus: null,
      };

    case FETCH_LB_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload?.message || 'Failed to fetch users.',
        errorStatus: action.payload?.status || null,
      };

    case UPDATE_LB_USER_REQUEST:
    case DELETE_LB_USER_REQUEST:
      return {
        ...state,
        actionLoading: true,
        error: null,
        errorStatus: null,
      };

    case UPDATE_LB_USER_SUCCESS: {
      const targetId = action.payload?.userId;
      const updatedUser = action.payload?.updatedUser || {};
      return {
        ...state,
        actionLoading: false,
        users: state.users.map(user =>
          String(getUserId(user)) === String(targetId) ? { ...user, ...updatedUser } : user,
        ),
        error: null,
        errorStatus: null,
      };
    }

    case DELETE_LB_USER_SUCCESS: {
      const deletedId = action.payload;
      const filteredUsers = state.users.filter(
        user => String(getUserId(user)) !== String(deletedId),
      );
      const newTotal = Math.max(0, state.total - 1);
      const newTotalPages =
        state.limit > 0 ? Math.max(1, Math.ceil(newTotal / state.limit)) : state.totalPages;
      return {
        ...state,
        actionLoading: false,
        users: filteredUsers,
        total: newTotal,
        totalPages: newTotalPages,
        error: null,
        errorStatus: null,
      };
    }

    case UPDATE_LB_USER_FAILURE:
    case DELETE_LB_USER_FAILURE:
      return {
        ...state,
        actionLoading: false,
        error: action.payload?.message || 'Action failed.',
        errorStatus: action.payload?.status || null,
      };

    case SET_LB_USERS_PAGE:
      return {
        ...state,
        page: action.payload,
      };

    case SET_LB_USERS_LIMIT:
      return {
        ...state,
        limit: action.payload,
        page: 1,
      };

    case SET_LB_USERS_SEARCH:
      return {
        ...state,
        search: action.payload,
        page: 1,
      };

    case CLEAR_LB_USERS_ERROR:
      return {
        ...state,
        error: null,
        errorStatus: null,
      };

    default:
      return state;
  }
};

export default lbUserManagementReducer;
