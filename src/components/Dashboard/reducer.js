const initialState = {
  isTimeLogged: false,
};

export const teamMemberTasksReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_LEADER_BOARD_DATA':
      let { isTimeLogged } = action.payload;
      return { ...state, isTimeLogged };
    default:
      return state;
  }
};
