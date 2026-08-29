// Mock data for projects and materials
export const mockProjects = [
  { id: 1, name: 'Office Building' },
  { id: 2, name: 'Residential Complex' },
  { id: 3, name: 'Shopping Mall' },
  { id: 4, name: 'Highway Bridge' },
  { id: 5, name: 'Industrial Warehouse' },
  { id: 6, name: 'School Building' },
  { id: 7, name: 'Hospital Complex' },
  { id: 8, name: 'Sports Stadium' },
];

// Mock data for material types
export const materialTypes = [
  { id: 1, name: 'All Materials' },
  { id: 2, name: 'Wood' },
  { id: 3, name: 'Concrete' },
  { id: 4, name: 'Steel' },
  { id: 5, name: 'Aluminum' },
  { id: 6, name: 'Glass' },
  { id: 7, name: 'Brick' },
  { id: 8, name: 'Plastic' },
];

// Mock data for material usage
export const mockMaterialData = {
  1: {
    // Office Building
    all: {
      available: 50,
      used: 30,
      wasted: 20,
      lastWeekUsed: 25,
    },
    wood: {
      available: 20,
      used: 15,
      wasted: 5,
      lastWeekUsed: 12,
    },
    concrete: {
      available: 15,
      used: 10,
      wasted: 5,
      lastWeekUsed: 8,
    },
    steel: {
      available: 15,
      used: 5,
      wasted: 10,
      lastWeekUsed: 5,
    },
    aluminum: {
      available: 10,
      used: 7,
      wasted: 3,
      lastWeekUsed: 5,
    },
    glass: {
      available: 25,
      used: 20,
      wasted: 5,
      lastWeekUsed: 15,
    },
    brick: {
      available: 5,
      used: 3,
      wasted: 2,
      lastWeekUsed: 2,
    },
    plastic: {
      available: 12,
      used: 8,
      wasted: 4,
      lastWeekUsed: 6,
    },
  },
  2: {
    // Residential Complex
    all: {
      available: 60,
      used: 40,
      wasted: 10,
      lastWeekUsed: 30,
    },
    wood: {
      available: 25,
      used: 20,
      wasted: 5,
      lastWeekUsed: 15,
    },
    concrete: {
      available: 20,
      used: 15,
      wasted: 2,
      lastWeekUsed: 10,
    },
    steel: {
      available: 15,
      used: 5,
      wasted: 3,
      lastWeekUsed: 5,
    },
    aluminum: {
      available: 8,
      used: 5,
      wasted: 2,
      lastWeekUsed: 4,
    },
    glass: {
      available: 18,
      used: 15,
      wasted: 3,
      lastWeekUsed: 12,
    },
    brick: {
      available: 30,
      used: 25,
      wasted: 5,
      lastWeekUsed: 20,
    },
    plastic: {
      available: 10,
      used: 7,
      wasted: 3,
      lastWeekUsed: 5,
    },
  },
  3: {
    // Shopping Mall
    all: {
      available: 70,
      used: 45,
      wasted: 15,
      lastWeekUsed: 35,
    },
    wood: {
      available: 15,
      used: 10,
      wasted: 5,
      lastWeekUsed: 8,
    },
    concrete: {
      available: 30,
      used: 25,
      wasted: 5,
      lastWeekUsed: 20,
    },
    steel: {
      available: 25,
      used: 10,
      wasted: 5,
      lastWeekUsed: 10,
    },
    aluminum: {
      available: 20,
      used: 15,
      wasted: 5,
      lastWeekUsed: 10,
    },
    glass: {
      available: 35,
      used: 30,
      wasted: 5,
      lastWeekUsed: 25,
    },
    brick: {
      available: 10,
      used: 8,
      wasted: 2,
      lastWeekUsed: 6,
    },
    plastic: {
      available: 15,
      used: 12,
      wasted: 3,
      lastWeekUsed: 10,
    },
  },
  4: {
    // Highway Bridge
    all: {
      available: 80,
      used: 60,
      wasted: 10,
      lastWeekUsed: 50,
    },
    wood: {
      available: 10,
      used: 5,
      wasted: 2,
      lastWeekUsed: 4,
    },
    concrete: {
      available: 40,
      used: 35,
      wasted: 5,
      lastWeekUsed: 30,
    },
    steel: {
      available: 30,
      used: 20,
      wasted: 3,
      lastWeekUsed: 20,
    },
    aluminum: {
      available: 15,
      used: 10,
      wasted: 2,
      lastWeekUsed: 8,
    },
    glass: {
      available: 5,
      used: 3,
      wasted: 1,
      lastWeekUsed: 2,
    },
    brick: {
      available: 8,
      used: 5,
      wasted: 2,
      lastWeekUsed: 4,
    },
    plastic: {
      available: 12,
      used: 8,
      wasted: 2,
      lastWeekUsed: 6,
    },
  },
  5: {
    // Industrial Warehouse
    all: {
      available: 90,
      used: 70,
      wasted: 15,
      lastWeekUsed: 60,
    },
    wood: {
      available: 15,
      used: 10,
      wasted: 3,
      lastWeekUsed: 8,
    },
    concrete: {
      available: 45,
      used: 40,
      wasted: 5,
      lastWeekUsed: 35,
    },
    steel: {
      available: 40,
      used: 35,
      wasted: 5,
      lastWeekUsed: 35,
    },
    aluminum: {
      available: 25,
      used: 20,
      wasted: 3,
      lastWeekUsed: 15,
    },
    glass: {
      available: 10,
      used: 8,
      wasted: 2,
      lastWeekUsed: 6,
    },
    brick: {
      available: 20,
      used: 15,
      wasted: 3,
      lastWeekUsed: 12,
    },
    plastic: {
      available: 15,
      used: 12,
      wasted: 2,
      lastWeekUsed: 10,
    },
  },
  6: {
    // School Building
    all: {
      available: 65,
      used: 50,
      wasted: 10,
      lastWeekUsed: 45,
    },
    wood: {
      available: 20,
      used: 15,
      wasted: 3,
      lastWeekUsed: 12,
    },
    concrete: {
      available: 30,
      used: 25,
      wasted: 4,
      lastWeekUsed: 20,
    },
    steel: {
      available: 15,
      used: 12,
      wasted: 2,
      lastWeekUsed: 12,
    },
    aluminum: {
      available: 10,
      used: 8,
      wasted: 1,
      lastWeekUsed: 7,
    },
    glass: {
      available: 25,
      used: 20,
      wasted: 3,
      lastWeekUsed: 18,
    },
    brick: {
      available: 30,
      used: 25,
      wasted: 4,
      lastWeekUsed: 22,
    },
    plastic: {
      available: 15,
      used: 12,
      wasted: 2,
      lastWeekUsed: 10,
    },
  },
  7: {
    // Hospital Complex
    all: {
      available: 85,
      used: 70,
      wasted: 12,
      lastWeekUsed: 65,
    },
    wood: {
      available: 15,
      used: 12,
      wasted: 2,
      lastWeekUsed: 10,
    },
    concrete: {
      available: 40,
      used: 35,
      wasted: 4,
      lastWeekUsed: 32,
    },
    steel: {
      available: 30,
      used: 25,
      wasted: 3,
      lastWeekUsed: 25,
    },
    aluminum: {
      available: 20,
      used: 18,
      wasted: 2,
      lastWeekUsed: 15,
    },
    glass: {
      available: 30,
      used: 25,
      wasted: 3,
      lastWeekUsed: 22,
    },
    brick: {
      available: 25,
      used: 20,
      wasted: 3,
      lastWeekUsed: 18,
    },
    plastic: {
      available: 25,
      used: 22,
      wasted: 2,
      lastWeekUsed: 20,
    },
  },
  8: {
    // Sports Stadium
    all: {
      available: 100,
      used: 85,
      wasted: 15,
      lastWeekUsed: 80,
    },
    wood: {
      available: 10,
      used: 8,
      wasted: 1,
      lastWeekUsed: 7,
    },
    concrete: {
      available: 50,
      used: 45,
      wasted: 5,
      lastWeekUsed: 42,
    },
    steel: {
      available: 45,
      used: 40,
      wasted: 4,
      lastWeekUsed: 40,
    },
    aluminum: {
      available: 30,
      used: 25,
      wasted: 3,
      lastWeekUsed: 22,
    },
    glass: {
      available: 20,
      used: 18,
      wasted: 2,
      lastWeekUsed: 15,
    },
    brick: {
      available: 15,
      used: 12,
      wasted: 2,
      lastWeekUsed: 10,
    },
    plastic: {
      available: 20,
      used: 18,
      wasted: 2,
      lastWeekUsed: 15,
    },
  },
};

// Chart colors - more distinct and vibrant
export const chartColors = {
  available: '#4BC0C0', // Teal
  used: '#FF6384', // Pink
  wasted: '#FFCE56', // Yellow
};
