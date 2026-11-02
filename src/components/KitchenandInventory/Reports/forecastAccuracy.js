// Future API source: /api/kitchenandinventory/reports/forecast-accuracy.
// Demo overrides apply only when isDemo is explicitly true.
export const calculateAccuracy = (planned, actual) => {
  if (planned === 0) return actual === 0 ? 100 : 0;
  return Math.max(0, (1 - Math.abs(actual - planned) / planned) * 100);
};

export const prepareForecastReport = report => {
  const ingredients = report.ingredients.map(ingredient => {
    const accuracy =
      report.isDemo && ingredient.demoAccuracyPercent !== undefined
        ? ingredient.demoAccuracyPercent
        : calculateAccuracy(ingredient.plannedLbs, ingredient.actualLbs);
    return { ...ingredient, accuracyPercent: Math.round(accuracy) };
  });
  const average = ingredients.length
    ? report.ingredients.reduce(
        (sum, ingredient) => sum + calculateAccuracy(ingredient.plannedLbs, ingredient.actualLbs),
        0,
      ) / ingredients.length
    : 0;
  return {
    ingredients,
    averageAccuracyPercent:
      report.isDemo && report.demoAverageAccuracyPercent !== undefined
        ? report.demoAverageAccuracyPercent
        : Math.round(average * 10) / 10,
    isDemo: report.isDemo === true,
  };
};

export const forecastReportCSV = ingredients =>
  [
    ['Ingredient', 'Planned (lbs)', 'Actual (lbs)', 'Accuracy (%)'],
    ...ingredients.map(({ name, plannedLbs, actualLbs, accuracyPercent }) => [
      name,
      plannedLbs,
      actualLbs,
      accuracyPercent,
    ]),
  ]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n');
