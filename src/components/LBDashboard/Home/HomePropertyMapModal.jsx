/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import styles from './Home.module.css';
import { formatVillageLabel } from './homeFormatUtils';

function HomePropertyMapModal({
  unitIcon,
  selectedVillage,
  mapItems,
  paginatedVillages,
  filteredVillages,
  villageSearchTerm,
  villagePagination,
  totalVillagePages,
  onClose,
  onMarkerClick,
  onViewDetails,
  onVillageSearchChange,
  onVillagePagePrev,
  onVillagePageNext,
  onVillageChipClick,
}) {
  const showVillagePagination = filteredVillages.length > villagePagination.pageSize;

  return (
    <div className={styles.lbModalOverlay} onClick={onClose}>
      <div className={styles.lbPropertyMapModal} onClick={e => e.stopPropagation()}>
        <div className={styles.lbModalHeader}>
          <h3>
            Property Map
            {selectedVillage && ` - ${formatVillageLabel(selectedVillage)}`}
          </h3>
          <div className={styles.lbCloseButtonWrapper}>
            <FaTimes className={styles.lbCloseButton} onClick={onClose} />
          </div>
        </div>
        <div className={styles.lbModalContent}>
          <MapContainer
            center={[37.7749, -122.4194]}
            zoom={13}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mapItems.map(unit => (
              <Marker
                key={`unit-${unit.id}`}
                position={[unit.coordinates[1], unit.coordinates[0]]}
                icon={unitIcon}
                eventHandlers={{ click: () => onMarkerClick(unit) }}
              >
                <Popup>
                  <div className={styles.lbMapPopup}>
                    <h4>{unit.title}</h4>
                    <p>{formatVillageLabel(unit.village)}</p>
                    <p>
                      ${unit.price}/{unit.perUnit}
                    </p>
                    <button
                      type="button"
                      className={styles.lbViewDetailsButton}
                      onClick={e => {
                        e.stopPropagation();
                        onViewDetails(unit);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className={styles.lbMapLegend}>
            <h4>Villages</h4>
            <div className={styles.lbVillageSearch}>
              <input
                type="text"
                className={styles.lbVillageSearchInput}
                placeholder="Search villages..."
                value={villageSearchTerm}
                onChange={e => onVillageSearchChange(e.target.value)}
              />
            </div>
            <div className={styles.lbVillageChips}>
              {paginatedVillages.map(village => (
                <div
                  key={village}
                  className={`lb-village-chip ${selectedVillage === village ? 'active' : ''}`}
                  onClick={() => onVillageChipClick(village)}
                >
                  {village}
                </div>
              ))}
            </div>
            {showVillagePagination && (
              <div className={styles.lbVillagePagination}>
                <button
                  type="button"
                  className={styles.lbPaginationButton}
                  disabled={villagePagination.currentPage === 1}
                  onClick={onVillagePagePrev}
                >
                  Previous
                </button>
                <span className={styles.lbPaginationInfo}>
                  Page {villagePagination.currentPage} of {totalVillagePages}
                </span>
                <button
                  type="button"
                  className={styles.lbPaginationButton}
                  disabled={villagePagination.currentPage === totalVillagePages}
                  onClick={onVillagePageNext}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

HomePropertyMapModal.propTypes = {
  unitIcon: PropTypes.object.isRequired,
  selectedVillage: PropTypes.string,
  mapItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  paginatedVillages: PropTypes.arrayOf(PropTypes.string).isRequired,
  filteredVillages: PropTypes.arrayOf(PropTypes.string).isRequired,
  villageSearchTerm: PropTypes.string.isRequired,
  villagePagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
  }).isRequired,
  totalVillagePages: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onVillageSearchChange: PropTypes.func.isRequired,
  onVillagePagePrev: PropTypes.func.isRequired,
  onVillagePageNext: PropTypes.func.isRequired,
  onVillageChipClick: PropTypes.func.isRequired,
};

HomePropertyMapModal.defaultProps = {
  selectedVillage: '',
};

export default HomePropertyMapModal;
