import { createContext, useContext, useRef } from 'react';

const SuggestionModalTriggerContext = createContext(null);

export function SuggestionModalProvider({ children }) {
  const triggerRef = useRef(null);

  return (
    <SuggestionModalTriggerContext.Provider value={triggerRef}>
      {children}
    </SuggestionModalTriggerContext.Provider>
  );
}

export const useSuggestionModalTrigger = () => useContext(SuggestionModalTriggerContext);
