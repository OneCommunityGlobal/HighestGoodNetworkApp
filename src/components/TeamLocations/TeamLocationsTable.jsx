// TeamLocationsTable.jsx

import { useState } from 'react';
import './TeamLocations.css';
import PropTypes from 'prop-types';

/**
 * Helper function to format the user's full name.
 */
const formatUserName = (firstName, lastName) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName.charAt(0)}.`;
  }
  return firstName || (lastName ? `${lastName.charAt(0)}.` : '-');
};

/**
 * Helper function to get the display location.
 */
const getDisplayLocation = (location, darkMode) => {
  const { city, country } = location;
  const color = darkMode ? 'white' : 'black';
  const displayText = city ? `${city}, ${country}` : country;

  return (
    <span style={{ color }} className='column-content'>
      {displayText}
    </span>
  );
};

/**
 * Helper function to determine row class names.
 */
const getRowClassName = (isEven, darkMode) => {
  let className = 'team-locations-table-row';
  if (isEven) className += ' team-locations-table-row-even';
  if (darkMode) className += ' bg-space-cadet';
  return className;
};

/**
 * Helper function to determine caret direction.
 */
const getCaretDirection = (sortOrder) => {
  return sortOrder === 'asc' ? 'down' : 'up';
};

function TeamLocationsTable({ visible, filteredMapMarkers, setCurrentUser, darkMode }) {

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


  const sortedMapMarkers = filteredMapMarkers.slice().sort((a, b) => {
    const { field } = sortOrder;
    const direction = sortOrder.direction === 'asc' ? 1 : -1;

    if (field === 'name') {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB) * direction;
    } 
    if (field === 'location') {
      const locationA = a.location.city ? `${a.location.city}, ${a.location.country}`.toLowerCase() : a.location.country.toLowerCase();
      const locationB = b.location.city ? `${b.location.city}, ${b.location.country}`.toLowerCase() : b.location.country.toLowerCase();
      return locationA.localeCompare(locationB) * direction;
    } 
    // Refactored nested ternary expression to if-else statements
    if (a.isActive === b.isActive) {
      return 0;
    } if (a.isActive) {
      return -1;
    } 
      return 1;
    
  });

  const newfilteredMapMarkers = sortedMapMarkers.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const location = user.location.city ? 
      `${user.location.city}, ${user.location.country}`.toLowerCase() : user.location.country.toLowerCase();
    return fullName.includes(searchTerm) || location.includes(searchTerm);
  });

  return (
    <div className={`map-table-container ${visible ? 'visible' : ''}`}>
      <table className={`team-locations-table ${darkMode ? 'text-light bg-yinmn-blue' : ''}`}>
        <thead>
          <tr className={darkMode ? 'bg-space-cadet' : ''}>
            <th className="team-locations-table-header small-column">
              <div className='cursor-pointer' onClick={() => toggleSortOrder('setActiveUsers')}>
                <i className='cursor-pointer fa fa-user-o' aria-hidden='true' />
              </div>
            </th>
            <th className="team-locations-table-header medium-column">
              <div className='cursor-pointer' onClick={() => toggleSortOrder('name')}>
                <span className="column-header">Team Member</span>
                <i className={`fa fa-caret-${getCaretDirection(nameSortOrder)}`} />
              </div>
            </th>
            <th className="team-locations-table-header large-column">
              <div className='cursor-pointer' onClick={() => toggleSortOrder('location')}>
                <span className="column-header">Location</span>
                <i className={`fa fa-caret-${getCaretDirection(locationSortOrder)}`} />
              </div>
            </th>
            <th className="team-locations-table-header small-column">
              <div className='cursor-pointer'>
                <i onClick={toggleShowSearchBar} className="fa fa-search" aria-hidden="true" />
              </div>
            </th>
          </tr>
          {showSearchBar && (
            <tr className={darkMode ? 'bg-space-cadet' : ''}>
              <th colSpan="4" className='team-locations-table-header'>
                <div className={`search-bar ${showSearchBar ? 'visible' : ''}`}>
                  <input 
                    type='text' 
                    placeholder='Search Team Members...' 
                    onChange={handleSearchTermChange} 
                    value={searchTerm} 
                  />
                </div>
              </th>
            </tr>
          )}
        </thead>
        <tbody>
          {newfilteredMapMarkers.map((user, index) => (
            <tr 
              key={user._id} // Replaced index with unique user ID
              onClick={() => setCurrentUser(user)} 
              className={getRowClassName(index % 2 === 0, darkMode)} // Refactored className
            >
              <td className='team-locations-table-data'>
                <i
                  className='fa fa-circle'
                  aria-hidden='true'
                  style={{ color: user.isActive ? 'green' : 'red' }}
                />
              </td>
              <td className='team-locations-table-data'>
                <span style={{ color: darkMode ? 'white' : 'black' }} className='column-content'>
                  {formatUserName(user.firstName, user.lastName)}
                </span>
              </td>
              <td className='team-locations-table-data'>
                {getDisplayLocation(user.location, darkMode)}
              </td>
              <td className='team-locations-table-data' />
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  );
}

TeamLocationsTable.propTypes = {
  visible: PropTypes.bool.isRequired,
  filteredMapMarkers: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    location: PropTypes.shape({
      city: PropTypes.string,
      country: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
  setCurrentUser: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default TeamLocationsTable;
