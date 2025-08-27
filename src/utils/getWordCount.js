export default function getWordCount(input) {

const excludedSymbols = new Set(['.', '#', '$', '*', '-', '–', '—', '_']);

const wordCount = input
  .trim()
  .split(/\s+/) // To handle any whitespace
  .filter(word => {
    // Remove empty strings and standalone symbols
    const cleanedWord = word.trim();
    return cleanedWord && !excludedSymbols.has(cleanedWord);
  }).length;

  return wordCount;
}


