import React from 'react';
import PropTypes from 'prop-types';
import styles from './RecipeCard.module.css';

const RecipeCard = ({ recipe, onViewDetails }) => {
  const getDifficultyColor = difficulty => {
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

  return (
    <div className={styles.recipeCard}>
      {/* Recipe Name */}
      <h3 className={styles.recipeName}>{recipe.name}</h3>

      {/* Type/Category */}
      <div className={styles.recipeType}>{recipe.type}</div>

      {/* Description */}
      <p className={styles.recipeDescription}>{recipe.description}</p>

      {/* Recipe Details */}
      <div className={styles.recipeDetails}>
        <span>⏱️ {recipe.prepTime} min</span>
        <span>🍽️ {recipe.servings} servings</span>
        <span className={getDifficultyColor(recipe.difficulty)}>{recipe.difficulty}</span>
      </div>

      {/* User Tags */}
      <div className={styles.tagsContainer}>
        {recipe.tags.map((tag, index) => (
          <span key={index} className={styles.userTag}>
            {tag}
          </span>
        ))}
      </div>

      {/* Special Tags */}
      <div className={styles.specialTags}>
        {recipe.hasPriorityIngredients && (
          <span className={styles.priorityTag}>⭐ Priority Ingredients</span>
        )}
        <span className={styles.onsiteTag}>🌱 {recipe.onsitePercentage}% Onsite</span>
      </div>

      {/* View Button */}
      <button className={styles.viewButton} onClick={() => onViewDetails(recipe.id)}>
        View Recipe
      </button>
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    prepTime: PropTypes.number.isRequired,
    servings: PropTypes.number.isRequired,
    difficulty: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    hasPriorityIngredients: PropTypes.bool,
    onsitePercentage: PropTypes.number,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
};

export default RecipeCard;
