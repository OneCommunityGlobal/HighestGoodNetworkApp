import React from 'react'
import { Button } from 'reactstrap'
import './TeamsAndProjects.css'
const UserTeamsTable = React.memo((props) => {


  return (
    <div className='teamtable-container' >
      <div className='container'>
        <div className='row'>
          <div className='col' style={{ backgroundColor: ' #e9ecef', border: '1px solid #ced4da;', marginBottom: '10px' }}>
            <span className='teams-span'>Teams</span>
          </div>
          <div className='col'>
            <Button className='btn-addteam' color="primary" onClick={() => { props.onButtonClick() }}>Assign Team</Button>
          </div>
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
            {props.userTeamsById.length > 0
              ? props.userTeamsById.map((team, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{`${team.teamName}`}</td>
                  <td><Button color="danger">Delete</Button></td>
                </tr>
              )) : <></>
            }
          </tbody>

        </table>
      </div>
    </div>
  )
})
export default UserTeamsTable;