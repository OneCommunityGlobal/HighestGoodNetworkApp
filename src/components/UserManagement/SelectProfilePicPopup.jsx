import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { boxStyle } from 'styles';
import { toast } from 'react-toastify';
import { getUserProfile, updateUserProfile } from '../../actions/userProfile';
import { connect, useDispatch, useSelector } from 'react-redux';

/**
 * Modal popup to show the user profile picture
 */
const SelectProfilePicPopUp = React.memo(props => {
  const [selectedPic, setSelectedPic] = useState();
  const [newPic, setNewPic] = useState();
  const storedPics = props.user?.storedPics;
  const profilePic = props.user?.profilePic;
  const userProfile = useSelector(state => state.userProfile);

  const closePopup = e => {
    props.onClose();
  };

  /****
   * Remaining Problem: cannot selct the added url because it does not pass the
   * validateProfilePic function in the userHelper.js, which should be further
   * modified for the new feature.
   *  ****/
  const saveChange = async e => {
    try {
      await props.getUserProfile(props.user._id);
      console.log(selectedPic[0])
      const updatedProfile = {
        ...userProfile,
        profilePic: selectedPic[0],
      };
      await props.updateUserProfile(userProfile._id, updatedProfile);
      toast.success('Picture selected has been saved as profile photo.');
    } catch (err) {
      console.log(err);
      toast.error('Failed to update the profile picture.');
    }
  };

  const addPic = e => {
    const newURL = [document.getElementById('newProfilePicURL').value];
    setNewPic(newURL);
  };

  const selectPic = async (pic, id) => {
    await props.getUserProfile(props.user._id);
    console.log(userProfile)
    const selected = [pic].flat();
    setSelectedPic(selected);
    document.querySelectorAll('.dashboardimg').forEach(element => {
      element.style.border = '';
    });
    document.getElementById(id).style.border = '3px solid red';
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} autoFocus={false}>
      <ModalHeader toggle={closePopup}>Select Your Profile Picture</ModalHeader>
      <ModalBody>
        <b>Please choose the profile picture:</b>
        <div>
          {
            (Array.isArray(profilePic) && profilePic.length > 0) ?
              profilePic.map((pic, index) => (
                <img
                  src={`${pic || '/pfp-default-header.png'}`}
                  alt=""
                  style={{ maxWidth: '60px', maxHeight: '60px' }}
                  className="dashboardimg"
                  key={`pic_fetched_'+${index}`}
                  id={`pic_fetched_'+${index}`}
                  onClick={e => selectPic(pic, `pic_fetched_'+${index}`)}
                />
              ))
              :
              (Array.isArray(storedPics) && storedPics.length > 0) ?
                storedPics.map((pic, index) => (
                  <img
                    src={`${pic || '/pfp-default-header.png'}`}
                    alt=""
                    style={{ maxWidth: '60px', maxHeight: '60px' }}
                    className="dashboardimg"
                    key={`pic_fetched_'+${index}`}
                    id={`pic_fetched_'+${index}`}
                    onClick={e => selectPic(pic, `pic_fetched_'+${index}`)}
                  />
                ))
                :
                null
          }
          {newPic && (
            <img
              src={`${newPic || '/pfp-default-header.png'}`}
              alt=""
              style={{ maxWidth: '60px', maxHeight: '60px' }}
              className="dashboardimg"
              key={`pic_added`}
              id={`pic_added`}
              onClick={e => selectPic(newPic, `pic_added`)}
            />
          )}
        </div>
        <p>Cannot find any? Add an image:</p>

        <input
          type="url"
          name="url"
          id="newProfilePicURL"
          placeholder="https://example.com"
          pattern="https://.*"
          size="30"
          required
        />
        <Button color="primary" onClick={addPic} style={boxStyle} id="add_url">
          Add
        </Button>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={saveChange} style={boxStyle}>
          Save
        </Button>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

const mapStateToProps = state => state;

export default connect(mapStateToProps, {
  getUserProfile,
  updateUserProfile,
})(SelectProfilePicPopUp);
