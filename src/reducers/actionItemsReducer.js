const actionItemsReducer = (action, actionItems = null) => {
  if (action.type === 'GET_ACTION_ITEMS') {
    return action.payload;
  }

  return actionItems;
};

export default actionItemsReducer;