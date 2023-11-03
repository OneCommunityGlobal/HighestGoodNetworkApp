  //this function reconciles total hoursByCategory with total savedTangibleHrs and with totalTangibleHrs after the numbers got messed up as a result of a previous bug

  const fixDiscrepancy = userProfile => {

    const { savedTangibleHrs, hoursByCategory } = userProfile;

    const sumOfsavedTangibleHrs = savedTangibleHrs.reduce((acc, curr) => acc + curr, 0);
   
    //the following is needed because currently totalTangibleHrs shows a random number which may be more or less than actual sumOfsavedTangibleHrs
    
    userProfile.totalTangibleHrs = sumOfsavedTangibleHrs
    
    const sumOfhoursByCategory = Object.values(hoursByCategory).reduce((acc, curr) => acc + curr, 0);

    if (sumOfhoursByCategory < userProfile.totalTangibleHrs) {
      let difference = userProfile.totalTangibleHrs - sumOfhoursByCategory
      hoursByCategory['unassigned'] += difference
    }
  }

export default fixDiscrepancy;