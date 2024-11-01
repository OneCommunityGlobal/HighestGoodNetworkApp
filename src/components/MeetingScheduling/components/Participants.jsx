import { useState } from 'react';
import './Participants.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

function Participants({ userProfiles, participantList, addParticipant, removeParticipant }) {
  console.log("participantList", participantList)

  const [searchWord, setSearchWord] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const sortByStartingWith = keyword => {
    const newFilterList = userProfiles.filter(
      userProfile =>
        !participantList.some(
          participant => participant.name === `${userProfile.firstName} ${userProfile.lastName}`,
        ) && `${userProfile.firstName} ${userProfile.lastName}`.toLowerCase().includes(keyword.toLowerCase()),
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
    const wordToSearch = event.target.value;
    // setSearchWord(wordToSearch);
    const newFilter = sortByStartingWith(wordToSearch);
    setFilteredData(newFilter);
    // setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200);
  };

  const handleClick = (event, userProfile) => {
    // addResources(member._id, member.firstName, member.lastName);
    addParticipant(userProfile._id, userProfile.firstName, userProfile.lastName);
    event.target.closest(".filter-userprofiles").previousElementSibling.value = '';
    setSearchWord('');
    setFilteredData([]);
  };

  console.log("isFocused", isFocused);

  return (
    <div>
      <div className="position-relative">
        <input
          type="text"
          placeholder="Add participants"
          onChange={handleFilter}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {(filteredData.length !== 0 && isFocused) && (
          <ul className="filter-userprofiles custom-dropdown-menu position-absolute">
            {filteredData.map(userProfile => (
              <a key={userProfile._id}>
                <li
                  onClick={event => handleClick(event, userProfile)}
                >
                  {`${userProfile.firstName} ${userProfile.lastName}`}
                </li>
              </a>
            ))}
          </ul>
        )}
      </div>
      <div>
        {participantList?.map(participant => (
          <ul
            key={`${participant.userProfileId}`}
          >
            <li
              className="rounded-pill badge bg-primary text-wrap"
              onClick={() => removeParticipant(participant.userProfileId)}
            >
              <div className="text-white">
                <small className="fs-6 mr-1">{`${participant.name}`}</small>
                <FontAwesomeIcon icon={faTimesCircle} />
              </div>
            </li>
        </ul>
        ))}
      </div>
    </div>
  )
}

export default Participants;
