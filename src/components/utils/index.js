import moment from "moment";

export const getTimeEntries = week => {
  const { state } = this.props;
  let howManyDays;
  if (week === "Current Week") {
    howManyDays = 0;
  } else if (week === "Last Week") {
    howManyDays = 7;
  } else if (week === "Week Before Last") {
    howManyDays = 14;
  }

  const startWeek = moment()
    .subtract(howManyDays, "days")
    .startOf("week")
    .format("YYYY-MM-DD");
  const endWeek = moment()
    .subtract(howManyDays, "days")
    .endOf("week")
    .format("YYYY-MM-DD");

  getTimeEntryForSpecifiedPeriod(state.userProfile._id, startWeek, endWeek);
};

export const getTimeEntriess = week => {
  const { state } = this.props;
  let howManyDays;
  if (week === "Current Week") {
    howManyDays = 0;
  } else if (week === "Last Week") {
    howManyDays = 7;
  } else if (week === "Week Before Last") {
    howManyDays = 14;
  }

  const startWeek = moment()
    .subtract(howManyDays, "days")
    .startOf("week")
    .format("YYYY-MM-DD");
  const endWeek = moment()
    .subtract(howManyDays, "days")
    .endOf("week")
    .format("YYYY-MM-DD");

  getTimeEntryForSpecifiedPeriod(state.userProfile._id, startWeek, endWeek);
};
