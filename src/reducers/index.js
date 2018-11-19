import { combineReducers } from "redux";
import jwtDecode from 'jwt-decode';

const currentUserReducer = (user = null, action) => {
	if (action.type === "GET_CURRENT_USER") {
		try {
			let token = action.payload;
			return jwtDecode(token);
		} catch (err) {
			return user;
		}
	}
	
	return user;
};

export default combineReducers({
	user: currentUserReducer	
})

