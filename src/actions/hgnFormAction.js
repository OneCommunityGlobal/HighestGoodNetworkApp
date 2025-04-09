import { FETCH_FORM_DATA, SET_FORM_DATA } from "../constants/hgnFormConstants"


export const fetchformData=()=>{
    return async dispatch=>{
        dispatch({
            type:FETCH_FORM_DATA
        })
    }
}

export const setformData=(data)=>({
    type:SET_FORM_DATA,
    payload:data
})