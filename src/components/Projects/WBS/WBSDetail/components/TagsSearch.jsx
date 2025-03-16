import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import TagSent from './TagSent';
import './TagsSearch.css';
import ReadOnlySectionWrapper from '../EditTask/ReadOnlySectionWrapper';
import { findProjectMembers } from '../../../../../actions/projectMembers';

function TagsSearch(props) {
  const { placeholder, resourceItems, addResources, removeResource, disableInput } = props;
  const [searchWord, setSearchWord] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTimeoutId, setLastTimeoutId] = useState(null);

  const handleFilter = event => {
    const currentValue = event.target.value;
    setSearchWord(currentValue);

    if (lastTimeoutId) clearTimeout(lastTimeoutId);

    if (currentValue.trim().length < 1) {
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        props.findProjectMembers(props.projectId, currentValue);
      } catch (error) {
        console.error('Error searching project members:', error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    setLastTimeoutId(timeoutId);
  };

  const filteredMembers = useMemo(() => {
    if (!props.state.projectMembers.foundProjectMembers || searchWord.trim().length < 1) return [];

    // set of names already added as resources
    const resourceNames = new Set(resourceItems.map(item => item.name.toLowerCase()));

    return props.state.projectMembers.foundProjectMembers.filter(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      return !resourceNames.has(fullName);
    });
  }, [props.state.projectMembers.foundProjectMembers, resourceItems, searchWord]);

  const handleClick = (event, member) => {
    addResources(member._id, member.firstName, member.lastName);
    setSearchWord('');
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

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
              onChange={e => handleFilter(e)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />,
            !disableInput,
            null,
            { componentOnly: true },
          )}
          {isFocused &&
            props.state.projectMembers.foundProjectMembers?.length > 0 &&
            searchWord.trim().length > 0 && (
              <ul className="my-element dropdown-menu d-flex flex-column align-items-start justify-content-start w-100 scrollbar shadow-lg rounded-3 position-absolute top-100 start-0 z-3 bg-light scrollable-menu">
                {filteredMembers.map((member, index) => (
                  <a key={member._id} className="text-decoration-none w-100">
                    <li
                      className="dropdown-item border-bottom fs-6 w-100 p-1"
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

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, {
  findProjectMembers,
})(TagsSearch);
