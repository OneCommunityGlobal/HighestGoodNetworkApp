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
  KI_INVENTORY_ADD_REQUEST,
  KI_INVENTORY_ADD_SUCCESS,
  KI_INVENTORY_ADD_FAILURE,
} from '../constants/KIInventoryConstants';

const initialState = {
  items: [],
  preservedItems: [],
  stats: { totalItems: 0, criticalStock: 0, lowStock: 0 },
  loading: false,
  statsLoading: false,
  preservedLoading: false,
  addItemLoading: false,
  addItemError: null,
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

    // ── Add Item ──────────────────────────────────────────────────────────
    case KI_INVENTORY_ADD_REQUEST:
      return { ...state, addItemLoading: true, addItemError: null };
    case KI_INVENTORY_ADD_SUCCESS:
      return { ...state, addItemLoading: false, addItemError: null };
    case KI_INVENTORY_ADD_FAILURE:
      return { ...state, addItemLoading: false, addItemError: action.payload };

    default:
      return state;
  }
};

export default KIInventoryReducer;
