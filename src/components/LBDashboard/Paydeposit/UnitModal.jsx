import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight , faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import "./UnitModal.css";

const ImageModal = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      size="xl" // <-- custom class to reduce width
    >
      {/* HEADER */}
      <Modal.Header className="modal-header-custom">
        <h2 className="modal-title">More on this unit</h2>
        <span>
        <button onClick={onClose} className="close-button">X</button>
        </span>
      </Modal.Header>

      {/* BODY */}
      <Modal.Body className="modal-body-custom">
        <div className="modal-content-wrapper">
          {/* LEFT: IMAGE CAROUSEL */}
          <div className="carousel-container">
            <img 
              src={images[currentIndex]} 
              alt={`Slide ${currentIndex + 1}`} 
              className="carousel-image" 
            />
            <button onClick={prevImage} className="carousel-button left">
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button onClick={nextImage} className="carousel-button right">
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          {/* RIGHT: AMENITIES TEXT */}
          <div className="text-section">
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
      <Modal.Footer className="modal-footer-custom">
      <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: "red" }} /> <a href="#" className="property-map-link">View on Property Map</a>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;