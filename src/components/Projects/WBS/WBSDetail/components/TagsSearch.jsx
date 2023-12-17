import React, { useEffect, useState } from 'react';
import TagSent from './TagSent';
import './TagsSearch.css';

function TagsSearch({ placeholder, members, addResources, removeResource, resourceItems, props }) {
  const [isHidden, setIsHidden] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClick = (event, member) => {
    addResources(member._id, member.firstName, member.lastName);
    setIsHidden(!isHidden);
    event.target.closest(".my-element").previousElementSibling.value = '';
  };

  // sorting using the input letter, giving highest priority to first name starting with that letter,
  // and then the last name starting with that letter, followed by other names that include that letter
  const sortByStartingWith = keyword => {
    const newFilterList = members.filter(
      member =>
        !resourceItems.some(
          resourceItem => resourceItem.name === `${member.firstName} ${member.lastName}`,
        ) && `${member.firstName} ${member.lastName}`.toLowerCase().includes(keyword.toLowerCase()),
    );

    const finalList = newFilterList.sort((a, b) => {
      // check if the first name starts with the input letter
      const aStarts = `${a.firstName}`.toLowerCase().startsWith(keyword.toLowerCase());
      const bStarts = `${b.firstName}`.toLowerCase().startsWith(keyword.toLowerCase());
      if (aStarts && bStarts)
        return `${a.firstName}`.toLowerCase().localeCompare(`${b.firstName}`.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      if (!aStarts && !bStarts) {
        // if the first name does not start with input letter, check if the last name starts with the input letter
        const aLastName = `${a.lastName}`.toLowerCase().startsWith(keyword.toLowerCase());
        const bLastName = `${b.lastName}`.toLowerCase().startsWith(keyword.toLowerCase());
        if (aLastName && bLastName)
          return `${a.lastName}`.toLowerCase().localeCompare(`${b.lastName}`.toLowerCase());
        if (aLastName && !bLastName) return -1;
        if (!aLastName && bLastName) return 1;
      }
      return `${a.firstName} ${a.lastName}`
        .toLowerCase()
        .localeCompare(`${b.firstName} ${b.lastName}`.toLowerCase());
    });

    return finalList;
  };

  const handleFilter = event => {
    const searchWord = event.target.value;
    if (searchWord === '') {
      setFilteredData([]);
    } else {
      const newFilter = sortByStartingWith(searchWord);
      setIsHidden(false);
      setFilteredData(newFilter);
    }
  };

  const inputElement = () => {
    // if no props is provided, render intput as usual
    const { canEdit = true } = props ?? {};
    if (canEdit) {
      return (
        <input
          type="text"
          placeholder={placeholder}
          className="border border-dark rounded form-control px-2"
          onChange={handleFilter}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <div className="d-flex flex-column px-0">
      <div className="d-flex flex-column mb-1 px-0">
        <div className="align-items-start justify-content-start w-100 px-0 position-relative">
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
                    onClick={event => handleClick(event, member)}
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
          <ul
            key={`${elm._id}-${index}`}
            className="d-flex align-items-start justify-content-start m-0 p-1"
          >
            <TagSent elm={elm} removeResource={removeResource} />
          </ul>
        ))}
      </div>
    </div>
  );
}

export default TagsSearch;
