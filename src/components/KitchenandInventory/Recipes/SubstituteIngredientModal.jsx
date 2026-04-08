import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './SubstituteIngredientModal.module.css';

// Mock inventory data - replace with API call when backend is ready
const mockInventoryItems = [
  { id: 'inv1', name: 'White Pepper', category: 'Spices', quantityAvailable: '500g' },
  { id: 'inv2', name: 'Cayenne Pepper', category: 'Spices', quantityAvailable: '200g' },
  { id: 'inv3', name: 'Paprika', category: 'Spices', quantityAvailable: '350g' },
  { id: 'inv4', name: 'Crushed Crackers', category: 'Dry Goods', quantityAvailable: '1kg' },
  { id: 'inv5', name: 'Panko Flakes', category: 'Dry Goods', quantityAvailable: '750g' },
  { id: 'inv6', name: 'Cheddar Cheese', category: 'Dairy', quantityAvailable: '2kg' },
  { id: 'inv7', name: 'Mozzarella Cheese', category: 'Dairy', quantityAvailable: '1.5kg' },
  { id: 'inv8', name: 'Oats', category: 'Dry Goods', quantityAvailable: '3kg' },
  { id: 'inv9', name: 'Chia Seeds', category: 'Dry Goods', quantityAvailable: '400g' },
  { id: 'inv10', name: 'Coconut Flakes', category: 'Dry Goods', quantityAvailable: '600g' },
];

const SubstituteIngredientModal = ({ ingredient, recipeId, onConfirm, onClose }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = mockInventoryItems.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedInventoryItem = mockInventoryItems.find(item => item.id === selectedItem);

  const handleConfirm = async () => {
    if (!selectedItem || !quantity) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      // PUT api/kitchenandinventory/recipes/:recipe_id
      // Body: { ingredientId: ingredient.id, substituteId: selectedItem, quantity }
      await onConfirm({
        ingredientId: ingredient.id,
        substituteId: selectedItem,
        substituteName: selectedInventoryItem.name,
        quantity,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectItem = itemId => {
    setSelectedItem(itemId);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={styles.modalOverlay}>
      <button
        type="button"
        className={styles.modalBackdrop}
        onClick={onClose}
        aria-label="Close substitute modal"
      />
      <div className={styles.modal} ref={modalRef}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close substitute modal"
        >
          &#10005;
        </button>

        <h3 className={styles.modalTitle}>Substitute Ingredient</h3>

        <div className={styles.currentIngredient}>
          <span className={styles.currentLabel}>Replacing</span>
          <div className={styles.currentInfo}>
            <span className={styles.currentName}>{ingredient.name}</span>
            <span className={styles.currentQty}>{ingredient.quantity}</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="substitute-dropdown">
            Select Substitute
          </label>
          <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <button
              type="button"
              id="substitute-dropdown"
              className={styles.dropdownTrigger}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedInventoryItem ? (
                <span className={styles.selectedText}>
                  {selectedInventoryItem.name}
                  <span className={styles.selectedMeta}>
                    {selectedInventoryItem.category} &middot;{' '}
                    {selectedInventoryItem.quantityAvailable} available
                  </span>
                </span>
              ) : (
                <span className={styles.placeholder}>Choose an ingredient...</span>
              )}
              <span className={styles.chevron}>{isDropdownOpen ? '\u25B2' : '\u25BC'}</span>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search ingredients..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
                <div className={styles.dropdownList}>
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        className={`${styles.dropdownItem} ${
                          selectedItem === item.id ? styles.dropdownItemSelected : ''
                        }`}
                        onClick={() => handleSelectItem(item.id)}
                      >
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMeta}>
                          {item.category} &middot; {item.quantityAvailable} available
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className={styles.noResults}>No matching ingredients found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="substitute-quantity">
            Quantity Required
          </label>
          <input
            type="text"
            id="substitute-quantity"
            className={styles.quantityInput}
            placeholder="e.g. 2 cups, 500g, 1 tablespoon"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedItem || !quantity || isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Confirm Substitute'}
          </button>
        </div>
      </div>
    </div>
  );
};

SubstituteIngredientModal.propTypes = {
  ingredient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    quantity: PropTypes.string.isRequired,
  }).isRequired,
  recipeId: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SubstituteIngredientModal;
