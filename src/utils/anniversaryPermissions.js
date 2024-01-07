
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
    sixMonthAnniversary: new Date(sixMonthAnniversary),
    oneWeekAfter6M: new Date(oneWeekAfter6M),

    oneYearAnniversary: new Date(oneYearAnniversary),
    oneWeekAfter1Y: new Date(oneWeekAfter1Y),

    twoYearAnniversary: new Date(twoYearAnniversary),
    oneWeekAfter2Y: new Date(oneWeekAfter2Y),

    threeYearAnniversary: new Date(threeYearAnniversary),
    oneWeekAfter3Y: new Date(oneWeekAfter3Y),

    fourYearAnniversary: new Date(fourYearAnniversary),
    oneWeekAfter4Y: new Date(oneWeekAfter4Y),

    fiveYearAnniversary: new Date(fiveYearAnniversary),
    oneWeekAfter5Y: new Date(oneWeekAfter5Y),

    sixYearAnniversary: new Date(sixYearAnniversary),
    oneWeekAfter6Y: new Date(oneWeekAfter6Y),

    sevenYearAnniversary: new Date(sevenYearAnniversary),
    oneWeekAfter7Y: new Date(oneWeekAfter7Y),

    eightYearAnniversary: new Date(eightYearAnniversary),
    oneWeekAfter8Y: new Date(oneWeekAfter8Y),

    nineYearAnniversary: new Date(nineYearAnniversary),
    oneWeekAfter9Y: new Date(oneWeekAfter9Y),

    tenYearAnniversary: new Date(tenYearAnniversary),
    oneWeekAfter10Y: new Date(oneWeekAfter10Y),
  };

  return anniversaryDates;
}

export const calculateDurationBetweenDates = (endDate, createdDate) => {

  let endDateObject = new Date(endDate)
  let createdDateObject = new Date(createdDate)
  let durationSinceStarted = {
    months: 0,
    years: 0
  }
  if (endDate > createdDate) {
    var diff = Math.floor(endDateObject.getTime() - createdDateObject.getTime());
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

export const showTrophyIcon = (endDate, createdDate) => {

  const calculateAnniversaryDateResults = calculateAnniversaryDate(createdDate)

  if (createdDate < endDate) {
    switch (true) {
      case calculateAnniversaryDateResults.tenYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter10Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.nineYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter9Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.eightYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter8Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.sevenYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter7Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.sixYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter6Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.fiveYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter5Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.fourYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter4Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.threeYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter3Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.twoYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter2Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.oneYearAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter1Y.toISOString().split('T')[0] > endDate:
        return true;
      case calculateAnniversaryDateResults.sixMonthAnniversary.toISOString().split('T')[0] <= endDate && calculateAnniversaryDateResults.oneWeekAfter6M.toISOString().split('T')[0] > endDate:
        return true;
      default:
        false
    }
  }
  return false;
}
