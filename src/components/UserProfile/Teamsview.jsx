import React, { useState, useEffect } from 'react';
import { Table, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import TeamsModal from './AddNewTeamModal';

function Teamtabledata({ teammembers, edit, handleTeam }) {
  const handleDelete = e => {
    const id = e.target.getAttribute('data-item');
    handleTeam('delete', id);
  };
  return (
    <tr>
      <td>{teammembers.teamName}</td>
      <td>
        {edit && (
          <Button
            type="button"
            data-item={teammembers._id}
            size="sm"
            color="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </td>
    </tr>
  );
}
Teamtabledata.propTypes = {
  teammembers: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    teamName: PropTypes.string.isRequired,
  }).isRequired,
  edit: PropTypes.bool.isRequired,
  handleTeam: PropTypes.func.isRequired,
};
const Teams = React.memo(props => {
  const [addNewTeamModal, setAddNewTeamModal] = useState(false);
  const [remainedTeams, setRemainedTeams] = useState([]);
  const [teams] = useState(props.teamsdata);
  useEffect(() => {
    const teamsId = props.allTeams.map(team => {
      const { _id, teamName } = team;
      return { _id, teamName };
    });
    setRemainedTeams(
      teamsId.filter(team => {
        for (let i = 0; i < props.teamsdata.length; i += 1) {
          if (team._id === props.teamsdata[i]._id) {
            return false;
          }
        }
        return true;
      }),
    );
  }, [teams]);
  const onAddNewTeam = () => {
    setAddNewTeamModal(!addNewTeamModal);
  };
  return (
    <>
      <TeamsModal
        isOpen={addNewTeamModal}
        toggle={onAddNewTeam}
        teams={remainedTeams}
        submitHandler={props.handleTeam}
      />
      <Table bordered size="sm">
        <thead>
          <tr>
            <th>Teams</th>
            <th>
              {props.edit && (
                <Button size="sm" color="info" disabled={!props.edit} onClick={onAddNewTeam}>
                  Add a Team
                </Button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {props.teamsdata.map(team => (
            <Teamtabledata
              key={team._id}
              teammembers={team}
              edit={props.edit}
              handleTeam={props.handleTeam}
            />
          ))}
        </tbody>
      </Table>
    </>
  );
});

Teams.propTypes = {
  edit: PropTypes.bool.isRequired,
  allTeams: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      teamName: PropTypes.string.isRequired,
      isActive: PropTypes.bool.isRequired,
      createdDatetime: PropTypes.string.isRequired,
      modifiedDatetime: PropTypes.string.isRequired,
      __v: PropTypes.number, // optional if not always present
    }),
  ).isRequired,
  handleTeam: PropTypes.func.isRequired,
};

export default Teams;
