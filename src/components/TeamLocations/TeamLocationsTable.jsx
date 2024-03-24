import React, { useState } from 'react';
import './TeamLocations.css';

function TeamLocationsTable({ visible, mapMarkers }) {
  const [sortOrder, setSortOrder] = useState({ field: null, direction: 'asc' });

  const [nameSortOrder, setNameSortOrder] = useState('asc');
  const [locationSortOrder, setLocationSortOrder] = useState('asc');

  const toggleSortOrder = (field) => {
    if (field === 'name') {
      setNameSortOrder(sortOrder.direction === 'asc' ? 'desc' : 'asc');
    }

    if (field === 'location') {
      setLocationSortOrder(sortOrder.direction === 'asc' ? 'desc' : 'asc');
    }
    if (sortOrder.field === field) {
      setSortOrder({ ...sortOrder, direction: sortOrder.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortOrder({ field, direction: 'asc' });
    }
  };


  const sortedMapMarkers = mapMarkers.slice().sort((a, b) => {
    const field = sortOrder.field;
    const direction = sortOrder.direction === 'asc' ? 1 : -1;

    if (field === 'name') {
      // setNameSortOrder(direction === 'asc' ? 'desc' : 'asc');
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB) * direction;
    } else if (field === 'location') {
      // setLocationSortOrder(direction === 'asc' ? 'desc' : 'asc');
      const locationA = a.location.city ? `${a.location.city}, ${a.location.country}`.toLowerCase() : a.location.country.toLowerCase();
      const locationB = b.location.city ? `${b.location.city}, ${b.location.country}`.toLowerCase() : b.location.country.toLowerCase();
      return locationA.localeCompare(locationB) * direction;
    } else {
      return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
    }
  });

  return (
    <div className={`map-table-container ${visible ? 'visible' : ''}`}>
      <table>
        <thead>
          <tr>
            <th style={{width: '15px'}}>
              <div className='cursor-pointer' onClick={() => toggleSortOrder('setActiveUsers')}>
                <i className='cursor-pointer fa fa-user-o' aria-hidden='true'></i>
              </div>
            </th>
            <th>
              <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}} className='cursor-pointer' onClick={() => toggleSortOrder('name')}>
                <span style={{fontSize: '.75rem'}}>Team Member</span>
                <i className={`fa fa-caret-${nameSortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </div>
            </th>
            <th>
              <div className='cursor-pointer' style={{display: 'flex', flexDirection: 'row', gap: '5px'}} onClick={() => toggleSortOrder('location')}>
                <span style={{fontSize: '.75rem'}}>Location</span>
                <i className={`fa fa-caret-${locationSortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedMapMarkers.map((user, index) => (
            <tr key={index} onClick={() => console.log(user)}>
              <td style={{width: '15px'}}>
                <i
                  className='fa fa-circle'
                  aria-hidden='true'
                  style={{ color: user.isActive ? 'green' : 'red' }}
                ></i>
              </td>
              <td>
                <span style={{width: '50px', height: '20px'}} className='cursor-pointer' >{`${user.firstName} ${user.lastName.charAt(0)}.`}</span>
              </td>
              {user.location.city ? (
                <td>{`${user.location.city}, ${user.location.country}`}</td>
              ) : (
                <td>{`${user.location.country}`}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeamLocationsTable;