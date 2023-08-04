import * as types from './../constants/mouseoverTextConstants';

const initialState = null;

export const mouseoverTextReducer = (state= initialState, action) => {
    switch(action.type) {
        case types.GET_MOUSEOVER_TEXT:
        const data = action.payload;
        return data;

        case types.CREATE_MOUSEOVER_TEXT:
        return state;
        
        case types.UPDATE_MOUSEOVER_TEXT:
        return state;
    
        default: 
        return state;
    }
}
