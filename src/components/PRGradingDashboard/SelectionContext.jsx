import { createContext, useContext, useState } from 'react';

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [activeId, setActiveId] = useState(null);
  const [scrollKey, setScrollKey] = useState(0);

  const selectRow = id => {
    setActiveId(id);
    setScrollKey(prev => prev + 1);
  };

  return (
    <SelectionContext.Provider value={{ activeId, selectRow, scrollKey }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useRowSelection = () => useContext(SelectionContext);
