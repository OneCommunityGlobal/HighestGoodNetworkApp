import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import styles from './UserProfileModal.module.css';  // For custom styling
import axios from "axios";
import { ENDPOINTS } from "~/utils/URL";
import { toast } from "react-toastify";

const ProfileImageModal = ({ isOpen, toggleModal, userProfile }) => {

  const [selectedImage, setSelectedImage] = useState(null);
  const suggestedProfilePics=userProfile.suggestedProfilePics;
  const handleImageSelect = (image) => {
    setSelectedImage(image);  // Store the selected image info
  };

  function getImageSource(image) {
    if (image.nitro_src !== null && image.nitro_src !== undefined) {
      return image.nitro_src;
    } else if (image.src && image.src.startsWith("http")) {
      return image.src;
    } else if (image.data_src !== undefined) {
      return image.data_src;
    }
    return null; // Return null if no valid source is found
  }

  const updateProfileImage= async ()=>{
    try {
      let image=getImageSource(selectedImage);
      await axios.put(ENDPOINTS.USERS_UPDATE_PROFILE_FROM_WEBSITE,{'selectedImage':image,'user_id':userProfile._id})
      toast.success("Profile Image Updated")
    }    
     catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
        toast.error("Image Update Failed")
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Select a Profile Image</ModalHeader>
      <ModalBody>
        <div className={`${styles.suggestedProfileLinks} ${styles['scrollable-container']}`}>
          {suggestedProfilePics.map((image, index) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={index}
              className={`${styles.suggestedProfileTile} ${selectedImage === image ? styles.selected : ''}`}
              onClick={() => handleImageSelect(image)}
            >
              <img src={getImageSource(image)} alt={image.alt} />
            </div>
          ))}
        </div>
        
        <div className={`${styles['button-group']}`}>
          <Button color="secondary" onClick={toggleModal} className={`${styles['modal-button']}`}>
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (selectedImage) {
                toggleModal();  // Close the modal after setting the image
                updateProfileImage()
              }
            }}
            className={`${styles['modal-button']}`}
          >
            Set Image
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProfileImageModal;
