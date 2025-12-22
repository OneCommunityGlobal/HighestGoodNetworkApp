// ToolItemListView.jsx

import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import BMError from '../shared/BMError';
import SelectForm from '../ItemList/SelectForm';
import SelectItem from '../ItemList/SelectItem';
import ToolItemsTable from './ToolItemsTable';
import styles from './ToolItemListView.module.css';
import { ToolFiltersProvider, useToolFilters } from '../Tools/ToolFiltersContext';

// Same logic as ToolItemsTable for Using / Available
const isItemUsing = item =>
  Array.isArray(item.itemType?.using) && item.itemType.using.includes(item._id);

const isItemAvailable = item =>
  Array.isArray(item.itemType?.available) &&
  item.itemType.available.includes(item._id) &&
  item.condition !== 'Lost' &&
  item.condition !== 'Needs Replacing';

// helper to normalize many possible truthy / falsy formats
const toBool = raw => {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;

  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    if (['yes', 'y', 'true', 't', '1'].includes(v)) return true;
    if (['no', 'n', 'false', 'f', '0'].includes(v)) return false;
  }
  return undefined; // unknown
};

function ToolItemListViewInner({ itemType, items, errors = {}, UpdateItemModal, dynamicColumns }) {
  const [filteredItems, setFilteredItems] = useState(items || []);
  const [isError, setIsError] = useState(false);

  // theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // read dark / light from body class
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkDark = () => {
      const className = document.body.className || '';
      // treat ANY body class that contains "dark" (case-insensitive) as dark-mode
      return /dark/i.test(className);
    };

    // initial value
    setIsDarkMode(checkDark());

    // watch for body class changes when the user toggles theme
    const observer = new MutationObserver(() => {
      setIsDarkMode(checkDark());
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const { filters, setFilters } = useToolFilters();
  const {
    selectedProject,
    selectedItem,
    availableFilter,
    usingFilter,
    toolStatusFilter,
    conditionFilter,
    searchTerm,
    sortConfig,
  } = filters;

  useEffect(() => {
    setIsError(Object.entries(errors).length > 0);
  }, [errors]);

  // Compute list of unique conditions for dropdown
  const conditionOptions = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return [...new Set(items.map(i => i.condition).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
  }, [items]);

  const processedItems = useMemo(() => {
    if (!items) return [];
    let data = [...items];

    // 1) Project filter
    if (selectedProject !== 'all') {
      data = data.filter(item => item.project?.name === selectedProject);
    }

    // 2) Tool type filter
    if (selectedItem !== 'all') {
      data = data.filter(item => item.itemType?.name === selectedItem);
    }

    // 3) Available filter
    if (availableFilter !== 'all') {
      const wantAvailable = availableFilter === 'yes';
      data = data.filter(item => isItemAvailable(item) === wantAvailable);
    }

    // 4) Using filter
    if (usingFilter !== 'all') {
      const wantUsing = usingFilter === 'yes';
      data = data.filter(item => isItemUsing(item) === wantUsing);
    }

    // 4.5) Tool Status (from upstream requirement)
    if (toolStatusFilter && toolStatusFilter !== 'all') {
      data = data.filter(item => {
        if (toolStatusFilter === 'using') return isItemUsing(item);
        if (toolStatusFilter === 'available') return isItemAvailable(item);
        if (toolStatusFilter === 'underMaintenance') {
          return (
            item.condition === 'Worn' ||
            item.condition === 'Damaged' ||
            item.condition === 'Needs Repair'
          );
        }
        return true;
      });
    }

    // 4.6) Condition (from upstream requirement)
    if (conditionFilter && conditionFilter !== 'all') {
      data = data.filter(item => item.condition === conditionFilter);
    }

    // 5) Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => {
        const candidates = [
          item.name,
          item.itemType?.name,
          item.project?.name,
          item.code ?? item.Code,
          item.condition,
        ];
        return candidates.some(v => typeof v === 'string' && v.toLowerCase().includes(term));
      });
    }

    // 6) Sorting (your existing switch)
    if (sortConfig?.key) {
      const { key, direction } = sortConfig;
      const mult = direction === 'asc' ? 1 : -1;

      data.sort((a, b) => {
        let aVal;
        let bVal;

        switch (key) {
          case 'project':
            aVal = a.project?.name || '';
            bVal = b.project?.name || '';
            break;
          case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            break;
          case 'bought':
            aVal = a.bought || a.Bought || '';
            bVal = b.bought || b.Bought || '';
            break;
          case 'using':
            aVal = toBool(a.using ?? a.inUse ?? a.Using) ? 1 : 0;
            bVal = toBool(b.using ?? b.inUse ?? b.Using) ? 1 : 0;
            break;
          case 'available':
            aVal = toBool(a.available ?? a.isAvailable ?? a.Available) ? 1 : 0;
            bVal = toBool(b.available ?? b.isAvailable ?? b.Available) ? 1 : 0;
            break;
          case 'condition':
            aVal = a.condition || '';
            bVal = b.condition || '';
            break;
          case 'code':
            aVal = a.code || a.Code || '';
            bVal = b.code || b.Code || '';
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return -1 * mult;
        if (aVal > bVal) return 1 * mult;
        return 0;
      });
    }

    return data;
  }, [
    items,
    selectedProject,
    selectedItem,
    availableFilter,
    usingFilter,
    toolStatusFilter,
    conditionFilter,
    searchTerm,
    sortConfig,
  ]);

  useEffect(() => {
    setFilteredItems(processedItems);
  }, [processedItems]);

  const updateFilter = patch =>
    setFilters(prev => ({
      ...prev,
      ...patch,
    }));

  const handleSort = columnKey => {
    updateFilter({
      sortConfig:
        sortConfig?.key === columnKey
          ? { key: columnKey, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' }
          : { key: columnKey, direction: 'asc' },
    });
  };

  if (isError) {
    return (
      <main className={`${styles.itemsListContainer} ${styles.lightTheme}`}>
        <h2>{itemType} List</h2>
        <BMError errors={errors} />
      </main>
    );
  }

  const themeClass = isDarkMode ? styles.darkTheme : styles.lightTheme;

  return (
    <main className={`${styles.itemsListContainer} ${themeClass}`}>
      <h3>{itemType}</h3>
      <section>
        {items && (
          <div className={styles.filtersRow}>
            {/* Row 1: Project + Tool */}
            <div className={styles.projectToolColumn}>
              <div className={styles.filterGroup}>
                <SelectForm
                  items={items}
                  selectedProject={selectedProject}
                  selectedItem={selectedItem}
                  setSelectedProject={value => updateFilter({ selectedProject: value })}
                  setSelectedItem={value => updateFilter({ selectedItem: value })}
                />
              </div>

              <div className={styles.filterGroup}>
                <SelectItem
                  items={items}
                  selectedProject={selectedProject}
                  selectedItem={selectedItem}
                  setSelectedItem={value => updateFilter({ selectedItem: value })}
                  label="Tool"
                />
              </div>
            </div>

            {/* Row 2: Available / Using / Tool Status / Condition / Search */}
            <div className={styles.availSearchColumn}>
              <div className={styles.availSearchRow}>
                <div className={styles.availUsingGroup}>
                  <div className={styles.filterGroupSmall}>
                    <label className={styles.filterLabel} htmlFor="available-filter">
                      Available
                    </label>
                    <select
                      id="available-filter"
                      className={styles.filterSelect}
                      value={availableFilter}
                      onChange={e => updateFilter({ availableFilter: e.target.value })}
                    >
                      <option value="all">All</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className={styles.filterGroupSmall}>
                    <label className={styles.filterLabel} htmlFor="using-filter">
                      Using
                    </label>
                    <select
                      id="using-filter"
                      className={styles.filterSelect}
                      value={usingFilter}
                      onChange={e => updateFilter({ usingFilter: e.target.value })}
                    >
                      <option value="all">All</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  <div className={styles.filterGroupSmall}>
                    <label className={styles.filterLabel} htmlFor="tool-status-filter">
                      Tool Status
                    </label>
                    <select
                      id="tool-status-filter"
                      className={styles.filterSelect}
                      value={toolStatusFilter || 'all'}
                      onChange={e => updateFilter({ toolStatusFilter: e.target.value })}
                    >
                      <option value="all">All</option>
                      <option value="using">Using</option>
                      <option value="available">Available</option>
                      <option value="underMaintenance">Under Maintenance</option>
                    </select>
                  </div>

                  <div className={styles.filterGroupSmall}>
                    <label className={styles.filterLabel} htmlFor="condition-filter">
                      Condition
                    </label>
                    <select
                      id="condition-filter"
                      className={styles.filterSelect}
                      value={conditionFilter || 'all'}
                      onChange={e => updateFilter({ conditionFilter: e.target.value })}
                    >
                      <option value="all">All</option>
                      {conditionOptions.map(cond => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
                  <label className={styles.filterLabel} htmlFor="tool-search">
                    Tool Name
                  </label>
                  <input
                    id="tool-search"
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by name…"
                    value={searchTerm}
                    onChange={e => updateFilter({ searchTerm: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {filteredItems && (
          <ToolItemsTable
            selectedProject={selectedProject}
            selectedItem={selectedItem}
            filteredItems={filteredItems}
            UpdateItemModal={UpdateItemModal}
            dynamicColumns={dynamicColumns}
            onSort={handleSort}
            sortConfig={sortConfig}
          />
        )}
      </section>
    </main>
  );
}

ToolItemListViewInner.propTypes = {
  itemType: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ).isRequired,
  errors: PropTypes.shape({
    message: PropTypes.string,
  }),
  UpdateItemModal: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]),
  dynamicColumns: PropTypes.array,
};

ToolItemListViewInner.defaultProps = {
  itemType: 'Tools',
  errors: {},
  UpdateItemModal: null,
  dynamicColumns: [],
};

export function ToolItemListView(props) {
  return (
    <ToolFiltersProvider>
      <ToolItemListViewInner {...props} />
    </ToolFiltersProvider>
  );
}

export default ToolItemListView;
