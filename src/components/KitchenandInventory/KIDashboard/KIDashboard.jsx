import FoodCategoriesPieChart from './FoodCategoriesPieChart/FoodCategoriesPieChart';
import FoodSourcesPieChart from './FoodSourcesPieChart/FoodSourcesPieChart';

export function KIDashboard() {
  return (
    <div>
      <h1>Welcome to Kitchen and Inventory Dashboard</h1>
      <FoodCategoriesPieChart />
      <FoodSourcesPieChart />
    </div>
  );
}

export default KIDashboard;
