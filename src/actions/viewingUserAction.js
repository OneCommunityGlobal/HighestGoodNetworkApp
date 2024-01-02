import { SET_VIEWING_USER, SET_VIEWING_USER_HEADER_DATA } from "constants/viewingUser";

export const setViewingUser = (payload) => ({
  type: SET_VIEWING_USER,
  payload
});

export const setViewingUserHeaderData = (payload) => ({
  type: SET_VIEWING_USER_HEADER_DATA,
  payload
});
