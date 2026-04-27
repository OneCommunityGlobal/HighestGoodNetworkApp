import { useState } from 'react';
import { useSelector } from 'react-redux';
import DisplayBox from './DisplayBox';
import styles from './PromotionsPage.module.css';

export default function PromotionsPage() {
  const darkMode = useSelector(state => state.theme?.darkMode ?? false);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={darkMode ? styles.pageDark : styles.page}>
      <h1 className={darkMode ? styles.headingDark : styles.heading}>Promotions Page</h1>

      <button type="button" className={styles.promoteButton} onClick={handleOpenModal}>
        Promote ?
      </button>

      {showModal && <DisplayBox onClose={handleCloseModal} darkMode={darkMode} />}
    </div>
  );
}
