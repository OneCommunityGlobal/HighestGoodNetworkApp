export const levenshteinDistance = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(0));

  for (let i = 0; i <= s1.length; i++){
    track[0][i] = i;
  }  

  for (let j = 0; j <=s2.length; j++){
    track[j][0] = j;
  }

  for (let j = 1; j <= s2.length; j++){
    for (let i = 1; i <= s1.length; i++){
      const indicator = s1[i-1] === s2[j-1] ?0 : 1;
      track[j][i] = Math.min(
        track[j][i-1] + 1,
        track[j-1][i] + 1,
        track[j - 1][i - 1] + indicator,
      )
    }
  }
  return track[s2.length][s1.length];
};

export const calculateSimilarity = (str1, str2) => {
  
  if(!str1 || !str2){
    return 0;
  }

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return 1 - distance / maxLength;
};

export const fuzzySearch = (input, searchText, threshold = 0.6) => {

  if(!searchText || !searchText.trim()){
    return true;
  }

  if(!input){
    return false;
  }

  const trimmedSearch = searchText.trim().toLowerCase();
  const inputLower = input.toLowerCase();

  if(inputLower.includes(trimmedSearch)){
    return true;
  }

  if(trimmedSearch.length < 2){
    return false;
  }

  const similarity = calculateSimilarity(input, searchText);

  if(similarity >= threshold){
    return true;
  }

  const searchWords = trimmedSearch.split(/\s+/);
  const inputWords = inputLower.split(/\s+/);

  return searchWords.every(searchWord => {
    if(searchWord.length < 2){
      return true;
    }
    return inputWords.some(inputWord => {

      if (inputWord.startsWith(searchWord)) {
      return true; 
    }

      const wordSimilarity = calculateSimilarity(inputWord, searchWord);
      return wordSimilarity >= threshold;
    });
  });
};