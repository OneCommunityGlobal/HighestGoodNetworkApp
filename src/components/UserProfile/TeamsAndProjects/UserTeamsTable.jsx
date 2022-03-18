import React from 'react';
import { Button, Col } from 'reactstrap';
import './TeamsAndProjects.css';

const UserTeamsTable = (props) => (
  // debugger;
  <div className="teamtable-container">
    <div className="container">
      <div className="row">
        <Col
          md={props.edit ? '7' : '12'}
          style={{ backgroundColor: ' #e9ecef', border: '1px solid #ced4da', marginBottom: '10px' }}
        >
          <span className="teams-span">Teams</span>
        </Col>
        {props.edit && (
          <Col md="5">
            {props.isUserAdmin ? (
              <Button
                className="btn-addteam"
                color="primary"
                onClick={() => {
                  props.onButtonClick();
                }}
              >
                Assign Team
              </Button>
            ) : (
              <></>
            )}
          </Col>
        )}
      </div>
    </div>
    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
      <table className="table table-bordered table-responsive-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Team Name</th>
            <th>{}</th>
          </tr>
        </thead>
        <tbody>
          {props.userTeamsById.length > 0 ? (
            props.userTeamsById.map((team, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{`${team.teamName}`}</td>
                {props.edit && (
                  <td>
                    <Button
                      disabled={!props.isUserAdmin}
                      color="danger"
                      onClick={(e) => {
                        props.onDeleteClick(team._id);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <></>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
export default UserTeamsTable;
