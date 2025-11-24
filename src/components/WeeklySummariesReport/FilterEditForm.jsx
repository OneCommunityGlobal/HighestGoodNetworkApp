import { useEffect } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import { Button, Label, Row, Col, FormGroup } from 'reactstrap';
import mainStyles from './WeeklySummariesReport.module.css';
import { setField, toggleField, removeItemFromField, setChildField } from '~/utils/stateHelper';

export default function FilterEditForm({
  state,
  setState,
  darkMode,
  hasPermissionToFilter,
  canSeeBioHighlight,
  teamCodes,
  colorOptions,
  tableData,
  summaries,
  teamCodeWarningUsers,
}) {
  // Update members of membersFromUnselectedTeam dropdown
  useEffect(() => {
    // Add all selected member in a Set
    const selectedMemberSet = new Set();

    state.selectedCodes.forEach(code => {
      if (code.value === '') return;
      if (code.value in tableData) {
        const team = tableData[code.value];
        team.forEach(member => {
          selectedMemberSet.add(member._id);
        });
      }
    });

    // Filter members from unselected set
    const newMembersFromUnselectedTeam = [];
    summaries.forEach(summary => {
      if (!selectedMemberSet.has(summary._id)) {
        newMembersFromUnselectedTeam.push({
          label: `${summary.firstName} ${summary.lastName}`,
          value: summary._id,
          role: summary.role,
        });
      }
    });
    setState(prev => ({
      ...prev,
      membersFromUnselectedTeam: newMembersFromUnselectedTeam,
      // Remove individuals that is in selected team
      selectedExtraMembers: state.selectedExtraMembers.filter(
        member => !selectedMemberSet.has(member.value),
      ),
    }));
  }, [state.selectedCodes, summaries]);

  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  const handleBioStatusToggleChange = () => {
    toggleField(setState, 'selectedBioStatus');
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  return (
    <FormGroup>
      <Row className="pt-4">
        <Col md={6} sm={12}>
          <div>
            <b>Select Team Code</b>
          </div>
          <MultiSelect
            className={`top-select ${mainStyles['report-multi-select-filter']} ${
              mainStyles.textDark
            } 
                  ${darkMode ? 'dark-mode' : ''} ${
              teamCodeWarningUsers.length > 0 ? 'warning-border' : ''
            }`}
            options={teamCodes.map(item => {
              const [code, count] = item.label.split(' (');
              return {
                ...item,
                label: `${code.padEnd(10, ' ')} (${count}`,
              };
            })}
            value={state.selectedCodes}
            onChange={e => setField(setState, 'selectedCodes', e)}
            labelledBy="Select"
          />
        </Col>
        <Col md={6} sm={12}>
          <div>Selected Team Code</div>
          <div className={`${mainStyles.smScrollable}`}>
            {state.selectedCodes.map(item => (
              <div
                key={item.value}
                className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
              >
                {item.label}
                <Button
                  close
                  onClick={() => removeItemFromField(setState, 'selectedCodes', item)}
                  className={`${mainStyles.minSzButton} px-2`}
                  aria-label={`Remove ${item.label}`}
                />
              </div>
            ))}
            {state.selectedCodesInvalid.map(item => (
              <div
                key={item.value}
                className={`${darkMode ? mainStyles.redChip : ''} ${mainStyles.invalidChip}`}
              >
                {item.label}
                <Button
                  close
                  onClick={() => removeItemFromField(setState, 'selectedCodesInvalid', item)}
                  className={`${mainStyles.minSzButton} px-2`}
                  aria-label={`Remove ${item.label}`}
                />
              </div>
            ))}
          </div>
          {state.selectedCodesInvalid.length > 0 && (
            <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
              ** The team code in pink is the team code that no longer have any members
            </div>
          )}
        </Col>
      </Row>
      <Row className="pt-4">
        <Col md={6} sm={12}>
          <div>
            <b>Select Color</b>
          </div>
          <MultiSelect
            className={`report-multi-select-filter second-select ${mainStyles.textDark} ${
              darkMode ? 'dark-mode' : ''
            }`}
            options={colorOptions}
            value={state.selectedColors}
            onChange={e => setField(setState, 'selectedColors', e)}
          />
        </Col>
        <Col md={6} sm={12}>
          <div>Selected Colors</div>
          <div className={`${mainStyles.smScrollable}`}>
            {state.selectedColors.map(item => (
              <div
                key={item.value}
                className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
              >
                {item.label}
                <Button
                  close
                  onClick={() => removeItemFromField(setState, 'selectedColors', item)}
                  className={`${mainStyles.minSzButton} px-2`}
                  aria-label={`Remove ${item.label}`}
                />
              </div>
            ))}
            {state.selectedColorsInvalid.map(item => (
              <div
                key={item.value}
                className={`${darkMode ? mainStyles.redChip : ''} ${mainStyles.invalidChip}`}
              >
                {item.label}
                <Button
                  close
                  onClick={() => removeItemFromField(setState, 'selectedColorsInvalid', item)}
                  className={`${mainStyles.minSzButton} px-2`}
                  aria-label={`Remove ${item.label}`}
                />
              </div>
            ))}
          </div>
          {state.selectedColorsInvalid.length > 0 && (
            <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
              ** The colors in pink are the colors that no longer have any members
            </div>
          )}
        </Col>
      </Row>
      <Row className="pt-4">
        <Col md={6} sm={12}>
          <div>
            <b>Select Extra Members</b>
          </div>
          <MultiSelect
            className={`report-multi-select-filter ${mainStyles.textDark} ${
              darkMode ? 'dark-mode' : ''
            }`}
            options={state.membersFromUnselectedTeam}
            value={state.selectedExtraMembers}
            onChange={e => setField(setState, 'selectedExtraMembers', e)}
          />
        </Col>
        <Col md={6} sm={12}>
          <div>Selected Extra Members</div>
          <div className={`${mainStyles.smScrollable}`}>
            {state.selectedExtraMembers.map(item => (
              <div
                key={item.value}
                className={`${mainStyles.chip} ${darkMode ? mainStyles.darkChip : ''}`}
              >
                {item.label}
                <Button
                  close
                  onClick={() => removeItemFromField(setState, 'selectedExtraMembers', item)}
                  className={`${mainStyles.minSzButton} px-2`}
                  aria-label={`Remove ${item.label}`}
                />
              </div>
            ))}
            {state.selectedExtraMembersInvalid.map(item => (
              <div
                key={item.value}
                className={`${darkMode ? mainStyles.redChip : ''} ${mainStyles.invalidChip}`}
              >
                {item.label}
                <Button
                  close
                  onClick={() => removeItemFromField(setState, 'selectedExtraMembersInvalid', item)}
                  className={`${mainStyles.minSzButton} px-2`}
                  aria-label={`Remove ${item.label}`}
                />
              </div>
            ))}
          </div>
          {state.selectedExtraMembersInvalid.length > 0 && (
            <div className={`${darkMode ? mainStyles.errorTextDark : mainStyles.errorText}`}>
              ** The members in pink is the members that cannot be found in the dropdown. They might
              be inactive, deleted or in a selected team code.
            </div>
          )}
        </Col>
      </Row>
      <div className={`${mainStyles.filterContainer} pt-4`}>
        {hasPermissionToFilter && (
          <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
            <span>Filter by Special Colors</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              {['purple', 'green', 'navy'].map(color => (
                <div key={`${color}-toggle`} style={{ display: 'flex', alignItems: 'center' }}>
                  <div className={`${mainStyles.switchToggleControl}`}>
                    <input
                      type="checkbox"
                      className={`${mainStyles.switchToggle}`}
                      id={`filter-modal-${color}-toggle`}
                      checked={state.selectedSpecialColors[color]}
                      onChange={e =>
                        setChildField(setState, 'selectedSpecialColors', color, e.target.checked)
                      }
                    />
                    <Label
                      className={`${mainStyles.switchToggleLabel}`}
                      for={`filter-modal-${color}-toggle`}
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
        )}
      </div>
      <div className={`${mainStyles.filterContainer} pt-4`}>
        {(hasPermissionToFilter || canSeeBioHighlight) && (
          <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
            <span>Filter by Bio Status</span>
            <div className={`${mainStyles.switchToggleControl}`}>
              <input
                type="checkbox"
                className={`${mainStyles.switchToggle}`}
                id="filter-modal-bio-status-toggle"
                checked={state.selectedBioStatus}
                onChange={handleBioStatusToggleChange}
              />
              <Label
                className={`${mainStyles.switchToggleLabel}`}
                for="filter-modal-bio-status-toggle"
              >
                <span className={`${mainStyles.switchToggleInner}`} />
                <span className={`${mainStyles.switchToggleSwitch}`} />
              </Label>
            </div>
          </div>
        )}
        {hasPermissionToFilter && (
          <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
            <span>Filter by Trophies</span>
            <div className={`${mainStyles.switchToggleControl}`}>
              <input
                type="checkbox"
                className={`${mainStyles.switchToggle}`}
                checked={state.selectedTrophies}
                id="filter-modal-trophy-toggle"
                onChange={handleTrophyToggleChange}
              />
              <Label className={`${mainStyles.switchToggleLabel}`} for="filter-modal-trophy-toggle">
                <span className={`${mainStyles.switchToggleInner}`} />
                <span className={`${mainStyles.switchToggleSwitch}`} />
              </Label>
            </div>
          </div>
        )}
        {hasPermissionToFilter && (
          <div className={`${mainStyles.filterStyle} ${mainStyles.marginRight}`}>
            <span>Filter by Over Hours</span>
            <div className={`${mainStyles.switchToggleControl}`}>
              <input
                type="checkbox"
                className={`${mainStyles.switchToggle}`}
                checked={state.selectedOverTime}
                id="filter-modal-over-hours-toggle"
                onChange={handleOverHoursToggleChange}
              />
              <Label
                className={`${mainStyles.switchToggleLabel}`}
                for="filter-modal-over-hours-toggle"
              >
                <span className={`${mainStyles.switchToggleInner}`} />
                <span className={`${mainStyles.switchToggleSwitch}`} />
              </Label>
            </div>
          </div>
        )}
      </div>
    </FormGroup>
  );
}
