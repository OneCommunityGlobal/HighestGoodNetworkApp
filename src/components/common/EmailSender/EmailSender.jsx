import React from 'react'
import { useLocation } from 'react-router-dom'
import Announcements from 'components/Announcements'

export const EmailSender = () => {

  const location = useLocation();
  const email  = location.state.state.email;

  return (
    <Announcements title='Email Form' email={ email } />
  )
};
