/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';

const CreateNewSummaryGroupPopup = React.memo(props => {
  const [newSummaryTeam, onNewName] = useState(props.sumaryGroupName || '');
  const [isValidTeam, onValidation] = useState(true);

  const closePopup = () => {
    props.onClose();
  };
  useEffect(() => {
    onNewName(props.sumaryGroupName || '');
  }, [props.open, props.summaryGroupName]);
  return (
    <>
      <Modal isOpen={props.open} toggle={closePopup}>
        <ModalHeader toggle={closePopup}>
          {props.isEdit ? 'Update Team Name' : 'Create New Summary Group'}
        </ModalHeader>
        <ModalBody style={{ textAlign: 'start' }}>
          <label>Name of the Summary Team</label>
          <Input
            id="summaryGroupName"
            placeholder="Please enter a new summary group name"
            value={newSummaryTeam}
            onChange={e => {
              onValidation(true);
              onNewName(e.target.value);
            }}
            required
          />
          {isValidTeam === false ? (
            <Alert color="danger">Please enter a summary group name.</Alert>
          ) : (
            <></>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup}>
            Close
          </Button>
          <Button
            color="primary"
            onClick={() => {
              if (newSummaryTeam !== '') {
                if (!props.summaryGroup.some(group => group.summaryGroupName === newSummaryTeam)) {
                  props.onOkClick(newSummaryTeam, props.isEdit);
                } else {
                  onValidation(false);
                }
              } else {
                onValidation(false);
              }
            }}
          >
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
});
export default CreateNewSummaryGroupPopup;
