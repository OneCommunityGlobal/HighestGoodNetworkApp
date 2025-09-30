import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, Label } from 'reactstrap';
import Select from 'react-select';
import styles from './SelectFilterModal.module.scss';
import mainStyles from './WeeklySummariesReport.module.css';

export default function SelectFilterModal({
  isOpen,
  toggle,
  filters,
  applyFilter,
  memberDict,
  darkMode,
}) {
  const [selectedFilter, setSelectedFilter] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFilter(null);
    }
  }, [isOpen]);

  const handleSelectedFilter = () => {
    applyFilter(selectedFilter);
    setSelectedFilter(null);
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className={`${darkMode ? mainStyles.darkModal : ''}`}>
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>
      <ModalBody>
        <Form>
          <div>Please select a filter:</div>
          <Select
            className="text-dark"
            options={filters}
            value={selectedFilter}
            onChange={setSelectedFilter}
            required
          />
          {selectedFilter && (
            <div>
              <div>Selected Team Codes:</div>
              <div className={styles.smScrollable}>
                {[...selectedFilter.filterData.selectedCodes].map(item => (
                  <div
                    key={item}
                    className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div>Selected Colors:</div>
              <div className={styles.smScrollable}>
                {[...selectedFilter.filterData.selectedColors].map(item => (
                  <div
                    key={item}
                    className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div>Selected Extra Member:</div>
              <div className={styles.smScrollable}>
                {[...selectedFilter.filterData.selectedExtraMembers].map(item => (
                  <div
                    key={item}
                    className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
                  >
                    {item in memberDict ? memberDict[item] : 'N/A'}
                  </div>
                ))}
              </div>
              <div className={`${styles.filterContainerStart} pt-4`}>
                <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                  <span>Filter by Special Colors</span>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
                  >
                    {['purple', 'green', 'navy'].map(color => (
                      <div
                        key={`${color}-toggle`}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <div className={`${mainStyles.switchToggleControl}`}>
                          <input
                            type="checkbox"
                            className={`${mainStyles.switchToggle}`}
                            id={`select-filter-${color}-toggle`}
                            checked={selectedFilter.filterData.selectedSpecialColors[color]}
                            disabled
                          />
                          <Label
                            className={`${mainStyles.switchToggleLabel}`}
                            for={`select-filter-${color}-toggle`}
                          >
                            <span className={`${mainStyles.switchToggleInner}`} />
                            <span className={`${mainStyles.switchToggleSwitch}`} />
                          </Label>
                        </div>
                        <span
                          style={{
                            marginLeft: '3px',
                            fontSize: 'inherit',
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap',
                            fontWeight: 'normal',
                          }}
                        >
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={`${styles.filterContainerStart} pt-4`}>
                <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                  <span>Filter by Bio Status</span>
                  <div className={`${mainStyles.switchToggleControl}`}>
                    <input
                      type="checkbox"
                      className={`${mainStyles.switchToggle}`}
                      checked={selectedFilter.filterData.selectedBioStatus}
                      id="select-filter-bio-status-toggle"
                      disabled
                    />
                    <Label
                      className={`${mainStyles.switchToggleLabel}`}
                      for="select-filter-bio-status-toggle"
                    >
                      <span className={`${mainStyles.switchToggleInner}`} />
                      <span className={`${mainStyles.switchToggleSwitch}`} />
                    </Label>
                  </div>
                </div>

                <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                  <span>Filter by Trophies</span>
                  <div className={`${mainStyles.switchToggleControl}`}>
                    <input
                      type="checkbox"
                      className={`${mainStyles.switchToggle}`}
                      checked={selectedFilter.filterData.selectedTrophies}
                      id="select-filter-trophy-toggle"
                      disabled
                    />
                    <Label
                      className={`${mainStyles.switchToggleLabel}`}
                      for="select-filter-trophy-toggle"
                    >
                      <span className={`${mainStyles.switchToggleInner}`} />
                      <span className={`${mainStyles.switchToggleSwitch}`} />
                    </Label>
                  </div>
                </div>

                <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
                  <span>Filter by Over Hours</span>
                  <div className={`${mainStyles.switchToggleControl}`}>
                    <input
                      type="checkbox"
                      className={`${mainStyles.switchToggle}`}
                      checked={selectedFilter.filterData.selectedOverTime}
                      id="select-filter-over-hours-toggle"
                      disabled
                    />
                    <Label
                      className={`${mainStyles.switchToggleLabel}`}
                      for="select-filter-over-hours-toggle"
                    >
                      <span className={`${mainStyles.switchToggleInner}`} />
                      <span className={`${mainStyles.switchToggleSwitch}`} />
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSelectedFilter}>
          Apply
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
