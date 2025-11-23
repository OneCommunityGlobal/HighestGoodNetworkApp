import { useState } from 'react';
import DisplayBox from './DisplayBox';

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
      <button type="button" onClick={handleOpenModal}>
        Promote ?
      </button>
      {showModal && <DisplayBox onClose={handleCloseModal} />}
    </div>
  );
}
