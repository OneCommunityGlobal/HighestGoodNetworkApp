// ../Tools/ToolFiltersContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ToolFiltersContext = createContext(null);

const STORAGE_KEY = 'tools_filters_state';

// ✅ include ALL filter fields here
const defaultFilters = {
  selectedProject: 'all', // old Project filter
  selectedItem: 'all', // old Tool filter
  availableFilter: 'all', // new
  usingFilter: 'all', // new
  searchTerm: '', // new
  sortConfig: { key: null, direction: 'asc' }, // for header sorting
};

export function ToolFiltersProvider({ children }) {
  const [filters, setFilters] = useState(() => {
    // server / test environments
    if (typeof window === 'undefined') return defaultFilters;

    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultFilters;

      const parsed = JSON.parse(raw);

      // ✅ merge so new keys always exist
      return { ...defaultFilters, ...parsed };
    } catch (e) {
      return defaultFilters;
    }
  });

  // Save whenever any filter changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (e) {
      // ignore storage errors in case of private mode, etc.
    }
  }, [filters]);

  return (
    <ToolFiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </ToolFiltersContext.Provider>
  );
}

export function useToolFilters() {
  const ctx = useContext(ToolFiltersContext);
  if (!ctx) {
    throw new Error('useToolFilters must be used inside ToolFiltersProvider');
  }
  return ctx;
}
