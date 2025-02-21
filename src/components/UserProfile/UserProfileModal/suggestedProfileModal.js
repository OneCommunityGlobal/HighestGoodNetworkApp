import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import './UserProfileModal.css';  // For custom styling
import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { toast } from "react-toastify";

const ProfileImageModal = ({ isOpen, toggleModal, userProfile }) => {

  const [selectedImage, setSelectedImage] = useState(null);
  const suggestedProfilePics=userProfile.suggestedProfilePics;
  const handleImageSelect = (image) => {
    setSelectedImage(image);  // Store the selected image info
  };

<<<<<<< HEAD
  const updateProfileImage= async ()=>{
    try {
      let image=selectedImage.nitro_src!==undefined && selectedImage.nitro_src!==null?selectedImage.nitro_src:selectedImage.src;
=======
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
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
      await axios.put(ENDPOINTS.USERS_UPDATE_PROFILE_FROM_WEBSITE,{'selectedImage':image,'user_id':userProfile._id})
      toast.success("Profile Image Updated")
    }    
     catch (error) {
        console.log(error)
        toast.error("Image Update Failed")
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={toggleModal}>
      <ModalHeader toggle={toggleModal}>Select a Profile Image</ModalHeader>
      <ModalBody>
        <div className="suggestedProfileLinks scrollable-container">
          {suggestedProfilePics.map((image, index) => (
            <div
              key={index}
              className={`suggestedProfileTile ${selectedImage === image ? 'selected' : ''}`}
              onClick={() => handleImageSelect(image)}
            >
<<<<<<< HEAD
              <img src={image.nitro_src!==undefined && image.nitro_src!==null?image.nitro_src:image.src} alt={image.alt} />
=======
              <img src={getImageSource(image)} alt={image.alt} />
>>>>>>> d7a6cdf1f4be691e47486562ab67fed6f89cf1fc
            </div>
          ))}
        </div>
        
        <div className="button-group">
          <Button color="secondary" onClick={toggleModal} className="modal-button">
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
            className="modal-button"
          >
            Set Image
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ProfileImageModal;
