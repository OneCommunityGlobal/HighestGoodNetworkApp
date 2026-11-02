export const formatVillageLabel = village => {
  if (!village || village === 'City Center') {
    return village || '';
  }
  return `${village} Village`;
};

export const formatMapVillageTitle = village => {
  if (!village) return 'Property Map';
  const suffix = village === 'City Center' ? '' : ' Village';
  return `Property Map - ${village}${suffix}`;
};
