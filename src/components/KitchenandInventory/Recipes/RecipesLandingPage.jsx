import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import { mockRecipes } from './mockRecipes';
import styles from './RecipesLandingPage.module.css';

const RecipesLandingPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  useEffect(() => {
    setRecipes(mockRecipes);
    setFilteredRecipes(mockRecipes);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(
        recipe =>
          recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.difficulty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredRecipes(filtered);
    }
  }, [searchTerm, recipes]);

  const handleViewRecipe = recipeId => {
    // eslint-disable-next-line no-console
    console.log('View recipe:', recipeId);
  };

  const handleAddRecipe = () => {
    // eslint-disable-next-line no-console
    console.log('Add new recipe');
  };

  return (
    <div className={styles.recipesContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Recipes</h1>

        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search recipes by name, type, or tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>

          <button className={styles.addButton} onClick={handleAddRecipe}>
            + Add New Recipe
          </button>
        </div>
      </div>

      <div className={styles.resultsCount}>
        Showing {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
      </div>

      <div className={styles.recipesGrid}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} onViewDetails={handleViewRecipe} />
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No recipes found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesLandingPage;
