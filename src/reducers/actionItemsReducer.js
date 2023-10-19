// eslint-disable-next-line import/prefer-default-export
export const actionItemsReducer = (action, actionItems = null) => {
  if (action.type === 'GET_ACTION_ITEMS') {
    return action.payload;
  }

  return actionItems;
};
