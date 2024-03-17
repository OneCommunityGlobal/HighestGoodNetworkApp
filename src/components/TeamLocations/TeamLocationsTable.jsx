import React from 'react'
import './TeamLocations.css';
import { Input, Label, Table, Button } from 'reactstrap';

function TeamLocationsTable({visible, mapMarkers}) {
  console.log(mapMarkers)
  return (

    <div className={`map-table-container ${visible ? 'visible' : ''}`} style={{ maxHeight: '70vh', overflowY: 'auto', zIndex: 1000 }}>
      <Table hover responsive striped bordered>
        <thead>
          <tr>
            <th>Team Member</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {mapMarkers.map((user, index) => (
            <tr key={index}>
              <td>{user.firstName}</td>
              {user.location.city ? <td>{`${user.location.city}, ${user.location.country}`}</td> : <td>{`${user.location.country}`}</td> }
              
            </tr>
          ))}
          
        </tbody>
      </Table>
    </div>
  )
}

export default TeamLocationsTable;
