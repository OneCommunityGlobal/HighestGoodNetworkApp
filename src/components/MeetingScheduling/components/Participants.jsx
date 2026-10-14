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

const getProfileFullName = profile => `${profile.firstName} ${profile.lastName}`;

const isEligibleProfile = (userProfile, authUserId, participantList, keyword) =>
  userProfile._id !== authUserId &&
  !participantList.some(participant => participant.name === getProfileFullName(userProfile)) &&
  getProfileFullName(userProfile)
    .toLowerCase()
    .includes(keyword.toLowerCase());

const compareNamePrefix = (firstNameA, firstNameB, keywordLower) => {
  const aStarts = firstNameA.toLowerCase().startsWith(keywordLower);
  const bStarts = firstNameB.toLowerCase().startsWith(keywordLower);

  if (aStarts !== bStarts) {
    return aStarts ? -1 : 1;
  }

  if (aStarts) {
    return firstNameA.toLowerCase().localeCompare(firstNameB.toLowerCase());
  }

  return 0;
};

const compareProfilesByKeyword = (profileA, profileB, keywordLower) => {
  const firstNameComparison = compareNamePrefix(
    `${profileA.firstName}`,
    `${profileB.firstName}`,
    keywordLower,
  );
  if (firstNameComparison !== 0) {
    return firstNameComparison;
  }

  const lastNameComparison = compareNamePrefix(
    `${profileA.lastName}`,
    `${profileB.lastName}`,
    keywordLower,
  );
  if (lastNameComparison !== 0) {
    return lastNameComparison;
  }

  return getProfileFullName(profileA)
    .toLowerCase()
    .localeCompare(getProfileFullName(profileB).toLowerCase());
};

const filterAndSortProfiles = (userProfiles, keyword, authUserId, participantList) => {
  const keywordLower = keyword.toLowerCase();
  const filteredProfiles = userProfiles.filter(userProfile =>
    isEligibleProfile(userProfile, authUserId, participantList, keyword),
  );

  return filteredProfiles.sort((profileA, profileB) =>
    compareProfilesByKeyword(profileA, profileB, keywordLower),
  );
};

const getFieldClassName = darkMode =>
  darkMode ? `${styles.field} ${styles.fieldDark}` : styles.field;

const getDropdownClassName = darkMode =>
  darkMode ? `${styles.dropdownMenu} ${styles.dropdownMenuDark}` : styles.dropdownMenu;

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

  const handleFilter = event => {
    const wordToSearch = event.target.value;
    const newFilter = filterAndSortProfiles(
      userProfiles,
      wordToSearch,
      authUserId,
      participantList,
    );
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
  const localTimeClassName = darkMode ? styles.localTime : `${styles.localTime} text-muted`;

  return (
    <div className={getFieldClassName(darkMode)}>
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
          <ul className={getDropdownClassName(darkMode)} aria-label="Participant suggestions">
            {filteredData.map(userProfile => (
              <li key={userProfile._id}>
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => handleClick(userProfile)}
                >
                  {getProfileFullName(userProfile)}
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
              <div className={localTimeClassName}>
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
