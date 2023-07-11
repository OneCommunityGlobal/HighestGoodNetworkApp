// reducers/textReducer.js
const initialState = {
  roleInfo: "",
};

export const roleInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ROLEINFO':
      return {
        ...state,
        roleInfo: action.payload,
      };
    default:
      return state;
  }
}
