import React from 'react';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../actions/authActions';

export const Logout = () => {
  const dispatch = useDispatch();
  if (window.confirm("Don't forget to log your time before logout!")) {
    dispatch(logoutUser());
    return <Redirect to="/login" auth={false} />;
  }
  return null;
};
