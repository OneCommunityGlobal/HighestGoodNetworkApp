import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
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

  return (
    <div className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
      <Button
        className="btn--dark-sea-green"
        onClick={toggle}
        style={darkMode ? { ...boxStyleDark, margin: 20 } : { ...boxStyle, margin: 20 }}
      >
        Create New Badge
      </Button>
      <Button
        className="btn--dark-sea-green"
        onClick={toggleFilters}
        style={darkMode ? { ...boxStyleDark, margin: 20 } : { ...boxStyle, margin: 20 }}
      >
        {isAddFiltersOpen ? 'Remove Filters' : 'Add Filters'}
      </Button>
      {isAddFiltersOpen && (
        <div className={styles.filtersContainer}>
          <div className={styles.filterRow}>
            <p className={`${styles.filterLabel} ${darkMode ? 'text-light' : 'text-dark'}`}>
              Search for a badge:
            </p>
            <input
              type="text"
              placeholder="Enter name here"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              className={`${styles.filterInput} ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
              }`}
            />
          </div>
          <div className={styles.filterRow}>
            <p className={`${styles.filterLabel} ${darkMode ? 'text-light' : 'text-dark'}`}>
              Filter by type:
            </p>
            <select
              value={searchType}
              onChange={e => setSearchType(e.target.value)}
              className={`${styles.filterInput} ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
              }`}
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
            <p className={`${styles.filterLabel} ${darkMode ? 'text-light' : 'text-dark'}`}>
              Filter by Rank (0 - {rankFilter}):
            </p>
            <input
              type="range"
              id="rank-filter"
              min="0"
              max="300"
              value={rankFilter}
              onChange={e => setRankFilter(e.target.value)}
            />
            <p className={`${styles.filterLabelMid} ${darkMode ? 'text-light' : 'text-dark'}`}>
              Or choose a rank:
            </p>
            <input
              type="text"
              placeholder="Rank Number"
              value={chooseRankFilter}
              onChange={e => setChooseRankFilter(e.target.value)}
              className={`${styles.rankInput} ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
              }`}
            />
          </div>
        </div>
      )}
      <Modal
        isOpen={isCreateNewBadgePopupOpen}
        toggle={toggle}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
          New Badge
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
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
