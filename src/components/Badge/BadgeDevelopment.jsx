import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { getBoxStyling } from '~/styles';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import BadgeTypes from './BadgeTypes';
import CreateNewBadgePopup from './CreateNewBadgePopup';
import '../Header/index.module.css';
import styles from './BadgeDevelopment.module.css';

function normalize(str) {
  return str.replace(/\s+/g, '').toLowerCase();
}

function badgeMatchesFilters(badge, searchName, searchType, rankFilter, chooseRankFilterNumber) {
  if (searchName !== '' && !normalize(badge.badgeName).includes(normalize(searchName)))
    return false;
  if (searchType !== '' && !normalize(badge.type).includes(normalize(searchType))) return false;
  if (badge.ranking > rankFilter) return false;
  if (chooseRankFilterNumber !== null && badge.ranking !== chooseRankFilterNumber) return false;
  return true;
}

function getDark(darkMode, darkClass, lightClass = '') {
  return darkMode ? darkClass : lightClass;
}

function BadgeDevelopment(props) {
  const { darkMode, allBadgeData = [] } = props;
  const [isCreateNewBadgePopupOpen, setCreateNewBadgePopupOpen] = useState(false);
  const [isAddFiltersOpen, setAddFiltersOpen] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [rankFilter, setRankFilter] = useState(300);
  const [chooseRankFilter, setChooseRankFilter] = useState('');
  const [searchName, setSearchName] = useState('');

  const toggle = () => setCreateNewBadgePopupOpen(prevIsOpen => !prevIsOpen);
  const toggleFilters = () => setAddFiltersOpen(prevState => !prevState);

  const chooseRankFilterNumber = chooseRankFilter ? Number(chooseRankFilter) : null;

  const filteredBadgeData = allBadgeData.filter(badge =>
    badgeMatchesFilters(badge, searchName, searchType, rankFilter, chooseRankFilterNumber),
  );

  const labelClass = `${styles.filterLabel} ${getDark(darkMode, 'text-light', 'text-dark')}`;
  const inputClass = `${styles.filterInput} ${getDark(
    darkMode,
    'bg-darkmode-liblack text-light border-0',
  )}`;

  return (
    <div className={getDark(darkMode, 'bg-yinmn-blue text-light')}>
      <Button
        className={`btn--dark-sea-green ${styles.btn}`}
        onClick={toggle}
        style={getBoxStyling(darkMode)}
      >
        Create New Badge
      </Button>
      <Button
        className={`btn--dark-sea-green ${styles.btn}`}
        onClick={toggleFilters}
        style={getBoxStyling(darkMode)}
      >
        {isAddFiltersOpen ? 'Remove Filters' : 'Add Filters'}
      </Button>
      {isAddFiltersOpen && (
        <div className={styles.filtersContainer}>
          <div className={styles.filterRow}>
            <p className={labelClass}>Search for a badge:</p>
            <input
              type="text"
              placeholder="Enter name here"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className={styles.filterRow}>
            <p className={labelClass}>Filter by type:</p>
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a type</option>
              {BadgeTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterRowLast}>
            <p className={labelClass}>Filter by Rank (0 - {rankFilter}):</p>
            <input
              type="range"
              id="rank-filter"
              min="0"
              max="300"
              value={rankFilter}
              onChange={e => setRankFilter(e.target.value)}
            />
            <p
              className={`${styles.filterLabelMid} ${getDark(darkMode, 'text-light', 'text-dark')}`}
            >
              Or choose a rank:
            </p>
            <input
              type="text"
              placeholder="Rank Number"
              value={chooseRankFilter}
              onChange={e => setChooseRankFilter(e.target.value)}
              className={`${styles.rankInput} ${getDark(
                darkMode,
                'bg-darkmode-liblack text-light border-0',
              )}`}
            />
          </div>
        </div>
      )}
      <Modal
        isOpen={isCreateNewBadgePopupOpen}
        toggle={toggle}
        className={getDark(darkMode, 'text-light dark-mode')}
      >
        <ModalHeader className={getDark(darkMode, 'bg-space-cadet')} toggle={toggle}>
          New Badge
        </ModalHeader>
        <ModalBody className={getDark(darkMode, 'bg-yinmn-blue')}>
          <CreateNewBadgePopup toggle={toggle} />
        </ModalBody>
      </Modal>
      <br />
      {filteredBadgeData.length === 0 ? (
        <p> No badges match the current filters.</p>
      ) : (
        <BadgeDevelopmentTable allBadgeData={filteredBadgeData} />
      )}
    </div>
  );
}

export default BadgeDevelopment;
