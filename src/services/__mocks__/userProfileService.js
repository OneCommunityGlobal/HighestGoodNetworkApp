let getUserProfileResult;
const getUserProfileOptions = {
  userProfile: {
    name: 'Foobar',
    profilePic: undefined,
    userId: '5be0952c633dae0016081b4b',
  },
};

// eslint-disable-next-line no-use-before-define
getUserProfile.__setValue = option => {
  getUserProfileResult = getUserProfileOptions[option];
};

function getUserProfile() {
  return getUserProfileResult;
}

export default getUserProfile;
