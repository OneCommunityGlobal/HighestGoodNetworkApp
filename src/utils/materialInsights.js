/**
 * Material Insights Utility
 * Provides calculations and formatting for material usage analytics
 * Single source of truth for all calculation logic
 */

/**
 * Format a number to 1-2 decimal places safely
 * Handles floating point precision issues like 180.60000000000002
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number|null} Formatted number or null if value is not a number
 */
export const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Calculate usage percentage (Used / Bought)
 * @param {number} used - Amount used
 * @param {number} bought - Amount bought
 * @returns {number|null} Usage percentage or null if bought is 0
 */
export const calculateUsagePercentage = (used, bought) => {
  if (!bought || bought <= 0) {
    return null;
  }
  const percentage = (used / bought) * 100;
  return formatNumber(percentage, 2);
};

/**
 * Get clamped usage percentage for UI display
 * Ensures value doesn't exceed 100% for progress bar display
 * @param {number} usagePercentage - The usage percentage to clamp
 * @returns {number} Clamped percentage (0-100)
 */
export const getClampedUsagePercentage = (usagePercentage) => {
  if (usagePercentage === null || usagePercentage === undefined) {
    return 0;
  }
  return Math.min(100, Math.max(0, usagePercentage));
};

/**
 * Calculate stock ratio (Available / Bought)
 * @param {number} available - Amount available
 * @param {number} bought - Amount bought
 * @returns {number|null} Stock ratio or null if bought is 0
 */
export const calculateStockRatio = (available, bought) => {
  if (!bought || bought <= 0) {
    return null;
  }
  const ratio = available / bought;
  return formatNumber(ratio, 2);
};

/**
 * Get stock health status based on stock ratio
 * @param {number} stockRatio - The stock ratio to evaluate
 * @returns {string} Health status: 'healthy', 'low', 'critical', or 'no-data'
 */
export const getStockHealthStatus = (stockRatio) => {
  if (stockRatio === null || stockRatio === undefined) {
    return 'no-data';
  }
  if (stockRatio <= 0.2) {
    return 'critical';
  }
  if (stockRatio <= 0.4) {
    return 'low';
  }
  return 'healthy';
};

/**
 * Get stock health color for UI display
 * @param {string} status - Stock health status
 * @returns {string} Color code: 'green', 'yellow', 'red', or 'gray'
 */
export const getStockHealthColor = (status) => {
  switch (status) {
    case 'healthy':
      return 'green';
    case 'low':
      return 'yellow';
    case 'critical':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Get stock health icon for UI display
 * Returns a simple icon representation
 * @param {string} status - Stock health status
 * @returns {string} Icon symbol or emoji
 */
export const getStockHealthIcon = (status) => {
  switch (status) {
    case 'healthy':
      return '✓'; // Checkmark
    case 'low':
      return '⚠'; // Warning
    case 'critical':
      return '✕'; // X mark
    default:
      return '○'; // Circle for no data
  }
};

/**
 * Get display label for stock health status
 * @param {string} status - Stock health status
 * @returns {string} Display label
 */
export const getStockHealthLabel = (status) => {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'low':
      return 'Low';
    case 'critical':
      return 'Critical';
    default:
      return 'No Data';
  }
};

/**
 * Calculate all material insights for a single material
 * @param {object} material - Material object with stockBought, stockUsed, stockAvailable, etc.
 * @returns {object} Insights object containing all calculated values
 */
export const calculateMaterialInsights = (material) => {
  const bought = material?.stockBought || 0;
  const used = material?.stockUsed || 0;
  const available = material?.stockAvailable || 0;
  const wasted = material?.stockWasted || 0;
  const hold = material?.stockHold || 0;

  const usagePct = calculateUsagePercentage(used, bought);
  const usagePctClamped = getClampedUsagePercentage(usagePct);
  const stockRatio = calculateStockRatio(available, bought);
  const stockHealth = getStockHealthStatus(stockRatio);
  const stockHealthColor = getStockHealthColor(stockHealth);
  const stockHealthLabel = getStockHealthLabel(stockHealth);

  return {
    bought,
    used,
    available,
    wasted,
    hold,
    usagePct,
    usagePctClamped,
    stockRatio,
    stockHealth,
    stockHealthColor,
    stockHealthLabel,
    hasBoughtData: bought > 0,
  };
};

/**
 * Calculate summary metrics from a list of materials
 * @param {array} materials - Array of material objects
 * @returns {object} Summary metrics
 */
export const calculateSummaryMetrics = (materials) => {
  if (!materials || materials.length === 0) {
    return {
      totalMaterials: 0,
      lowStockCount: 0,
      lowStockPercentage: 0,
      overUsageCount: 0,
      overUsagePercentage: 0,
      onHoldCount: 0,
      usageThreshold: 80,
    };
  }

  const total = materials.length;
  let lowStockCount = 0;
  let overUsageCount = 0;
  let onHoldCount = 0;

  materials.forEach(material => {
    const insights = calculateMaterialInsights(material);

    // Count low/critical stock
    if (insights.stockHealth === 'low' || insights.stockHealth === 'critical') {
      lowStockCount += 1;
    }

    // Count over usage threshold (default 80%)
    if (insights.usagePct !== null && insights.usagePct >= 80) {
      overUsageCount += 1;
    }

    // Count items on hold
    if ((material?.stockHold || 0) > 0) {
      onHoldCount += 1;
    }
  });

  const lowStockPercentage = formatNumber((lowStockCount / total) * 100, 1);
  const overUsagePercentage = formatNumber((overUsageCount / total) * 100, 1);

  return {
    totalMaterials: total,
    lowStockCount,
    lowStockPercentage,
    overUsageCount,
    overUsagePercentage,
    onHoldCount,
    usageThreshold: 80,
  };
};

/**
 * Generate tooltip text for stock health
 * @param {object} material - Material object
 * @returns {string} Tooltip text
 */
export const getStockHealthTooltip = (material) => {
  const insights = calculateMaterialInsights(material);

  if (!insights.hasBoughtData) {
    return 'No purchases recorded';
  }

  const ratio = insights.stockRatio !== null ? Math.round(insights.stockRatio * 100) : 'N/A';
  return `Available: ${insights.available} of ${insights.bought} units remaining\nStock ratio: ${ratio}%\nStatus: ${insights.stockHealthLabel}`;
};

/**
 * Generate tooltip text for usage percentage
 * @param {object} material - Material object
 * @returns {string} Tooltip text
 */
export const getUsagePercentageTooltip = (material) => {
  const bought = material?.stockBought || 0;
  const used = material?.stockUsed || 0;

  if (!bought || bought <= 0) {
    return 'No purchases recorded';
  }

  const usagePct = calculateUsagePercentage(used, bought);
  return `Used: ${used} of ${bought} (${usagePct}%)`;
};
