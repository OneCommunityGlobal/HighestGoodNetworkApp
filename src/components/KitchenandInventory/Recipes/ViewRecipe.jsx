import React, { useEffect, useRef } from 'react';
import styles from './ViewRecipe.module.css';

const ViewRecipe = ({ recipe, onClose }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!recipe) return null;

  const getDifficultyClass = difficulty => {
    switch (difficulty) {
      case 'Easy':
        return styles.difficultyEasy;
      case 'Medium':
        return styles.difficultyMedium;
      case 'Hard':
        return styles.difficultyHard;
      default:
        return '';
    }
  };

  const getAvailabilityClass = ingredient => {
    if (ingredient.isOnsite) return styles.onsiteBadge;
    if (ingredient.isAvailable) return styles.availableBadge;
    return styles.unavailableBadge;
  };

  const getAvailabilityLabel = ingredient => {
    if (ingredient.isOnsite) return 'Onsite';
    if (ingredient.isAvailable) return 'Available';
    return 'Not Available';
  };

  const handleSubstitute = ingredientId => {
    // eslint-disable-next-line no-console
    console.log('Substitute ingredient:', ingredientId);
  };

  const handleReorder = ingredientId => {
    // eslint-disable-next-line no-console
    console.log('Reorder ingredient:', ingredientId);
  };

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.overlayBackdrop}
        onClick={onClose}
        aria-label="Close recipe details"
      />
      <div className={styles.panel} ref={panelRef}>
        {/* Close Button */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close recipe details"
        >
          &#10005;
        </button>

        {/* Header */}
        <div className={styles.recipeHeader}>
          <h2 className={styles.recipeName}>{recipe.name}</h2>
          <span className={styles.recipeType}>{recipe.type}</span>
        </div>

        {/* Meta Details */}
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>&#9201;</span>
            <span className={styles.metaLabel}>Prep Time</span>
            <span className={styles.metaValue}>{recipe.prepTime} min</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>&#127869;</span>
            <span className={styles.metaLabel}>Servings</span>
            <span className={styles.metaValue}>{recipe.servings}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaIcon}>&#128202;</span>
            <span className={styles.metaLabel}>Difficulty</span>
            <span className={`${styles.metaValue} ${getDifficultyClass(recipe.difficulty)}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <p className={styles.description}>{recipe.description}</p>
        </div>

        {/* Tags */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Tags</h3>
          <div className={styles.tagsContainer}>
            {recipe.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
            {recipe.hasPriorityIngredients && (
              <span className={styles.priorityTag}>Priority Ingredients</span>
            )}
            <span className={styles.onsiteTag}>{recipe.onsitePercentage}% Onsite</span>
          </div>
        </div>

        {/* Ingredients */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Ingredients</h3>
          <div className={styles.ingredientsList}>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map(ingredient => (
                <div key={ingredient.id} className={styles.ingredientRow}>
                  <div className={styles.ingredientInfo}>
                    <span className={styles.ingredientName}>{ingredient.name}</span>
                    <span className={styles.ingredientQty}>{ingredient.quantity}</span>
                  </div>
                  <div className={styles.ingredientActions}>
                    <span className={getAvailabilityClass(ingredient)}>
                      {getAvailabilityLabel(ingredient)}
                    </span>
                    {!ingredient.isAvailable && !ingredient.isOnsite && (
                      <div className={styles.actionButtons}>
                        <button
                          type="button"
                          className={styles.substituteBtn}
                          onClick={() => handleSubstitute(ingredient.id)}
                        >
                          Substitute
                        </button>
                        <button
                          type="button"
                          className={styles.reorderBtn}
                          onClick={() => handleReorder(ingredient.id)}
                        >
                          Reorder
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>No ingredients listed for this recipe.</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Instructions</h3>
          {recipe.instructions && recipe.instructions.length > 0 ? (
            <ol className={styles.instructionsList}>
              {recipe.instructions.map((step, index) => (
                <li key={index} className={styles.instructionStep}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <p className={styles.stepText}>{step}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.emptyMessage}>No instructions available for this recipe.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRecipe;
