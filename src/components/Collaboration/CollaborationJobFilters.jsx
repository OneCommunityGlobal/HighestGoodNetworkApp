import React from 'react';
import styles from './Collaboration.module.css';

function CollaborationJobFilters({
  query,
  handleSearch,
  handleSubmit,
  canReorderJobs,
  toggleReorderModal,
  showTooltip,
  tooltipPosition,
  dismissSearchTooltip,
  dismissCategoryTooltip,
  dropdownRef,
  isDropdownOpen,
  setIsDropdownOpen,
  categories,
  selectedCategories,
  toggleCategory,
}) {
  return (
    <nav className={styles.jobNavbar}>
      <div className={styles.jobNavbarLeft}>
        <form className={styles.jobSearchForm} onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            placeholder="Search by title..."
            onChange={handleSearch}
          />

          <button className="btn btn-secondary" type="submit">
            Go
          </button>

          {canReorderJobs && (
            <button
              className={`btn btn-secondary ${styles.reorderButton}`}
              type="button"
              onClick={toggleReorderModal}
            >
              Edit to Reorder
            </button>
          )}
        </form>

        {showTooltip && tooltipPosition === 'search' && (
          <div className={styles.jobTooltip}>
            <p>Use the search bar to refine your search further!</p>
            <button
              type="button"
              onClick={dismissSearchTooltip}
              className={styles.jobTooltipDismiss}
            >
              Got it
            </button>
          </div>
        )}
      </div>

      <div className={styles.jobNavbarRight} ref={dropdownRef}>
        <button
          type="button"
          className={styles.dropdownButton}
          onClick={() => setIsDropdownOpen(prev => !prev)}
        >
          {selectedCategories.length === 0
            ? 'Select Categories ▼'
            : `${selectedCategories.length} selected ▼`}
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            {categories.map(cat => (
              <label key={cat} className={styles.dropdownItem}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        )}

        {showTooltip && tooltipPosition === 'category' && (
          <div className={`${styles.jobTooltip} ${styles.categoryTooltip}`}>
            <p>Use the categories to refine your search further!</p>
            <button
              type="button"
              className={styles.jobTooltipDismiss}
              onClick={dismissCategoryTooltip}
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default CollaborationJobFilters;
