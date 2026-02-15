import { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';
import { useSelector } from 'react-redux';
export default function CustomDropdown({ options, selected, onSelect }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.dropdownWrapper}`} ref={dropdownRef}>
        <button
          type="button"
          className={`${styles.dropdownButton}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selected.name}</span>
          <span className={`${isOpen ? styles.arrowOpen : styles.arrow}`}>▼</span>
        </button>

        {isOpen && (
          <div className={`${styles.dropdownMenu}`}>
            {options.map(option => (
              <button
                type="button"
                key={option.id}
                className={`${styles.dropdownItem}`}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
