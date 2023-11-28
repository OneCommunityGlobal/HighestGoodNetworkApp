
export const calculateAnniversaryDate = (createdDate) => {
  let dt = new Date(createdDate)
  const sixMonthAnniversary = dt.setMonth(dt.getMonth() + 6)
  const oneWeekAfter6M = new Date(sixMonthAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const oneYearAnniversary = dt.setFullYear(dt.getFullYear() + 1)
  const oneWeekAfter1Y = new Date(oneYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const twoYearAnniversary = dt.setFullYear(dt.getFullYear() + 2)
  const oneWeekAfter2Y = new Date(twoYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const threeYearAnniversary = dt.setFullYear(dt.getFullYear() + 3)
  const oneWeekAfter3Y = new Date(threeYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const fourYearAnniversary = dt.setFullYear(dt.getFullYear() + 4)
  const oneWeekAfter4Y = new Date(fourYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const fiveYearAnniversary = dt.setFullYear(dt.getFullYear() + 5)
  const oneWeekAfter5Y = new Date(fiveYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const sixYearAnniversary = dt.setFullYear(dt.getFullYear() + 6)
  const oneWeekAfter6Y = new Date(sixYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const sevenYearAnniversary = dt.setFullYear(dt.getFullYear() + 7)
  const oneWeekAfter7Y = new Date(sevenYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const eightYearAnniversary = dt.setFullYear(dt.getFullYear() + 8)
  const oneWeekAfter8Y = new Date(eightYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const nineYearAnniversary = dt.setFullYear(dt.getFullYear() + 9)
  const oneWeekAfter9Y = new Date(nineYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  dt = new Date(createdDate)
  const tenYearAnniversary = dt.setFullYear(dt.getFullYear() + 10)
  const oneWeekAfter10Y = new Date(tenYearAnniversary).getTime() + 7 * 24 * 60 * 60 * 1000 + 1

  let anniversaryDates = {
    sixMonthAnniversary: new Date(sixMonthAnniversary).toISOString().split('T')[0],
    oneWeekAfter6M: new Date(oneWeekAfter6M).toISOString().split('T')[0],

    oneYearAnniversary: new Date(oneYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter1Y: new Date(oneWeekAfter1Y).toISOString().split('T')[0],

    twoYearAnniversary: new Date(twoYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter2Y: new Date(oneWeekAfter2Y).toISOString().split('T')[0],

    threeYearAnniversary: new Date(threeYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter3Y: new Date(oneWeekAfter3Y).toISOString().split('T')[0],

    fourYearAnniversary: new Date(fourYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter4Y: new Date(oneWeekAfter4Y).toISOString().split('T')[0],

    fiveYearAnniversary: new Date(fiveYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter5Y: new Date(oneWeekAfter5Y).toISOString().split('T')[0],

    sixYearAnniversary: new Date(sixYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter6Y: new Date(oneWeekAfter6Y).toISOString().split('T')[0],

    sevenYearAnniversary: new Date(sevenYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter7Y: new Date(oneWeekAfter7Y).toISOString().split('T')[0],

    eightYearAnniversary: new Date(eightYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter8Y: new Date(oneWeekAfter8Y).toISOString().split('T')[0],

    nineYearAnniversary: new Date(nineYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter9Y: new Date(oneWeekAfter9Y).toISOString().split('T')[0],

    tenYearAnniversary: new Date(tenYearAnniversary).toISOString().split('T')[0],
    oneWeekAfter10Y: new Date(oneWeekAfter10Y).toISOString().split('T')[0],
  };

  return anniversaryDates;
}

export const calculateDurationBetweenDates = (summaryDate, createdDate) => {

  let summaryDateObject = new Date(summaryDate)
  let createdDateObject = new Date(createdDate)
  let durationSinceStarted = {
    months: 0,
    years: 0
  }
  if (summaryDate > createdDate) {
    var diff = Math.floor(summaryDateObject.getTime() - createdDateObject.getTime());
    var day = 1000 * 60 * 60 * 24;

    var days = (diff / day);
    var months = (days / 31);
    var yearsSinceStarted = (months / 12);
    durationSinceStarted = {
      months: months,
      years: yearsSinceStarted
    }
  }
  else {
    durationSinceStarted = {
      months: 0,
      years: 0
    }
  }
  return durationSinceStarted
}

export const showTrophyIcon = (summaryDate, createdDate) => {

  const calculateAnniversaryDateResults = calculateAnniversaryDate(createdDate)

  if (createdDate < summaryDate) {
    switch (true) {
      case calculateAnniversaryDateResults.tenYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter10Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.nineYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter9Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.eightYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter8Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.sevenYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter7Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.sixYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter6Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.fiveYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter5Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.fourYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter4Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.threeYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter3Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.twoYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter2Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.oneYearAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter1Y > summaryDate:
        return true;
      case calculateAnniversaryDateResults.sixMonthAnniversary <= summaryDate && calculateAnniversaryDateResults.oneWeekAfter6M > summaryDate:
        return true;
      default:
        false
    }
  }
  return false;
}

export const checkIfIconResets = (item, weeklyEndDate, createdDate) => {
  const showIcon = showTrophyIcon(weeklyEndDate, createdDate);
  if (item.name === 'Yihan Admin') {
    console.log(item.name, 'show??', showIcon, 'followed Up??', item.trophyFollowedUp);
  }
  if (!showIcon && item.trophyFollowedUp) {
    return false;
  }
  return true;
};