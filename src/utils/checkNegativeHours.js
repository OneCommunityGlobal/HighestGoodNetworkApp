const checkNegativeNumber = userProfile => {
  if (userProfile.totalIntangibleHrs < 0) {
    userProfile.totalIntangibleHrs = 0;
  }
  if (userProfile.totalTangibleHrs < 0) {
    userProfile.totalTangibleHrs = 0;
  }
  Object.keys(userProfile.hoursByCategory).map(category => {
    if (userProfile.hoursByCategory[category] < 0) {
      userProfile.hoursByCategory[category] = 0;
    }
  });
};

export default checkNegativeNumber;
