import React, { useState } from 'react';
import { Tooltip } from 'reactstrap';


const BasicTabTips = () => {
  const [nameOpen, setNameOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  const toggleName = () => setNameOpen(!nameOpen);
  const toggleEmail = () => setEmailOpen(!emailOpen);
  const togglePhone = () => setPhoneOpen(!phoneOpen);
  return (
    <div>
      <Tooltip placement="top" isOpen={nameOpen} target="info-name" toggle={toggleName}>
        First Name and Last Name
      </Tooltip>
      <Tooltip placement="top" isOpen={emailOpen} target="info-email" toggle={toggleEmail}>
        Your Email
      </Tooltip>
      <Tooltip placement="top" isOpen={phoneOpen} target="info-phone" toggle={togglePhone}>
        Your Phone Number
      </Tooltip>
    </div>
  );
};

export default BasicTabTips;
