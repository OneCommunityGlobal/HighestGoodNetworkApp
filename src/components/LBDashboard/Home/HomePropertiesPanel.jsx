/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import styles from './Home.module.css';
import { formatVillageLabel } from './homeFormatUtils';

function HomePropertiesPanel({
  isLoading,
  error,
  currentItems,
  viewMode,
  pagination,
  pageSizeOptions,
  onPropertySelect,
  onPageChange,
  onPageSizeChange,
}) {
  if (isLoading) {
    return <div className={styles.lbLoadingIndicator}>Loading properties...</div>;
  }

  if (error) {
    return <div className={styles.lbErrorMessage}>{error}</div>;
  }

  if (currentItems.length === 0) {
    return (
      <div className={styles.lbNoResults}>
        No properties found matching your criteria. Try adjusting your filters.
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.lbPropertiesContainer} ${styles[`lb${viewMode}View`]}`}>
        {currentItems.map(unit => (
          <div
            key={unit.id}
            className={styles.lbPropertyCard}
            onClick={() => onPropertySelect(unit)}
          >
            <div className={styles.lbPropertyImage}>
              <img
                src={unit.images[0]}
                alt={unit.title}
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://picsum.photos/seed/lb-fallback/600/400';
                }}
              />
            </div>
            <div className={styles.lbPropertyDetails}>
              <div>
                <h3>{unit.title}</h3>
                <p>{formatVillageLabel(unit.village)}</p>
              </div>
              <div className={`${styles.lbPrice} ${unit.isBidding ? styles.lbBiddingPrice : ''}`}>
                ${unit.price}/{unit.perUnit}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.lbPaginationControls}>
        <button
          type="button"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className={styles.lbPaginationButton}
        >
          Prev
        </button>
        <span className={styles.lbPaginationInfo}>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
          className={styles.lbPaginationButton}
        >
          Next
        </button>
        <div className={styles.lbPageSizeSelector}>
          <span>Show:</span>
          <select value={pagination.pageSize} onChange={onPageSizeChange}>
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

HomePropertiesPanel.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  currentItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  viewMode: PropTypes.string.isRequired,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
  }).isRequired,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPropertySelect: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
};

HomePropertiesPanel.defaultProps = {
  error: null,
};

export default HomePropertiesPanel;
