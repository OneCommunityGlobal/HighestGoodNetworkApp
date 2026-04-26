export const mapFilterToState = (filterData, teamCodes, colorOptions, summaries, memberDict) => {
  const selectedCodesChoice = teamCodes
    .filter((code) => filterData.selectedCodes.has(code.value))
    .map((item) => {
      const [code, count] = item.label.split(' (');
      return {
        ...item,
        label: `${code.padEnd(10, ' ')} (${count}`,
      };
    });

  const selectedCodesSet = new Set(selectedCodesChoice.map((item) => item.value));

  const selectedCodesInvalidChoice = [...filterData.selectedCodes]
    .filter((item) => !selectedCodesSet.has(item))
    .map((item) => ({
      label: `${item.padEnd(10, ' ')} (0)`,
      value: item,
      _ids: [],
    }));

  const selectedColorsChoice = colorOptions.filter((color) =>
    filterData.selectedColors.has(color.value)
  );
  
  const selectedColorsSet = new Set(selectedColorsChoice.map((item) => item.value));
  
  const selectedColorsInvalidChoice = [...filterData.selectedColors]
    .filter((item) => !selectedColorsSet.has(item))
    .map((item) => ({
      label: item,
      value: item,
    }));

  const selectedExtraMembersChoice = summaries
    .filter((summary) => filterData.selectedExtraMembers.has(summary._id))
    .map((summary) => ({
      label: `${summary.firstName} ${summary.lastName}`,
      value: summary._id,
      role: summary.role,
    }));

  const selectedExtraMembersSet = new Set(selectedExtraMembersChoice.map((item) => item.value));
  
  const selectedExtraMembersInvalidChoice = [...filterData.selectedExtraMembers]
    .filter((item) => !selectedExtraMembersSet.has(item))
    .map((item) => ({
      label: item in memberDict ? memberDict[item] : 'N/A',
      value: item,
      role: '',
    }));

  return {
    filterName: filterData.label || filterData.filterName, // Handle cases where label might be used
    selectedCodes: selectedCodesChoice,
    selectedColors: selectedColorsChoice,
    selectedExtraMembers: selectedExtraMembersChoice,
    selectedTrophies: filterData.selectedTrophies,
    selectedSpecialColors: filterData.selectedSpecialColors,
    selectedBioStatus: filterData.selectedBioStatus,
    selectedOverTime: filterData.selectedOverTime,
    selectedCodesInvalid: selectedCodesInvalidChoice,
    selectedColorsInvalid: selectedColorsInvalidChoice,
    selectedExtraMembersInvalid: selectedExtraMembersInvalidChoice,
  };
};