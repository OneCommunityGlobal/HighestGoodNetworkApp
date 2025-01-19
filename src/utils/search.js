const normalizeString = str => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

// search whether the input contains searchText (ignoring accents, ignoring case)
export const searchWithAccent = (input, searchText) => {
  if (!searchText) return true;
  if (!input) return false;

  const trimmedSearchText = searchText.trim();
  const searchNormalized = normalizeString(trimmedSearchText);
  const hasAccents = searchNormalized !== trimmedSearchText.toLowerCase();

  if (hasAccents) {
    return input.toLowerCase().includes(trimmedSearchText.toLowerCase());
  }
  return normalizeString(input).includes(searchNormalized);
};

export default searchWithAccent;
