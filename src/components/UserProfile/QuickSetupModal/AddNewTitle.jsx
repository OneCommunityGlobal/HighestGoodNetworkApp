import React, { useState } from 'react';
import {addTitle} from '../../../actions/title';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';



const AddNewTitle = props => {
const { isOpen, toggle, setIsOpen } = props;
const [titleData, setTitleData] = useState({titleName: '', mediaFolder: '', teamCode: '', projectAssigned: '', teamAssiged: '', shortName:''})
const confirmOnClick = () => {
  let { titleName } = titleData;
  let names = titleName.split(' ');
  let shortname = (names[0][0] + names[1][0]).toUpperCase();
  setTitleData(prev => ({...prev, shortName: shortname}));
  console.log(shortname);
  console.log(titleData)
  // addTitle(titleData);
  setIsOpen(false);
}
return (
<React.Fragment>
<Modal isOpen={isOpen} toggle={() => setIsOpen(false)}>
  <ModalHeader toggle={() => setIsOpen(false)}>Add A New Title</ModalHeader>
  <ModalBody>
    <Form>
      <FormGroup>
      <Label>Title Name: </Label>
        <Input
          type="text"
          name="text"
          id="mediafolder"
          onChange= {e => {e.persist();
            setTitleData(prev => ({...prev, titleName: e.target.value}))}

          }
          // onChange={handleSelectionChange}
          // value={newTeam}
        >
        </Input>

        <Label>Media Folder: </Label>
        <Input
          type="text"
          name="text"
          id="mediafolder"
          onChange= {(e) => {e.persist();
            setTitleData(prev => ({...prev, mediaFolder: e.target.value}))}}

          // onChange={handleSelectionChange}
          // value={newTeam}
        >
        </Input>
        <Label>Team Code:</Label>
        <Input
          type="text"
          placeholder="X-XXX"
          onChange= {(e) => {e.persist();setTitleData(prev => ({...prev, teamCode: e.target.value}))}}

        >
        </Input>
        <Label>
          Project Assignment:
        </Label>
        <Input
          type="text"
          onChange= {(e) => {e.persist();setTitleData(prev => ({...prev, projectAssigned: e.target.value}))}}

        >
        </Input>
        <Label>
          Team Assignment:
        </Label>
        <Input
          type="text"
          onChange= {e => {e.persist();setTitleData(prev => ({...prev, teamAssiged: e.target.value}))}}

        >
        </Input>
      </FormGroup>
    </Form>
    </ModalBody>
    <ModalFooter>
      {/* <Button color="primary" onClick={handleSubmit}>
        Add Team
      </Button> */}
      <Button color="primary" onClick={() => confirmOnClick()}>
        Confirm
      </Button>

      <Button color="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
  </React.Fragment>
  )
}

export default AddNewTitle;