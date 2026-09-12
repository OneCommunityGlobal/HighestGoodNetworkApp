export const normalizeFilter = (filter) => {
  return {
    label: filter.filterName,
    value: filter._id,
    filterData: {
      filterName: filter.filterName,
      selectedCodes: new Set(filter.selectedCodes),
      selectedColors: new Set(filter.selectedColors),
      selectedExtraMembers: new Set(filter.selectedExtraMembers),
      selectedTrophies: filter.selectedTrophies,
      selectedSpecialColors: filter.selectedSpecialColors,
      selectedBioStatus: filter.selectedBioStatus,
      selectedOverTime: filter.selectedOverTime,
    },
  };
}