let getUserProfile_result;
const getUserProfileOptions = {
  userProfile: {
    name: 'Foobar',
    profilePic: undefined,
    userId: '5be0952c633dae0016081b4b',
  },
};

getUserProfile.__setValue = option => {
  getUserProfile_result = getUserProfileOptions[option];
};

export function getUserProfile() {
  return getUserProfile_result;
}
