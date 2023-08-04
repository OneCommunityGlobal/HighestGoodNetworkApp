import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { boxStyle } from 'styles';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { updateDashboardData, getDashboardDataAI } from '../../actions/dashboard';

function CurrentPromptModal(props) {
  const current = `Please edit the following summary of my week's work. Make sure it is professionally written in 3rd person format. Write it as only one paragraph. It must be only one paragraph. Keep it less than 500 words. Start the paragraph with 'This week'. Make sure the paragraph contains no links or URLs and write it in a tone that is matter-of-fact and without embellishment. Do not add flowery language, keep it simple and factual. Do not add a final summary sentence. Apply all this to the following:`;
  const dashboardDataAIPrompt =
    props.state.dashboardData.aIPromptText === '' || props.state.dashboardData.aIPromptText === null
      ? current
      : props.state.dashboardData.aIPromptText;


  const [modal, setModal] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [newPrompt, setNewPrompt] = useState(dashboardDataAIPrompt);

  const changeNewName = newName => {
    setNewPrompt(newName);
  };

  const toggle = () => {
    setModal(!modal);
    getAIPromp();
  };

  const getAIPromp = () => {
    props.getDashboardDataAI();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentPrompt);
    toast.success('Prompt Copied!');
  };

  const saveAIPrompt = () => {
    props.updateDashboardData(newPrompt);
  };

  const editCurentPrompt = () => {
    setCanEdit(true);
  };

  const saveCurrentPrompt = () => {
    setCanEdit(false);
    setModal(false);
    saveAIPrompt();
  };

  const currentPrompt = canEdit ? (
    <textarea autoFocus defaultValue={newPrompt} onChange={e => changeNewName(e.target.value)}></textarea>
  ) : (
    newPrompt
  );

  const modalOnClose = () => {
    setCanEdit(false);
  };

  return (
    <div>
      <Button color="info" onClick={toggle} style={boxStyle}>
        View and Copy Current AI Prompt
        <i
          className="fa fa-info-circle"
          data-tip
          data-for="timeEntryTip"
          data-delay-hide="1000"
          aria-hidden="true"
          title=""
          style={{ paddingLeft: '.32rem' }}
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
      <Modal isOpen={modal} toggle={toggle} onClosed={modalOnClose}>
        <ModalHeader toggle={toggle}>Current AI Prompt </ModalHeader>
        <ModalBody>{currentPrompt}</ModalBody>
        <ModalFooter>
          {!canEdit && (
            <Button color="primary" onClick={handleCopyToClipboard} style={boxStyle}>
              Copy Prompt
            </Button>
          )}
          {!canEdit && props.userRole === 'Owner' && (
            <FontAwesomeIcon
              icon={faEdit}
              size="lg"
              className="mr-3 text-primary"
              onClick={editCurentPrompt}
            />
          )}

          {canEdit && <Button onClick={saveCurrentPrompt}>Save Changes</Button>}
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, {
  updateDashboardData,
  getDashboardDataAI,
})(CurrentPromptModal);
