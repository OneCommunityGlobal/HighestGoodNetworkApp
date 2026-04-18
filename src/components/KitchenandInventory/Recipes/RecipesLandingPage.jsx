import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RecipeCard from './RecipeCard';
import ViewRecipe from './ViewRecipe';
import { mockRecipes } from './mockRecipes';
import styles from './RecipesLandingPage.module.css';

const API_URL = `${window.location.protocol}//${window.location.hostname}:4500/api/kitchenandinventory/recipes`;

const RecipesLandingPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_URL, {
          headers: { Authorization: token },
        });
        if (response.data && response.data.length > 0) {
          setRecipes(response.data);
          setFilteredRecipes(response.data);
        } else {
          setRecipes(mockRecipes);
          setFilteredRecipes(mockRecipes);
        }
      } catch (err) {
        // Fallback to mock data if API is unavailable
        setRecipes(mockRecipes);
        setFilteredRecipes(mockRecipes);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
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
    const recipe = recipes.find(r => (r._id || r.id) === recipeId);
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
  };

  const handleRecipeUpdate = updatedRecipe => {
    const recipeId = updatedRecipe._id || updatedRecipe.id;
    setRecipes(prev => prev.map(r => ((r._id || r.id) === recipeId ? updatedRecipe : r)));
    setSelectedRecipe(updatedRecipe);
  };

  const handleAddRecipe = () => {
    // eslint-disable-next-line no-console
    console.log('Add new recipe');
  };

  if (loading) {
    return (
      <div className={styles.recipesContainer}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Recipes</h1>
        </div>
        <div className={styles.resultsCount}>Loading recipes...</div>
      </div>
    );
  }

  return (
    <>
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
              <span className={styles.searchIcon}>&#128269;</span>
            </div>

            <button className={styles.addButton} onClick={handleAddRecipe}>
              + Add New Recipe
            </button>
          </div>
        </div>

        <div className={styles.resultsCount}>
          Showing {filteredRecipes.length} recipe{filteredRecipes.length === 1 ? '' : 's'}
        </div>

        <div className={styles.recipesGrid}>
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id || recipe.id}
                recipe={recipe}
                onViewDetails={handleViewRecipe}
              />
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No recipes found matching &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      </div>

      {selectedRecipe && (
        <ViewRecipe
          recipe={selectedRecipe}
          onClose={handleCloseRecipe}
          onRecipeUpdate={handleRecipeUpdate}
        />
      )}
    </>
  );
};

export default RecipesLandingPage;
