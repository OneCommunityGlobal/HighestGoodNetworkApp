import React, { useEffect, useState } from 'react';
import TagSent from './TagSent';
import './TagsSearch.css';

function TagsSearch({ placeholder, members, addResources, removeResource, resourceItems }) {
  const [isHidden, setIsHidden] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClick = (event, member) => {
    addResources(member._id, member.firstName, member.lastName);
    setIsHidden(!isHidden);
    event.target.closest('.container-fluid').querySelector('input').value = '';
  };

  const handleFilter = event => {
    const searchWord = event.target.value;
    const newFilter = members.filter(member =>
      !resourceItems.some(resourceItem =>
        resourceItem.name === `${member.firstName} ${member.lastName}` 
      ) && `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchWord.toLowerCase())
    );
    if (searchWord === '') {
      setFilteredData([]);
    } else {
      setIsHidden(false);
      setFilteredData(newFilter);
    }
  };

  return (
    <div className="container-fluid d-flex flex-column px-0">
      <div className="d-flex flex-column container-fluid mb-1 px-0">
        <div className="align-items-start justify-content-start w-100 px-0 position-relative">
          <input
            type="text"
            placeholder={placeholder}
            className="border border-dark rounded form-control px-2"
            onChange={handleFilter}

          />
          {filteredData.length !== 0 ? (
            <ul
              className={`my-element ${
                isHidden
                  ? 'd-none'
                  : 'dropdown-menu d-flex flex-column align-items-start justify-content-start w-auto scrollbar shadow-lg rounded-3 position-absolute top-8 start-0 z-3 bg-light'
              }`}
            >
              {filteredData.slice(0, 10).map((member, index) => (
                <a key={member._id} className="text-decoration-none w-100">
                  <li
                    className={
                      index === selectedIndex
                        ? 'dropdown-item border-bottom fs-6 w-100 p-1'
                        : 'dropdown-item border-bottom fs-6 w-100 p-1'
                    }
                    onClick={(event) => handleClick(event, member)}
                  >
                    {member.firstName + ' ' + member.lastName}
                  </li>
                </a>
              ))}
            </ul>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="d-flex flex-wrap align-items-start justify-content-start">
        {resourceItems?.map((elm, index) => (
          <ul key={`${elm._id}-${index}`} className="d-flex align-items-start justify-content-start m-0 p-1">
            <TagSent elm={elm} removeResource={removeResource} />
          </ul>
        ))}
      </div>
    </div>
  );
}

export default TagsSearch;
