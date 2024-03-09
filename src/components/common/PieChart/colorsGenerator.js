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

  for (let i = pieChartColors.length; i < numberOfColors; i++) {
    const newUniqColor = generateUniqColor(arrayOfUniqColors);
    arrayOfUniqColors.push(newUniqColor);
  }
  // console.log(arrayOfUniqColors)
  return arrayOfUniqColors;
};
