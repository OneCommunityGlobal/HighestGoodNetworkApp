import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import TagSent from './TagSent';
import styles from './TagsSearch.module.css';
import ReadOnlySectionWrapper from '../EditTask/ReadOnlySectionWrapper';
import { findProjectMembers } from '../../../../../actions/projectMembers';

function TagsSearch(props) {
  const {
    placeholder,
    resourceItems,
    addResources,
    removeResource,
    disableInput,
    darkMode,
    members,
  } = props;
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

    if (props.projectId) {
      const timeoutId = setTimeout(async () => {
        setIsLoading(true);
        try {
          props.findProjectMembers(props.projectId, currentValue);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error searching project members:', error);
        } finally {
          setIsLoading(false);
        }
      }, 400);

      setLastTimeoutId(timeoutId);
    }
  };

  const filteredMembers = useMemo(() => {
    // console.log('Filtering members:', { searchWord, membersCount: members?.length, isFocused });
    
    const resourceNames = new Set(resourceItems.map(item => item.name.toLowerCase()));

    if (members && members.length > 0) {
      return members.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();

        if (resourceNames.has(fullName)) return false;

        if (searchWord.trim().length > 0) {
          return fullName.includes(searchWord.toLowerCase());
        }

        return isFocused;
      });
    }

    if (searchWord.trim().length > 0 && props.state.projectMembers.foundProjectMembers) {
      return props.state.projectMembers.foundProjectMembers.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        return !resourceNames.has(fullName);
      });
    }

    return [];
  }, [
    members,
    resourceItems,
    searchWord,
    isFocused,
    props.state.projectMembers.foundProjectMembers,
  ]);

  const handleClick = (event, member) => {
    const userId = member._id || member.userID;
    const firstName = member.firstName || member.first;
    const lastName = member.lastName || member.last;

    addResources(userId, firstName, lastName);
    setSearchWord('');
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const shouldShowDropdown = isFocused && filteredMembers.length > 0;

  return (
    <div className="d-flex flex-column px-0">
      <div className="d-flex flex-column mb-1 px-0">
        <div className="align-items-start justify-content-start w-100 px-0 position-relative">
          {ReadOnlySectionWrapper(
            <input
              type="text"
              placeholder={placeholder}
              className={`border border-dark rounded form-control px-2 ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
              }`}
              value={searchWord}
              onChange={e => handleFilter(e)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />,
            !disableInput,
            null,
            { componentOnly: true },
          )}

          {shouldShowDropdown && (
            <ul className="my-element dropdown-menu d-flex flex-column align-items-start justify-content-start w-100 scrollbar shadow-lg rounded-3 position-absolute top-100 start-0 z-3 bg-light scrollable-menu">
              {filteredMembers.map((member, index) => (
                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                <a
                  key={member._id || member.userID || index}
                  className="text-decoration-none w-100"
                >
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions */}
                  <li
                    className="dropdown-item border-bottom fs-6 w-100 p-1"
                    onMouseDown={event => handleClick(event, member)}
                  >
                    {`${member.firstName || member.first} ${member.lastName || member.last}`}
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

const mapStateToProps = state => ({
  members: state.projectMembers.members,
  state,
});

export default connect(mapStateToProps, {
  findProjectMembers,
})(TagsSearch);