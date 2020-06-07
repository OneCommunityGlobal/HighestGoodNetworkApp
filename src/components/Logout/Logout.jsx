import React from 'react';
import { Redirect } from 'react-router-dom';
import { logoutUser } from '../../actions/authActions'
import { useDispatch } from 'react-redux'

export const Logout = ()=>{
  const dispatch = useDispatch()
  if (window.confirm("Don't forget to log your time before logout!")) {
    dispatch(logoutUser());
    return (<Redirect to='/login' auth={false}/>);
  }
  return null;
}
