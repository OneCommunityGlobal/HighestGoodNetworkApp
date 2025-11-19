import * as d3 from 'd3';

export const pieChartColors = [
  'rgb(255, 94, 130)',
  'rgb(179, 104, 210)',
  'rgb(100, 183, 255)',
  'rgb(255, 219, 86)',
  'rgb(94, 255, 219)',
  'rgb(255, 158, 180)',
  'rgb(255, 145, 69)',
  'rgb(0, 146, 178)',
];

const randomInteger = max => {
  return Math.floor(Math.random() * (max + 1));
};

const randomRgbColor = () => {
  const r = randomInteger(255);
  const g = randomInteger(255);
  const b = randomInteger(255);
  return `rgb(${r}, ${g}, ${b})`;
};

const generateUniqColor = arrayOfColors => {
  let newRandomColor = randomRgbColor();

  while (arrayOfColors.indexOf(newRandomColor) >= 0) {
    newRandomColor = generateUniqColor(arrayOfColors);
  }

  return newRandomColor;
};

export const generateArrayOfUniqColors = numberOfColors => {
  if (numberOfColors <= pieChartColors.length) {
    return pieChartColors.slice(0, numberOfColors);
  }

  const arrayOfUniqColors = [...pieChartColors];

  for (let i = pieChartColors.length; i < numberOfColors; i += 1) {
    const newUniqColor = generateUniqColor(arrayOfUniqColors);
    arrayOfUniqColors.push(newUniqColor);
  }
  return arrayOfUniqColors;
};

const colorDistance = (lab1, lab2) => {
  const dl = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dl * dl + da * da + db * db);
};

const generatePastelColor = () => {
  try {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 20) + 70;
    const lightness = Math.floor(Math.random() * 15) + 75;
    return d3.hsl(hue, saturation / 100, lightness / 100).formatHex();
  } catch (error) {
    return null;
  }
};

export const getColorblindSafeColors = count => {
  const baseSchemes = [
    ...d3.schemeCategory10,
    ...d3.schemeTableau10,
    ...d3.schemeDark2,
    ...d3.schemeSet2,
  ];

  const flatColors = baseSchemes.flat();
  const uniqueColors = new Set(flatColors);

  while (uniqueColors.size < count) {
    const color = generatePastelColor();
    uniqueColors.add(color);
  }

  return Array.from(uniqueColors).slice(0, count);
};

export const getVisuallyDistinctColors = (count, minDistance = 28) => {
  const baseColors = [
    ...d3.schemeCategory10,
    ...d3.schemeTableau10,
    ...d3.schemeDark2,
    ...d3.schemeSet2,
  ].flat();

  const chosenColors = [];
  const chosenLabs = [];

  const isDistinctEnough = lab =>
    chosenLabs.every(existingLab => colorDistance(lab, existingLab) >= minDistance);

  const tryToAddColor = hexColor => {
    const lab = d3.lab(hexColor);
    if (!isDistinctEnough(lab)) return false;
    chosenColors.push(hexColor);
    chosenLabs.push(lab);
    return true;
  };

  baseColors.slice(0, count).forEach(hex => {
    if (chosenColors.length < count) tryToAddColor(hex);
  });

  const fillRemainingColors = () => {
    if (chosenColors.length >= count) return;
    const candidate = generatePastelColor();
    tryToAddColor(candidate);
    fillRemainingColors();
  };

  fillRemainingColors();

  return chosenColors;
};
