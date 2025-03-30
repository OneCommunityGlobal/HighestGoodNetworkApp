import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { FETCH_USER_PREFERENCE_START, FETCH_USER_PREFERENCE_END, UPDATE_USER_PREFERENCE_START, UPDATE_USER_PREFERENCE_END } from '../../constants/lbdashboard/userPreferenceConstants';

const fetchUserPreferencesStart = () => {
    return {
        type: FETCH_USER_PREFERENCE_START
    };
}
const fetchUserPreferencesEnd = (userPreferences) => {
    return {
        type: FETCH_USER_PREFERENCE_END,
        payload: userPreferences
    };
}   

export const getUserPreferences = (userId) => {
    return async (dispatch) => {
        dispatch(fetchUserPreferencesStart());
        try {
            const res = await axios.get(ENDPOINTS.LB_GET_USER_PREFERENCES(userId));
            dispatch(fetchUserPreferencesEnd(res.data));
        } catch (err) {
            console.error("Failed to fetch user preferences:", err);
        }
    };
}

const updateUserPreferencesStart = () => {
    return {
        type: UPDATE_USER_PREFERENCE_START
    };
}
const updateUserPreferencesEnd = (userPreferences) => {
    return {
        type: UPDATE_USER_PREFERENCE_END,
        payload: userPreferences
    };
}

export const updateUserPreferences = (userId, preferences) => {
    return async (dispatch) => {
        dispatch(updateUserPreferencesStart());
        try {
            const res = await axios.put(ENDPOINTS.LB_UPDATE_USER_PREFERENCES(userId), preferences);
            console.log(res)
            dispatch(updateUserPreferencesEnd(res.data));
        } catch (err) {
            console.error("Failed to update user preferences:", err);
        }
    };
}