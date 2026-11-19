import FoodCategoriesPieChart from './FoodCategoriesPieChart/FoodCategoriesPieChart';
import FoodSourcesPieChart from './FoodSourcesPieChart/FoodSourcesPieChart';
import SeasonalTrendsLineChart from './SeasonalTrendsLineChart/SeasonalTrendsLineChart';

export function KIDashboard() {
  return (
    <div>
      <h1>Welcome to Kitchen and Inventory Dashboard</h1>
      <FoodCategoriesPieChart />
      <FoodSourcesPieChart />
      <SeasonalTrendsLineChart />
    </div>
  );
}

export default KIDashboard;
