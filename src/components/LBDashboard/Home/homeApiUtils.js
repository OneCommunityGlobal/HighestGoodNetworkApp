const VILLAGE_SUFFIX = 'village';

export const stripVillageSuffix = value => {
  const input = String(value || '').trim();
  if (!input) return '';
  const lower = input.toLowerCase();
  if (!lower.endsWith(VILLAGE_SUFFIX)) return input;
  return input.slice(0, -VILLAGE_SUFFIX.length).trim();
};

export const buildApiFilters = (selectedVillage, dateRange) => {
  const filters = {};
  if (selectedVillage) filters.village = selectedVillage;
  if (dateRange.startDate) filters.availableFrom = dateRange.startDate;
  if (dateRange.endDate) filters.availableTo = dateRange.endDate;
  return filters;
};

export const withVillageFallback = async (
  fetcher,
  currentPage,
  pageSize,
  filters,
  selectedVillage,
  villageFilterCandidates,
) => {
  let response = await fetcher(currentPage, pageSize, filters);
  if (!selectedVillage || (response.items || []).length > 0) return response;

  const fallbackVillages = villageFilterCandidates(selectedVillage).filter(
    v => v !== filters.village,
  );
  for (const villageCandidate of fallbackVillages) {
    const retryResponse = await fetcher(currentPage, pageSize, {
      ...filters,
      village: villageCandidate,
    });
    if ((retryResponse.items || []).length > 0) {
      response = retryResponse;
      break;
    }
  }
  return response;
};

export const filterItemsByVillage = (items, selectedVillage, normalizeVillageName) => {
  if (!selectedVillage) return items;
  const selectedKey = normalizeVillageName(selectedVillage);
  const strictMatches = items.filter(item => normalizeVillageName(item.village) === selectedKey);
  return strictMatches.length > 0 ? strictMatches : items;
};
