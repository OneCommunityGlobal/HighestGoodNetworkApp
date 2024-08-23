import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import BadgeDevelopmentTable from './BadgeDevelopmentTable';
import CreateNewBadgePopup from './CreateNewBadgePopup';
import '../Header/DarkMode.css';

function BadgeDevelopment(props) {
  const { darkMode, allBadgeData } = props;

  const [isCreateNewBadgePopupOpen, setCreateNewBadgePopupOpen] = useState(false);
  const [isAddFiltersOpen, setAddFiltersOpen] = useState(false);
  const [searchType, setSearchType] = useState('');
  const [rankFilter, setRankFilter] = useState(300);
  const [searchName, setSearchName] = useState('');

  const toggle = () => setCreateNewBadgePopupOpen(prevIsOpen => !prevIsOpen);
  const toggleFilters = () => setAddFiltersOpen(prevState => !prevState);

  // Filter badge data based on type, report, and rank
  const filteredBadgeData = allBadgeData.filter(badge => {
    const matchesType = searchType === '' || badge.type.toLowerCase().includes(searchType.toLowerCase());
    const matchesRank = badge.ranking <= rankFilter;
    const matchesName = searchName === '' || badge.badgeName.toLowerCase().includes(searchName.toLowerCase());

    return matchesType && matchesRank && matchesName;
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
          <p>Search for a badge:</p>
          <input
            type="text"
            placeholder="Enter name here"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <p style ={{paddingTop: '10px'}}>Filter by Type:</p>
          <input
            type="text"
            placeholder="Enter type here"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          />
          <p style ={{paddingTop: '10px'}}>Filter by Rank (0 - {rankFilter}):</p>
          <input
            type="range"
            id="rank-filter"
            min="0"
            max="300"
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
          />
          
        </div>
      )}
      <Modal
        isOpen={isCreateNewBadgePopupOpen}
        toggle={toggle}
        backdrop="static"
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={toggle}>
          New Badge
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <CreateNewBadgePopup toggle={toggle} />
        </ModalBody>
      </Modal>
      {filteredBadgeData.length === 0 ? (
        <p>No badges match the current filters.</p>
      ) : (
        <BadgeDevelopmentTable allBadgeData={filteredBadgeData} />
      )}
    </div>
  );
}

export default BadgeDevelopment;
