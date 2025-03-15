import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import BadgeTypes from './BadgeTypes';
import CreateNewBadgePopup from './CreateNewBadgePopup';
import '../Header/DarkMode.css';
import { matches } from 'lodash';

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

  // convert rank number into integer
  const chooseRankFilterNumber = chooseRankFilter ? Number(chooseRankFilter) : null;

  // filter badge data based on type, report, and rank
  const filteredBadgeData = allBadgeData.filter(badge => {
    const matchesType = searchType === '' || badge.type.replace(/\s+/g, '').toLowerCase().includes(searchType.replace(/\s+/g, '').toLowerCase());
    const matchesRank = badge.ranking <= rankFilter;
    const matchesChoosenRank = chooseRankFilterNumber === null || badge.ranking === chooseRankFilterNumber;
    const matchesName = searchName === '' || badge.badgeName.replace(/\s+/g, '').toLowerCase().includes(searchName.replace(/\s+/g, '').toLowerCase());

    return matchesType && matchesRank && matchesName && matchesChoosenRank;
  });

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
        Add Filters
      </Button>
      {isAddFiltersOpen && (
        <div style={{ marginTop: '20px', paddingLeft: '20px' }}>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ display: 'inline', marginRight: '8px' }}>Search for a badge:</p>
            <input
              type="text"
              placeholder="Enter name here"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ display: 'inline', marginRight: '8px' }}>Filter by type:</p>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="">Select a type</option>
              {BadgeTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <p style={{ display: 'inline', marginRight: '8px' }}>Filter by Rank (0 - {rankFilter}):</p>
            <input
              type="range"
              id="rank-filter"
              min="0"
              max="300"
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value)}
            />
            <div style={{ display: 'inline-block', marginLeft: '8px', verticalAlign: 'middle' }}>
              <p style={{ display: 'inline', marginRight: '8px' }}>Or choose a rank:</p>
              <input
                type="text"
                placeholder="Rank Number"
                value={chooseRankFilter}
                onChange={(e) => setChooseRankFilter(e.target.value)}
                style={{ width: '80px', textAlign: 'center' }}
              />
            </div>
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
      <br/>
      {filteredBadgeData.length === 0 ? (
        <p> No badges match the current filters.</p>
      ) : (
        <BadgeDevelopmentTable allBadgeData={filteredBadgeData} />
      )}
    </div>
  );
}

export default BadgeDevelopment;