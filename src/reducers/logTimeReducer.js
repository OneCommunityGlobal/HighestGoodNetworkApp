const SET_SERVER_DATE = 'SET_SERVER_DATE';

export const setServerDate = (date) => ({
  type: SET_SERVER_DATE,
  payload: date,
});

const initialState = {
  serverDate: null,
};

const timerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SERVER_DATE:
      return { ...state, serverDate: action.payload }; // Updating state immutably
    default:
      return state;
  }
};


export default timerReducer;