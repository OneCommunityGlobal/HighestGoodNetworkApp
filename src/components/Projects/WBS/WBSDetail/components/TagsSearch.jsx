import React, { useState, useMemo } from 'react';
import { connect } from 'react-redux';
import TagSent from './TagSent';
import styles from './TagsSearch.module.css';
import ReadOnlySectionWrapper from '../EditTask/ReadOnlySectionWrapper';
import { findProjectMembers } from '../../../../../actions/projectMembers';
import clsx from 'clsx';

function TagsSearch(props) {
  const {
    placeholder,
    resourceItems,
    addResources,
    removeResource,
    disableInput,
    darkMode,
    members,
    membersFromStore,
    foundProjectMembers,
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
    const resourceNames = new Set(
      (resourceItems || []).map(item => String(item?.name || '').toLowerCase()),
    );

    const baseList =
      Array.isArray(members) && members.length > 0
        ? members
        : Array.isArray(membersFromStore) && membersFromStore.length > 0
          ? membersFromStore
          : [];

    const applyFiltering = list =>
      list
        .filter(m => m && m.isActive === true)
        .filter(member => {
          const fullName = `${member.firstName || member.first || ''} ${
            member.lastName || member.last || ''
          }`
            .trim()
            .toLowerCase();

          if (!fullName) return false;
          if (resourceNames.has(fullName)) return false;

          if (searchWord.trim().length > 0) {
            return fullName.includes(searchWord.toLowerCase());
          }

          return isFocused;
        });

    if (baseList.length > 0) return applyFiltering(baseList);

    if (searchWord.trim().length > 0 && Array.isArray(foundProjectMembers)) {
      return applyFiltering(foundProjectMembers);
    }

    return [];
  }, [members, membersFromStore, foundProjectMembers, resourceItems, searchWord, isFocused]);

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
    <div className={clsx('d-flex flex-column px-0')}>
      <div className="d-flex flex-column mb-1 px-0">
        <div className="d-flex flex-column align-items-start justify-content-start w-100 px-0 position-relative">
          {ReadOnlySectionWrapper(
            <input
              type="text"
              placeholder={placeholder}
              className={clsx(
                'border border-dark rounded form-control px-2',
                darkMode ? 'bg-darkmode-liblack text-light border-0' : '',
              )}
              value={searchWord}
              onChange={handleFilter}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ textAlign: 'left' }}
            />,
            !disableInput,
            null,
            { componentOnly: true },
          )}

          {shouldShowDropdown && (
            <ul
              className={clsx(
                'dropdown-menu d-flex flex-column align-items-start justify-content-start w-100 shadow-lg rounded-3 position-absolute bg-light',
                styles.scrollbar,
                styles.scrollableMenu,
              )}
              style={{ top: '100%', left: 0 }}
            >
              {filteredMembers.map((member, index) => (
                <li
                  key={member._id || member.userID || index}
                  className="dropdown-item border-bottom fs-6 w-100 p-1"
                >
                  <button
                    type="button"
                    className="btn w-100 text-left p-0 text-dark"
                    onMouseDown={event => handleClick(event, member)}
                    style={{ textAlign: 'left' }}
                  >
                    {`${member.firstName || member.first} ${member.lastName || member.last}`}
                  </button>
                </li>
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
  membersFromStore: state.projectMembers.members,
  foundProjectMembers: state.projectMembers.foundProjectMembers,
});

export default connect(mapStateToProps, {
  findProjectMembers,
})(TagsSearch);
