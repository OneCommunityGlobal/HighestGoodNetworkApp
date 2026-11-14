const hasText = value => typeof value === 'string' && value.trim().length > 0;

export const getMaterialDataIssues = material => {
  const issues = [];
  if (!hasText(material.itemType?.name)) issues.push('Missing name');
  if (!hasText(material.itemType?.unit)) issues.push('Missing unit');
  if (!hasText(material.project?.name)) issues.push('Missing project');
  const keys = ['stockBought', 'stockUsed', 'stockWasted', 'stockAvailable'];
  if (keys.some(key => !Number.isFinite(material[key]))) {
    issues.push('Missing or invalid stock quantity');
    return issues;
  }
  const { stockBought, stockUsed, stockWasted, stockAvailable } = material;
  if (keys.some(key => material[key] < 0)) issues.push('Negative stock quantity');
  // Ignore floating point noise, while checking the four-decimal storage precision.
  if (stockUsed + stockWasted - stockBought > 0.0001) {
    issues.push('Used + Wasted exceeds Bought');
  }
  if (Math.abs(stockBought - stockUsed - stockWasted - stockAvailable) > 0.0001) {
    issues.push('Available does not match Bought - Used - Wasted');
  }
  if (Object.prototype.hasOwnProperty.call(material, 'storedStockAvailable')) {
    if (!Number.isFinite(material.storedStockAvailable)) {
      issues.push('Missing or invalid stored Available');
    } else if (Math.abs(stockAvailable - material.storedStockAvailable) > 0.0001) {
      issues.push('Stored Available does not match the calculated balance');
    }
  }
  return issues;
};

export const formatMaterialAvailable = value =>
  Number.isFinite(value) ? (Object.is(Number(value.toFixed(2)), -0) ? '0.00' : value.toFixed(2)) : 'Missing';
