import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import './UserProfileModal.css';  // For custom styling
import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { toast } from "react-toastify";
import { useEffect } from "react";

const ProfileImageModal = ({ isOpen, toggleModal, userProfile }) => {

  const [selectedImage, setSelectedImage] = useState(null);
  const suggestedProfilePics=userProfile.suggestedProfilePics;
  const [allImages,setAllImages]=useState(suggestedProfilePics);
  const [flag,setFlag]=useState(false)
  // Function to handle image selection
  
  const handleImageSelect = (image) => {
    setSelectedImage(image);  // Store the selected image info
  };
  
  
  async function imageUrlToPngBase64(url) {
    try {
      // Fetch the image as a buffer
      const response = await axios.get(url, { responseType: "arraybuffer" });
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch the image: ${response.statusText}`);
      }
      
      const imageBuffer = Buffer.from(response.data);
      
      // Convert the image to PNG format using sharp
      const pngBuffer = await sharp(imageBuffer).png().toBuffer();
      
      // Convert the PNG buffer to a base64 string
      const base64Png = pngBuffer.toString("base64");
      
      return `data:image/png;base64,${base64Png}`;;
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
      return null;
    }
  }

  useEffect(()=>{
    if(suggestedProfilePics.length!==0 && allImages[0].nitro_src===undefined){
      console.log("Inside");
      var values=allImages;
      for(let i=0;i<values.length;i++){
        imageUrlToPngBase64(values[i].src).then((resolve)=>{
          values[i].nitro_src=resolve;
        })
      }
      setAllImages(values)
      setFlag(true)
    }
  },[allImages])

  const updateProfileImage= async ()=>{
    try {
        await axios.put(ENDPOINTS.USERS_UPDATE_PROFILE_FROM_WEBSITE,{'selectedImage':selectedImage,'user_id':userProfile._id})
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
              <img src={flag?image.nitro_src:image.nitro_src} alt={image.alt}  />
              {/* <p>{image.title!==undefined && image.title.trim()!==""?image.title:image.alt.split(" ").slice(0, 3).join(" ")}</p> */}
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
