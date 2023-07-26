import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';

function CurrentPromptModal() {
  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentPrompt)
    toast.success("Prompt Copied!")
  }

  const currentPrompt = `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format. 
  Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'. 
  Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment. 
  Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`;

  return (
    <div>
      <Button color="info" onClick={toggle}>
        View and Copy Current AI Prompt
        <i
          className="fa fa-info-circle"
          data-tip
          data-for="timeEntryTip"
          data-delay-hide="1000"
          aria-hidden="true"
          title=""
          style= {{paddingLeft: '.32rem'}}
        />
      </Button>
      <ReactTooltip id="timeEntryTip" place="bottom" effect="solid">
        Click this button to see and copy the most current AI prompt 
        <br />
        you should be using when editing your weeklly summary with chatGPT 
        <br />
        or similar AI text completion tool 
        <br />
      </ReactTooltip>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Current AI Prompt </ModalHeader>
        <ModalBody>
          {currentPrompt}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCopyToClipboard}>
            Copy Prompt
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default CurrentPromptModal;