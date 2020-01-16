import React from 'react';
import {Redirect} from 'react-router-dom';
import {setCurrentUser} from '../../actions/authActions'
import { useDispatch } from 'react-redux'

import config from '../../config.json'
const { tokenKey } = config


export const Logout = ()=>{
        localStorage.removeItem(tokenKey);

        const dispatch = useDispatch()
        dispatch(setCurrentUser(null));
        
        return (<Redirect to='/login' auth={false}/>);
}


