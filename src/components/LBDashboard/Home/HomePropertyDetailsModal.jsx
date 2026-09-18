/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';
import styles from './Home.module.css';
import { formatVillageLabel } from './homeFormatUtils';

function HomePropertyDetailsModal({ property, activeTab, onClose, onViewProperty }) {
  const hasAmenities = property.amenities && property.amenities.length > 0;

  return (
    <div className={styles.lbModalOverlay} onClick={onClose}>
      <div className={styles.lbPropertyDetailsModal} onClick={e => e.stopPropagation()}>
        <div className={styles.lbModalHeader}>
          <h3>{property.title}</h3>
          <div className={styles.lbCloseButtonWrapper}>
            <FaTimes className={styles.lbCloseButton} onClick={onClose} />
          </div>
        </div>
        <div className={`${styles.lbModalContent} ${styles.lbPropertyDetailsContent}`}>
          <div className={styles.lbPropertyDetailsImage}>
            <img src={property.images[0]} alt={property.title} />
          </div>
          <div className={styles.lbPropertyDetailsInfo}>
            <div className={styles.lbPropertyInfoItem}>
              <strong>Village:</strong> {formatVillageLabel(property.village)}
            </div>
            <div className={styles.lbPropertyInfoItem}>
              <strong>Price:</strong> ${property.price}/{property.perUnit}
            </div>
            <div className={styles.lbPropertyInfoItem}>
              <strong>Available From:</strong> {property.availableFrom.toLocaleDateString()}
            </div>
            <div className={styles.lbPropertyInfoItem}>
              <strong>Available To:</strong> {property.availableTo.toLocaleDateString()}
            </div>
            <div className={styles.lbPropertyDescription}>
              <strong>Description:</strong> {property.description}
            </div>
            {hasAmenities && (
              <div className={styles.lbPropertyAmenities}>
                <strong>Amenities:</strong>
                <ul>
                  {property.amenities.map((amenity, index) => (
                    <li key={`${amenity}-${index}`}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={styles.lbPropertyDetailsActions}>
            <button type="button" className={`${styles.lbActionButton} ${styles.lbContactButton}`}>
              Contact Owner
            </button>
            <button
              type="button"
              className={`${styles.lbActionButton} ${styles.lbBookButton}`}
              onClick={() => onViewProperty(property, activeTab)}
            >
              View Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

HomePropertyDetailsModal.propTypes = {
  property: PropTypes.shape({
    title: PropTypes.string,
    village: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    perUnit: PropTypes.string,
    availableFrom: PropTypes.instanceOf(Date),
    availableTo: PropTypes.instanceOf(Date),
    description: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string),
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  activeTab: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onViewProperty: PropTypes.func.isRequired,
};

export default HomePropertyDetailsModal;
