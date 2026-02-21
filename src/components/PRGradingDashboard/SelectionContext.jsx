import { createContext, useContext, useState } from 'react';

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
  const [activeId, setActiveId] = useState(null);

  const selectRow = id => setActiveId(id);

  return (
    <SelectionContext.Provider value={{ activeId, selectRow }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useRowSelection = () => useContext(SelectionContext);
