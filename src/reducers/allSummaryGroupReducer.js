/* eslint-disable no-underscore-dangle */
/* eslint-disable no-case-declarations */
import * as types from '../constants/allSummaryGroupConstants';

const summaryInitial = {
  fetching: false,
  fetched: false,
  allSummaryGroups: [],
  status: 404,
};

export const updateObject = (oldObject, updatedProperties) => ({
  ...oldObject,
  ...updatedProperties,
});

export const summaryGroupReducer = (allSummaryGroups = summaryInitial, action) => {
  switch (action.type) {
    case types.RECEIVE_ALL_SUMMARY_GROUP:
      return updateObject(allSummaryGroups, {
        allSummaryGroups: action.payload,
        fetching: true,
        //fetched: true,
        status: '200',
      });

    case types.ADD_NEW_SUMMARYGROUP:
      return updateObject(allSummaryGroups, {
        allSummaryGroups: Object.assign([...allSummaryGroups.allSummaryGroups, action.payload]),
        fetching: false,
        fetched: true,
        status: '200',
      });

    case types.SUMMARYGROUP_DELETE:
      const NoDeletedSummaryGroups = allSummaryGroups.allSummaryGroups.filter(
        item => item._id !== action.summaryGroupId,
      );
      return updateObject(allSummaryGroups, {
        allSummaryGroups: NoDeletedSummaryGroups,
        fetching: false,
        fetched: true,
        status: '200',
      });
    case types.UPDATE_SUMMARYGROUP:
      const summaryGroups = Object.assign([...allSummaryGroups.allSummaryGroups]);
      const updatedSummaryGroups = summaryGroups.find(
        summaryGroup => summaryGroup._id === action.summaryGroupId,
      );
      updatedSummaryGroups.isActive = action.isActive;
      updatedSummaryGroups.summaryGroupName = action.summaryGroupName;
      return updateObject(allSummaryGroups, {
        allSummaryGroups: summaryGroups,
        fetching: false,
        fetched: true,
        status: '200',
      });

    default:
      return allSummaryGroups;
  }
};
