import { useState } from 'react';
import DisplayBox from './DisplayBox';
import styles from './DisplayBox.module.css';

export default function PromotionsPage() {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <h1>Promotions Page</h1>
      <button type="button" className={styles.promoteButton} onClick={handleOpenModal}>
        Promote ?
      </button>
      {showModal && <DisplayBox onClose={handleCloseModal} />}
    </div>
  );
}
