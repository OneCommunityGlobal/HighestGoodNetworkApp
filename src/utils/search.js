const normalizeString = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}


// search whether the input contains searchText (ignoring accents, ignoring case)
export const searchWithAccent = (input, searchText) => {
  // check if searchText has accent
  if(!searchText) return true;
  if(!input) return false;
  const searchNormalized = normalizeString(searchText);
  const hasAccents = searchNormalized !== searchText.toLowerCase();

  if(hasAccents) {
    // if searchText has accent, we compare it directly
    return input.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
  }
  return normalizeString(input).indexOf(searchNormalized) !== -1;
}