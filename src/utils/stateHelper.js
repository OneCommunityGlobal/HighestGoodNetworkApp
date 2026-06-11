export const setField = (setState, field, value) => {
  setState(prev => ({ ...prev, [field]: value }));
};

export const toggleField = (setState, field) => {
  setState(prev => ({ ...prev, [field]: !prev[field] }));
};

export const removeItemFromField = (setState, field, value) => {
  setState(prev => ({
    ...prev,
    [field]: prev[field].filter(item => item !== value),
  }));
};

export const setChildField = (setState, parentField, childField, value) => {
  setState(prev => ({
    ...prev,
    [parentField]: {
      ...prev[parentField],
      [childField]: value,
    },
  }));
};