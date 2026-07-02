import { useState } from 'react';
import './Participants.css';
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

  const handleClick = (event, userProfile) => {
    addParticipant(userProfile._id, userProfile.firstName, userProfile.lastName);
    const closestElement = event.target.closest('.filter-userprofiles');
    if (closestElement && closestElement.previousElementSibling) {
      closestElement.previousElementSibling.value = '';
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

  return (
    <div className={`participants-field${darkMode ? ' participants-field--dark' : ''}`}>
      <div className="participants-search-wrap">
        <input
          type="text"
          className="participants-search-input"
          placeholder="Add participants"
          onChange={handleFilter}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {filteredData.length !== 0 && isFocused && (
          <ul
            className={`filter-userprofiles custom-dropdown-menu ${
              darkMode ? 'text-light' : 'text-dark'
            }`}
          >
            {filteredData.map(userProfile => (
              <li key={userProfile._id}>
                <button
                  type="button"
                  onClick={event => handleClick(event, userProfile)}
                  style={{
                    all: 'unset',
                    cursor: 'pointer',
                  }}
                >
                  {`${userProfile.firstName} ${userProfile.lastName}`}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="participants-list">
        {participantList?.map(participant => (
          <div key={participant.userProfileId} className="participant-chip-wrap">
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
              <div className={`participant-local-time ${darkMode ? '' : 'text-muted'}`}>
                <small>Their local time: {getLocalTimeLabel(participant)}</small>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Participants;
