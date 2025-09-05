import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form } from 'reactstrap';
import Select from 'react-select';
import styles from './SelectFilterModal.module.scss';

export default function SelectFilterModal({ isOpen, toggle, filters, applyFilter, memberDict }) {
  const [selectedFilter, setSelectedFilter] = useState(null);

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="weekly-summaries-report">
      <ModalHeader toggle={toggle}>Select a Filter</ModalHeader>
      <ModalBody>
        <Form>
          <div>Please select a filter:</div>
          <Select options={filters} value={selectedFilter} onChange={setSelectedFilter} required />
          {selectedFilter && (
            <div>
              <div>Selected Team Codes:</div>
              <div className={styles.smScrollable}>
                {[...selectedFilter.filterData.selectedCodes].map(item => (
                  <div key={item} className={styles.chip}>
                    {item}
                  </div>
                ))}
              </div>
              <div>Selected Colors:</div>
              <div className={styles.smScrollable}>
                {[...selectedFilter.filterData.selectedColors].map(item => (
                  <div key={item} className={styles.chip}>
                    {item}
                  </div>
                ))}
              </div>
              <div>Selected Extra Member:</div>
              <div className={styles.smScrollable}>
                {[...selectedFilter.filterData.selectedExtraMembers].map(item => (
                  <div key={item} className={styles.chip}>
                    {item in memberDict ? memberDict[item] : 'N/A'}
                  </div>
                ))}
              </div>
              <div className={`${styles.filterContainerStart} pt-4`}>
                <div className="filter-style margin-right">
                  <span>Filter by Special Colors</span>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}
                  >
                    {['purple', 'green', 'navy'].map(color => (
                      <div
                        key={`${color}-toggle`}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <div className="switch-toggle-control">
                          <input
                            type="checkbox"
                            className="switch-toggle"
                            id={`select-filter-${color}-toggle`}
                            checked={selectedFilter.filterData.selectedSpecialColors[color]}
                            disabled
                          />
                          <label
                            className="switch-toggle-label"
                            htmlFor={`select-filter-${color}-toggle`}
                          >
                            <span className="switch-toggle-inner" />
                            <span className="switch-toggle-switch" />
                          </label>
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
                <div className="filter-style margin-right">
                  <span>Filter by Bio Status</span>
                  <div className="switch-toggle-control">
                    <input
                      type="checkbox"
                      className="switch-toggle"
                      checked={selectedFilter.filterData.selectedBioStatus}
                      id="select-filter-bio-status-toggle"
                      disabled
                    />
                    <label
                      className="switch-toggle-label"
                      htmlFor="select-filter-bio-status-toggle"
                    >
                      <span className="switch-toggle-inner" />
                      <span className="switch-toggle-switch" />
                    </label>
                  </div>
                </div>

                <div className="filter-style margin-right">
                  <span>Filter by Trophies</span>
                  <div className="switch-toggle-control">
                    <input
                      type="checkbox"
                      className="switch-toggle"
                      checked={selectedFilter.filterData.selectedTrophies}
                      id="select-filter-trophy-toggle"
                      disabled
                    />
                    <label className="switch-toggle-label" htmlFor="select-filter-trophy-toggle">
                      <span className="switch-toggle-inner" />
                      <span className="switch-toggle-switch" />
                    </label>
                  </div>
                </div>

                <div className="filter-style">
                  <span>Filter by Over Hours</span>
                  <div className="switch-toggle-control">
                    <input
                      type="checkbox"
                      className="switch-toggle"
                      checked={selectedFilter.filterData.selectedOverTime}
                      id="select-filter-over-hours-toggle"
                      disabled
                    />
                    <label
                      className="switch-toggle-label"
                      htmlFor="select-filter-over-hours-toggle"
                    >
                      <span className="switch-toggle-inner" />
                      <span className="switch-toggle-switch" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => applyFilter(selectedFilter)}>
          Apply
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
