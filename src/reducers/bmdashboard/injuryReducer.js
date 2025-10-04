import {
  FETCH_INJURIES_REQUEST,
  FETCH_INJURIES_SUCCESS,
  FETCH_INJURIES_FAILURE,
} from '../../actions/bmdashboard/types';

import {
  FETCH_BM_INJURY_DATA_REQUEST,
  FETCH_BM_INJURY_DATA_SUCCESS,
  FETCH_BM_INJURY_DATA_FAILURE,
  FETCH_BM_INJURY_SEVERITIES,
  FETCH_BM_INJURY_TYPES,
  FETCH_BM_INJURY_PROJECTS,
  RESET_BM_INJURY_DATA,
  GET_INJURY_SEVERITY,
} from '../../actions/bmdashboard/injuryActions';

const byName = (a, b) => String(a?.name || a).localeCompare(String(b?.name || b));
const byValue = (a, b) => String(a).localeCompare(String(b));

const initialState = {
  loading: false,
  data: [],
  error: null,
  severities: [],
  injuryTypes: [],
  projects: [], // [{ _id, name }]
  severityData: [], // Legacy field for backward compatibility
};

function bmInjuryReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_INJURIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_INJURIES_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };

    case FETCH_INJURIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_BM_INJURY_DATA_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_BM_INJURY_DATA_SUCCESS: {
      const payload = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, loading: false, data: payload, error: null };
    }

    case FETCH_BM_INJURY_DATA_FAILURE:
      return { ...state, loading: false, error: action.payload || 'Failed to fetch injury data' };

    case FETCH_BM_INJURY_SEVERITIES: {
      const arr = Array.isArray(action.payload) ? action.payload : [];
      const uniq = Array.from(new Set(arr)).sort(byValue);
      return { ...state, severities: uniq };
    }

    case FETCH_BM_INJURY_TYPES: {
      const arr = Array.isArray(action.payload) ? action.payload : [];
      const uniq = Array.from(new Set(arr)).sort(byValue);
      return { ...state, injuryTypes: uniq };
    }

    case FETCH_BM_INJURY_PROJECTS: {
      const raw = Array.isArray(action.payload) ? action.payload : [];
      const arr = raw
        .filter(p => p && (p._id || p.id) && (p.name || p.title))
        .map(p => ({ _id: p._id || p.id, name: p.name || p.title }));
      const map = new Map(arr.map(p => [String(p._id), p]));
      const projects = Array.from(map.values()).sort(byName);
      return { ...state, projects };
    }

    case RESET_BM_INJURY_DATA:
      return { ...state, data: [], error: null, loading: false };

    // Legacy action for backward compatibility
    case GET_INJURY_SEVERITY:
      return { ...state, severityData: action.payload };

    default:
      return state;
  }
}

// Legacy reducer function for backward compatibility
// eslint-disable-next-line default-param-last
export const bmInjurySeverityReducer = (severityData = [], action) => {
  if (action.type === GET_INJURY_SEVERITY) {
    return action.payload;
  }
  return severityData;
};
export default bmInjuryReducer;
