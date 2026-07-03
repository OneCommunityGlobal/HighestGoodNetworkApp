import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Participants.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import {
  getParticipantLocalTime,
  hasValidMeetingSchedule,
  resolveUserTimeZone,
} from '../../../utils/meetingTime';

function Participants({
  userProfiles,
  participantList,
  addParticipant,
  removeParticipant,
  authUserId,
  darkMode,
  formValues,
}) {
  const [filteredData, setFilteredData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);
  const showLocalTimes = hasValidMeetingSchedule(formValues);

  const sortByStartingWith = keyword => {
    const newFilterList = userProfiles.filter(
      userProfile =>
        userProfile._id !== authUserId &&
        !participantList.some(
          participant => participant.name === `${userProfile.firstName} ${userProfile.lastName}`,
        ) &&
        `${userProfile.firstName} ${userProfile.lastName}`
          .toLowerCase()
          .includes(keyword.toLowerCase()),
    );

    const finalList = newFilterList.sort((a, b) => {
      const aStarts = `${a.firstName}`.toLowerCase().startsWith(keyword.toLowerCase());
      const bStarts = `${b.firstName}`.toLowerCase().startsWith(keyword.toLowerCase());
      if (aStarts && bStarts)
        return `${a.firstName}`.toLowerCase().localeCompare(`${b.firstName}`.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      if (!aStarts && !bStarts) {
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
    const wordToSearch = event.target.value;
    const newFilter = sortByStartingWith(wordToSearch);
    setFilteredData(newFilter);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200);
  };

  const handleClick = userProfile => {
    addParticipant(userProfile._id, userProfile.firstName, userProfile.lastName);
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    setFilteredData([]);
  };

  const getLocalTimeLabel = participant => {
    if (!showLocalTimes) return null;
    const profile = userProfiles.find(user => user._id === participant.userProfileId);
    const localTime = getParticipantLocalTime(formValues, profile?.timeZone);
    const timeZoneLabel = resolveUserTimeZone(profile?.timeZone);
    if (!localTime) {
      return `Local time unavailable (${timeZoneLabel})`;
    }
    return localTime;
  };

  const showDropdown = filteredData.length > 0 && isFocused;

  return (
    <div className={`${styles.field}${darkMode ? ` ${styles.fieldDark}` : ''}`}>
      <div className={styles.searchWrap}>
        <input
          ref={searchInputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Add participants"
          onChange={handleFilter}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {showDropdown && (
          <ul
            className={`${styles.dropdownMenu}${darkMode ? ` ${styles.dropdownMenuDark}` : ''}`}
            role="listbox"
            aria-label="Participant suggestions"
          >
            {filteredData.map(userProfile => (
              <li key={userProfile._id} role="option">
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => handleClick(userProfile)}
                >
                  {`${userProfile.firstName} ${userProfile.lastName}`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.participantList}>
        {participantList?.map(participant => (
          <div key={participant.userProfileId} className={styles.chipWrap}>
            <button
              type="button"
              className="rounded-pill badge bg-primary text-wrap text-white p-2 m-1 fs-5"
              onClick={() => removeParticipant(participant.userProfileId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <span className="fs-6 me-2 fw-semibold">{participant.name}</span>
              <FontAwesomeIcon icon={faTimesCircle} className="m-1" />
            </button>
            {showLocalTimes && (
              <div className={`${styles.localTime}${darkMode ? '' : ' text-muted'}`}>
                <small>Their local time: {getLocalTimeLabel(participant)}</small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

Participants.propTypes = {
  userProfiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  participantList: PropTypes.arrayOf(
    PropTypes.shape({
      userProfileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  addParticipant: PropTypes.func.isRequired,
  removeParticipant: PropTypes.func.isRequired,
  authUserId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  darkMode: PropTypes.bool,
  formValues: PropTypes.object.isRequired,
};

export default Participants;
