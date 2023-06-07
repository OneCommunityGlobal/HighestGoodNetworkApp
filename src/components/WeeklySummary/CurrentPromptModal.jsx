import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';

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
        View Current AI Prompt
      </Button>
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