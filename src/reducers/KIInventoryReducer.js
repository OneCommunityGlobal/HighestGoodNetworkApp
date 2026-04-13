import {
  KI_INVENTORY_FETCH_REQUEST,
  KI_INVENTORY_FETCH_SUCCESS,
  KI_INVENTORY_FETCH_FAILURE,
  KI_INVENTORY_STATS_REQUEST,
  KI_INVENTORY_STATS_SUCCESS,
  KI_INVENTORY_STATS_FAILURE,
  KI_PRESERVED_ITEMS_REQUEST,
  KI_PRESERVED_ITEMS_SUCCESS,
  KI_PRESERVED_ITEMS_FAILURE,
} from '../constants/KIInventoryConstants';

const initialState = {
  items: [],
  preservedItems: [],
  stats: { totalItems: 0, criticalStock: 0, lowStock: 0 },
  loading: false,
  statsLoading: false,
  preservedLoading: false,
  error: null,
};

const KIInventoryReducer = (state = initialState, action) => {
  switch (action.type) {
    // ── Items ──────────────────────────────────────────────────────────────
    case KI_INVENTORY_FETCH_REQUEST:
      return { ...state, loading: true, error: null };
    case KI_INVENTORY_FETCH_SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case KI_INVENTORY_FETCH_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // ── Stats ──────────────────────────────────────────────────────────────
    case KI_INVENTORY_STATS_REQUEST:
      return { ...state, statsLoading: true };
    case KI_INVENTORY_STATS_SUCCESS:
      return { ...state, statsLoading: false, stats: action.payload };
    case KI_INVENTORY_STATS_FAILURE:
      return { ...state, statsLoading: false };

    // ── Preserved Items ────────────────────────────────────────────────────
    case KI_PRESERVED_ITEMS_REQUEST:
      return { ...state, preservedLoading: true };
    case KI_PRESERVED_ITEMS_SUCCESS:
      return { ...state, preservedLoading: false, preservedItems: action.payload };
    case KI_PRESERVED_ITEMS_FAILURE:
      return { ...state, preservedLoading: false };

    default:
      return state;
  }
};

export default KIInventoryReducer;
