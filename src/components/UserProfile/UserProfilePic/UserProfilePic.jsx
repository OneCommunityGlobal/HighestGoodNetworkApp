// eslint-disable-next-line import/no-unresolved
import './userProfilePic.scss';
import React from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
import { Input } from 'reactstrap';
import Image from 'react-bootstrap/Image';
import PropTypes from 'prop-types';

function UserProfilePic({ userProfile, setUserProfile, canEdit }) {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const updateProfilePic = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (typeof file !== 'undefined') {
      const filesizeKB = file.size / 1024;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const allowedTypesString = `File type not permitted. Allowed types are ${allowedTypes
        .toString()
        .replaceAll(',', ', ')}`;

      // Input validation: file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(allowedTypesString);
        return;
      }

      // Input validation: file size.
      if (filesizeKB > 50) {
        const errorMessage = `The file you are trying to upload exceeds the maximum size of 50KB. You can either 
        choose a different file, or use an online file compressor.`;

        toast.error(errorMessage);
        return;
      }

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = () => {
        setUserProfile({ ...userProfile, profilePic: fileReader.result });
      };
    }
  };

  return (
    <div className="profile-img">
      <Image
        src={userProfile?.profilePic ? userProfile.profilePic : '/pfp-default.png'}
        alt="Profile Picture"
        roundedCircle
        className="profilePicture bg-white"
      />
      {canEdit ? (
        <div
          className="image-button file btn btn-lg btn-primary"
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Change Photo
          <Input
            style={{
              width: '100%',
              height: '100%',
              zIndex: '2',
              cursor: 'pointer',
            }}
            type="file"
            name="newProfilePic"
            id="newProfilePic"
            onChange={updateProfilePic}
            accept="image/png,image/jpeg, image/jpg"
          />
        </div>
      ) : null}
    </div>
  );
}

UserProfilePic.propTypes = {
  userProfile: PropTypes.object.isRequired,
  setUserProfile: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default UserProfilePic;
