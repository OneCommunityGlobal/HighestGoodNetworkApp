import { useEffect } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import Select from 'react-select';
import { Button, Row, Col, FormGroup } from 'reactstrap';
import mainStyles from './WeeklySummariesReport.module.css';
import WeeklySummariesToggleFilter from './WeeklySummariesToggleFilter.jsx';
import { setField, removeItemFromField } from '~/utils/stateHelper';

const getDarkSelectStyles = (darkMode, warning = false) => {
  const controlBackground = darkMode ? '#0b1422' : '#ffffff';
  const textColor = darkMode ? '#f5f7fb' : '#111827';

  const focusedBorderColor = darkMode ? '#60a5fa' : '#2563eb';
  const normalBorderColor = darkMode ? '#334155' : '#ced4da';
  const warningBorderColor = '#e22a2a';

  const getBorderColor = isFocused => {
    if (warning) return warningBorderColor;
    return isFocused ? focusedBorderColor : normalBorderColor;
  };

  const focusedOptionBg = darkMode ? '#16233a' : '#eee';
  const normalOptionBg = darkMode ? '#0b1422' : '#ffffff';

  return {
    menuPortal: base => ({ ...base, zIndex: 9999 }),

    control: (base, state) => ({
      ...base,
      backgroundColor: controlBackground,
      borderColor: getBorderColor(state.isFocused),
      color: textColor,
      boxShadow: 'none',
    }),

    menu: base => ({
      ...base,
      backgroundColor: controlBackground,
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? focusedOptionBg : normalOptionBg,
      color: textColor,
    }),

    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#1f2a44' : '#e5e7eb',
    }),

    multiValueLabel: base => ({
      ...base,
      color: textColor,
    }),
  };
};

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

  return (
    <FormGroup>
      <Row className="pt-4">
        <Col md={6} sm={12}>
          <div>
            <b>Select Team Code</b>
          </div>
          <Select
            isMulti
            options={teamCodes}
            value={state.selectedCodes}
            onChange={value => setState({ ...state, selectedCodes: value })}
            menuPortalTarget={document.body}
            styles={getDarkSelectStyles(darkMode, teamCodeWarningUsers?.length > 0)}
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
          <Select
            isMulti
            options={colorOptions}
            value={state.selectedColors}
            onChange={value => setState({ ...state, selectedColors: value })}
            menuPortalTarget={document.body}
            styles={getDarkSelectStyles(darkMode)}
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
            className={`${mainStyles.extraMembersSelect} ${
              darkMode ? mainStyles.extraMembersDark : ''
            }`}
            options={state.membersFromUnselectedTeam}
            value={state.selectedExtraMembers}
            onChange={value => setState({ ...state, selectedExtraMembers: value })}
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
      <WeeklySummariesToggleFilter
        state={state}
        setState={setState}
        hasPermissionToFilter={hasPermissionToFilter}
        editable={true}
        formId="filter-edit"
      />
    </FormGroup>
  );
}
