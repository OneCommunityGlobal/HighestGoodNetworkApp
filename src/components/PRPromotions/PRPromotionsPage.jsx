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
    <div className={styles.container}>
      <h1 className={styles.title}>Promotions Page</h1>
      <button type="button" className={styles.button} onClick={handleOpenModal}>
        Promote ?
      </button>
      {showModal && <DisplayBox onClose={handleCloseModal} />}
    </div>
  );
}
