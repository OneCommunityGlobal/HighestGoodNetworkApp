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

  const updateProfileImage= async ()=>{
    try {
      let image=selectedImage.nitro_src!==undefined && selectedImage.nitro_src!==null?selectedImage.nitro_src:selectedImage.src;
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
              <img src={image.nitro_src!==undefined && image.nitro_src!==null?image.nitro_src:image.src} alt={image.alt} />
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
