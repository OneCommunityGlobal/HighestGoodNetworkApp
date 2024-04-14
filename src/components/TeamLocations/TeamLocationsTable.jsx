import { useState } from 'react';
import './TeamLocations.css';

function TeamLocationsTable({ visible, mapMarkers, setCurrentUser }) {
  const [sortOrder, setSortOrder] = useState({ field: null, direction: 'dsc' });

  const [nameSortOrder, setNameSortOrder] = useState('dsc');
  const [locationSortOrder, setLocationSortOrder] = useState('dsc');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleShowSearchBar = () => {
    if (showSearchBar) {
      setSearchTerm('');
    }
    setShowSearchBar(!showSearchBar);
  }

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  }

  const toggleSortOrder = (field) => {
    let newSortOrder;
    
    if (sortOrder.field === field) {
      newSortOrder = { ...sortOrder, direction: sortOrder.direction === 'asc' ? 'desc' : 'asc' };
    } else {
      newSortOrder = { field, direction: 'asc' };
    }

    setSortOrder(newSortOrder);

    if (field === 'name') {
      setNameSortOrder(newSortOrder.direction);
    }

    if (field === 'location') {
      setLocationSortOrder(newSortOrder.direction);
    }

    if (field === 'setActiveUsers') {
      setNameSortOrder('desc');
      setLocationSortOrder('desc');
    }
  };


  const sortedMapMarkers = mapMarkers.slice().sort((a, b) => {
    const field = sortOrder.field;
    const direction = sortOrder.direction === 'asc' ? 1 : -1;

    if (field === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB) * direction;
    } else if (field === 'location') {
      const locationA = a.location.city ? `${a.location.city}, ${a.location.country}`.toLowerCase() : a.location.country.toLowerCase();
      const locationB = b.location.city ? `${b.location.city}, ${b.location.country}`.toLowerCase() : b.location.country.toLowerCase();
      return locationA.localeCompare(locationB) * direction;
    } else {
      return a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1;
    }
  });

  const filteredMapMarkers = sortedMapMarkers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const location = user.location.city ? `${user.location.city}, ${user.location.country}`.toLowerCase() : user.location.country.toLowerCase();
    return fullName.includes(searchTerm) || location.includes(searchTerm);
  });

  return (
    <div className={`map-table-container ${visible ? 'visible' : ''}`}>
      <table>
        <thead>
          <tr>
            <th className="small-column">
              <div className='cursor-pointer' onClick={() => toggleSortOrder('setActiveUsers')}>
                <i className='cursor-pointer fa fa-user-o' aria-hidden='true'></i>
              </div>
            </th>
            <th className="medium-column">
              <div className='cursor-pointer' onClick={() => toggleSortOrder('name')}>
                <span className="column-header">Team Member</span>
                <i className={`fa fa-caret-${nameSortOrder === 'asc' ? 'down' : 'up'}`}></i>
              </div>
            </th>
            <th className="large-column">
              <div className='cursor-pointer' onClick={() => toggleSortOrder('location')}>
                <span className="column-header">Location</span>
                <i className={`fa fa-caret-${locationSortOrder === 'asc' ? 'down' : 'up'}`}></i>
              </div>
            </th>
            <th className="small-column">
              <div className='cursor-pointer'>
                <i onClick={toggleShowSearchBar} className="fa fa-search" aria-hidden="true"></i>
              </div>
            </th>
          </tr>
          {showSearchBar &&
          <tr>
            <th colSpan="4">
            <div className={`search-bar ${showSearchBar ? 'visible' : ''}`}>
                <input type='text' placeholder='Search Team Members...' onChange={handleSearchTermChange} value={searchTerm} />
              </div>
            </th>
          </tr>}
        </thead>
        <tbody>
          {filteredMapMarkers.map((user, index) => (
            <tr key={index} onClick={() => setCurrentUser(user)}>
              <td>
                <i
                  className='fa fa-circle'
                  aria-hidden='true'
                  style={{ color: user.isActive ? 'green' : 'red' }}
                ></i>
              </td>
              <td>
                <span className='column-content'>{`${user.firstName} ${user.lastName.charAt(0)}.`}</span>
              </td>
              <td>
                {user.location.city ? (
                  <span className='column-content'>{`${user.location.city}, ${user.location.country}`}</span>
                ) : (
                  <span className='column-content'>{`${user.location.country}`}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
}

export default TeamLocationsTable;