import { useState } from 'react';
import { Tooltip } from 'reactstrap';

function BasicTabTips() {
  const [nameOpen, setNameOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [titleOpen, setTitleOpen] = useState(false);

  const toggleName = () => setNameOpen(!nameOpen);
  const toggleEmail = () => setEmailOpen(!emailOpen);
  const togglePhone = () => setPhoneOpen(!phoneOpen);
  const toggleTitle = () => setTitleOpen(!titleOpen);
  return (
    <div>
      <Tooltip
        placement="top"
        data-testid="tooltip-name"
        isOpen={nameOpen}
        target="info-name"
        toggle={toggleName}
      >
        First Name and Last Name
      </Tooltip>
      <Tooltip placement="top" isOpen={emailOpen} target="info-email" toggle={toggleEmail}>
        Your Email
      </Tooltip>
      <Tooltip placement="top" isOpen={phoneOpen} target="info-phone" toggle={togglePhone}>
        Your Phone Number
      </Tooltip>
      {/* <Tooltip placement="top" isOpen={phoneOpen} target="info-phone" toggle={togglePhone}>
        Your Phone Number
      </Tooltip> */}
      <Tooltip placement="top" isOpen={titleOpen} target="info-title" toggle={toggleTitle}>
        Your Preferred Title
      </Tooltip>
    </div>
  );
}

export default BasicTabTips;
