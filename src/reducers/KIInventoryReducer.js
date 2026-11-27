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
  KI_INVENTORY_UPDATE_REQUEST,
  KI_INVENTORY_UPDATE_SUCCESS,
  KI_INVENTORY_UPDATE_FAILURE,
  KI_INVENTORY_DELETE_REQUEST,
  KI_INVENTORY_DELETE_SUCCESS,
  KI_INVENTORY_DELETE_FAILURE,
  KI_INVENTORY_REORDER_REQUEST,
  KI_INVENTORY_REORDER_SUCCESS,
  KI_INVENTORY_REORDER_FAILURE,
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
  updateItemLoading: false,
  updateItemError: null,
  deleteItemLoading: false,
  deleteItemError: null,
  reorderItemLoading: false,
  reorderItemError: null,
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

    // ── Update Item ───────────────────────────────────────────────────────
    case KI_INVENTORY_UPDATE_REQUEST:
      return { ...state, updateItemLoading: true, updateItemError: null };
    case KI_INVENTORY_UPDATE_SUCCESS:
      return { ...state, updateItemLoading: false, updateItemError: null };
    case KI_INVENTORY_UPDATE_FAILURE:
      return { ...state, updateItemLoading: false, updateItemError: action.payload };

    // ── Delete Item ───────────────────────────────────────────────────────
    case KI_INVENTORY_DELETE_REQUEST:
      return { ...state, deleteItemLoading: true, deleteItemError: null };
    case KI_INVENTORY_DELETE_SUCCESS:
      return { ...state, deleteItemLoading: false, deleteItemError: null };
    case KI_INVENTORY_DELETE_FAILURE:
      return { ...state, deleteItemLoading: false, deleteItemError: action.payload };

    // ── Reorder Item ──────────────────────────────────────────────────────
    case KI_INVENTORY_REORDER_REQUEST:
      return { ...state, reorderItemLoading: true, reorderItemError: null };
    case KI_INVENTORY_REORDER_SUCCESS:
      return { ...state, reorderItemLoading: false, reorderItemError: null };
    case KI_INVENTORY_REORDER_FAILURE:
      return { ...state, reorderItemLoading: false, reorderItemError: action.payload };

    default:
      return state;
  }
};

export default KIInventoryReducer;
