// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useLocation } from 'react-router-dom';
import Announcements from '~/components/Announcements';

function EmailSender() {
  const location = useLocation();
  const { email } = location.state.state;

  return <Announcements title="Email Form" email={email} />;
}

export default EmailSender;
