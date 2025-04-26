import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import './UserProfileModal.css'; // For custom styling
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../utils/URL';

function ProfileImageModal({ isOpen, toggleModal, userProfile }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const { suggestedProfilePics } = userProfile;
  const handleImageSelect = image => {
    setSelectedImage(image); // Store the selected image info
  };

  function getImageSource(image) {
    if (image.nitro_src !== null && image.nitro_src !== undefined) {
      return image.nitro_src;
    }
    if (image.src && image.src.startsWith('http')) {
      return image.src;
    }
    if (image.data_src !== undefined) {
      return image.data_src;
    }
    return null; // Return null if no valid source is found
  }

  const updateProfileImage = async () => {
    try {
      const image = getImageSource(selectedImage);
      await axios.put(ENDPOINTS.USERS_UPDATE_PROFILE_FROM_WEBSITE, {
        selectedImage: image,
        user_id: userProfile._id,
      });
      toast.success('Profile Image Updated');
    } catch (error) {
      toast.error('Image Update Failed');
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Select a Profile Image</ModalHeader>
      <ModalBody>
        <div className="suggestedProfileLinks scrollable-container">
          {suggestedProfilePics.map(image => {
            const imageKey = getImageSource(image);
            return (
              <div
                key={imageKey}
                className={`suggestedProfileTile ${selectedImage === image ? 'selected' : ''}`}
                onClick={() => handleImageSelect(image)}
              >
                <img src={getImageSource(image)} alt={image.alt} />
              </div>
            );
          })}
        </div>

        <div className="button-group">
          <Button color="secondary" onClick={toggleModal} className="modal-button">
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (selectedImage) {
                toggleModal(); // Close the modal after setting the image
                updateProfileImage();
              }
            }}
            className="modal-button"
          >
            Set Image
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}

export default ProfileImageModal;
