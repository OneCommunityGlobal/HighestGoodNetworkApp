import React, { useEffect, useState, useMemo } from 'react';
import TagSent from './TagSent';
import './TagsSearch.css';
import ReadOnlySectionWrapper from '../EditTask/ReadOnlySectionWrapper';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function TagsSearch({
  placeholder,
  members,
  addResources,
  removeResource,
  resourceItems,
  disableInput,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchWord, setSearchWord] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // search input with a 300ms delay
  const debouncedSearchWord = useDebounce(searchWord, 300);

  const handleClick = (event, member) => {
    addResources(member._id, member.firstName, member.lastName);
    setSearchWord('');
  };

  const filteredData = useMemo(() => {
    if (debouncedSearchWord.trim().length < 1) return [];
    const lowerKeyword = debouncedSearchWord.toLowerCase();
    // set of names already added as resources
    const resourceNames = new Set(resourceItems.map(item => item.name.toLowerCase()));

    // filter out members already added and whose full name includes the search word
    const newFilterList = members.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      return !resourceNames.has(fullName) && fullName.includes(lowerKeyword);
    });

    // Sort with priority: first name starting with the search word, then last name, then full name
    return newFilterList.sort((a, b) => {
      const aStarts = a.firstName.toLowerCase().startsWith(lowerKeyword);
      const bStarts = b.firstName.toLowerCase().startsWith(lowerKeyword);
      if (aStarts && bStarts) {
        return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
      }
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      // check last name if first names don't decide
      const aLastStarts = a.lastName.toLowerCase().startsWith(lowerKeyword);
      const bLastStarts = b.lastName.toLowerCase().startsWith(lowerKeyword);
      if (aLastStarts && bLastStarts) {
        return a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
      }
      if (aLastStarts && !bLastStarts) return -1;
      if (!aLastStarts && bLastStarts) return 1;
      // falblack to comparing full names
      const aFull = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bFull = `${b.firstName} ${b.lastName}`.toLowerCase();
      return aFull.localeCompare(bFull);
    });
  }, [debouncedSearchWord, members, resourceItems]);

  const handleFilter = e => {
    setSearchWord(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    /*
      Temporary fix: Adding resources required multiple retries issue.
      Removed the timeout and setFilteredData to empty array.
      TODO: A deeper analysis of the issue is required.
    */
    setIsFocused(false);
  };

  return (
    <div className="d-flex flex-column px-0">
      <div className="d-flex flex-column mb-1 px-0">
        <div className="align-items-start justify-content-start w-100 px-0 position-relative">
          {ReadOnlySectionWrapper(
            <input
              type="text"
              placeholder={placeholder}
              className="border border-dark rounded form-control px-2"
              value={searchWord}
              onChange={handleFilter}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />,
            !disableInput,
            null,
            { componentOnly: true },
          )}
          {filteredData.length > 0 && isFocused && (
            <ul className="my-element dropdown-menu d-flex flex-column align-items-start justify-content-start w-100 scrollbar shadow-lg rounded-3 position-absolute top-100 start-0 z-3 bg-light scrollable-menu">
              {filteredData.map((member, index) => (
                <a key={member._id} className="text-decoration-none w-100">
                  <li
                    className={
                      index === selectedIndex
                        ? 'dropdown-item border-bottom fs-6 w-100 p-1'
                        : 'dropdown-item border-bottom fs-6 w-100 p-1'
                    }
                    onMouseDown={event => handleClick(event, member)}
                  >
                    {`${member.firstName} ${member.lastName}`}
                  </li>
                </a>
              ))}
            </ul>
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
