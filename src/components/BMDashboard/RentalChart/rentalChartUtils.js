// Both rental charts open on the current calendar year so new data shows without changing dates
export const getCurrentYearRange = (today = new Date()) => {
  const year = today.getFullYear();
  return {
    startDate: new Date(year, 0, 1),
    endDate: new Date(year, 11, 31),
  };
};

// Some tools are saved as "Project 1 - Tool 2". The bar color already shows the project,
// so drop that prefix to keep every tool in the "Tool 2" style.
export const stripProjectPrefix = (toolName, projectName) => {
  if (!toolName || !projectName) return toolName || '';
  const prefix = `${projectName} - `;
  if (!toolName.toLowerCase().startsWith(prefix.toLowerCase())) return toolName;
  return toolName.slice(prefix.length).trim() || toolName;
};
