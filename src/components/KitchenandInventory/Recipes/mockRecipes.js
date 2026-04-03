export const mockRecipes = [
  {
    id: 1,
    name: 'Garden Vegetable Soup',
    type: 'Soup',
    description: 'A hearty soup made with fresh garden vegetables',
    prepTime: 45, // minutes
    servings: 6,
    difficulty: 'Easy',
    tags: ['Vegan', 'Gluten-Free', 'Seasonal'],
    hasPriorityIngredients: true,
    onsitePercentage: 85, // % of ingredients from onsite
    ingredients: [
      { id: 'ing1', name: 'Tomatoes', quantity: '4 cups', isOnsite: true },
      { id: 'ing2', name: 'Carrots', quantity: '2 cups', isOnsite: true },
    ],
  },
  {
    id: 2,
    name: 'Herb Roasted Chicken',
    type: 'Main Course',
    description: 'Chicken seasoned with fresh garden herbs',
    prepTime: 90,
    servings: 4,
    difficulty: 'Medium',
    tags: ['Protein', 'Comfort Food'],
    hasPriorityIngredients: false,
    onsitePercentage: 40,
    ingredients: [],
  },
  {
    id: 3,
    name: 'Berry Smoothie',
    type: 'Beverage',
    description: 'Refreshing smoothie with mixed berries',
    prepTime: 10,
    servings: 2,
    difficulty: 'Easy',
    tags: ['Quick', 'Healthy', 'Breakfast'],
    hasPriorityIngredients: false,
    onsitePercentage: 90,
    ingredients: [],
  },
];
