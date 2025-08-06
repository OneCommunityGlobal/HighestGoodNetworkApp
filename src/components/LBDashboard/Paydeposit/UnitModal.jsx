import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './UnitModal.module.css';

const ImageModal = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      size="xl" // <-- custom class to reduce width
    >
      {/* HEADER */}
      <Modal.Header className={styles.modalHeaderCustom}>
        <h2 className={styles.modalTitle}>More on this unit</h2>
        <span>
          <button onClick={onClose} className={styles.closeButton}>
            X
          </button>
        </span>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body className={styles.modalBodyCustom}>
        <div className={styles.modalContentWrapper}>
          {/* LEFT: IMAGE CAROUSEL */}
          <div className={styles.carouselContainer}>
            <img
              src={images[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className={styles.carouselImage}
            />
            <button onClick={prevImage} className={`${styles.carouselButton} ${styles.left}`}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button onClick={nextImage} className={`${styles.carouselButton} ${styles.right}`}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          {/* RIGHT: AMENITIES TEXT */}
          <div className={styles.textSection}>
            <h4>Available amenities in this Unit:</h4>
            <ol>
              <li>Artistic Interiors</li>
              <li>Private Rainwater Collection</li>
              <li>Solar-Powered Lighting and Charging</li>
            </ol>

            <h4>Village level amenities:</h4>
            <ol>
              <li>Central Tropical Atrium</li>
              <li>Eco-Showers and Toilets</li>
              <li>Solar Power Infrastructure</li>
              <li>Passive Heating and Cooling</li>
              <li>Community Gardens</li>
              <li>Rainwater Harvesting Systems</li>
              <li>Workshops and Demonstration Spaces</li>
            </ol>
          </div>
        </div>
      </Modal.Body>

      {/* FOOTER */}
      <Modal.Footer className={styles.modalFooterCustom}>
        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: 'red' }} />{' '}
        <button
          className={styles.propertyMapLink}
          onClick={() => {
            /* Add your map view logic here */
          }}
        >
          View on Property Map
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;
