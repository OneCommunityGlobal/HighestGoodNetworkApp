import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { logoutUser } from '../../actions/authActions'
import { useDispatch } from 'react-redux'

export const Logout = ()=>{
  const dispatch = useDispatch()
  
  useEffect(() => {
    dispatch(logoutUser());
  });
  
  return (<Redirect to='/login' auth={false}/>);
}
