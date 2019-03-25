import moment from "moment";
import { store } from "../store";

export const getTimeEntries = (getTimeEntryForSpecifiedPeriod, id) => {
  const state = store.getState();
  let howManyDays;
  if (state.whichWeek === "Current Week") {
    howManyDays = 0;
  } else if (state.whichWeek === "Last Week") {
    howManyDays = 7;
  } else if (state.whichWeek === "Week Before Last") {
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

  return getTimeEntryForSpecifiedPeriod(id, startWeek, endWeek);
};

export const a = () => {
  console.log("a");
};
