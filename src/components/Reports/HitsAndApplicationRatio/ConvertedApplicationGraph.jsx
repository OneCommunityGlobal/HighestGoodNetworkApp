import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

function ConvertedApplicationsGraph({ data }) {
  // Sort the data in descending order based on conversion rate (you can adjust this based on your logic)
  const sortedData = data.sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 10);

  return (
    <BarChart width={500} height={300} data={sortedData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="jobTitle" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="conversionRate" fill="#8884d8" />
    </BarChart>
  );
}

export default ConvertedApplicationsGraph;