import React, { useState } from 'react';
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

const AddNewTeamModal = props => {
  const { isOpen, toggle, teams, submitHandler } = props;
  const [newTeam, setTeam] = useState('');
  const handleSelectionChange = e => {
    setTeam(e.target.value);
  };
  const handleSubmit = () => {
    const newTeams = teams.filter(team => team._id === newTeam);
    if (newTeams.length === 1) {
      submitHandler('add', newTeams[0]);
    }
    toggle();
  };
  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Modal title</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Choose a Team: </Label>
              <Input
                type="select"
                name="select"
                id="exampleSelect"
                onChange={handleSelectionChange}
                value={newTeam}
              >
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.teamName}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit}>
            Add Team
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

AddNewTeamModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  type: PropTypes.string,
  teams: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default AddNewTeamModal;
