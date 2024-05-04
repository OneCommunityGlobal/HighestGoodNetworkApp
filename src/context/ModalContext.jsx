import { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalStatus, setModalStatus] = useState(false);

  const updateModalStatus = () => {
    setModalStatus(true);
  };

  return (
    <ModalContext.Provider value={{ modalStatus, updateModalStatus }}>
      {children}
    </ModalContext.Provider>
  );
};
