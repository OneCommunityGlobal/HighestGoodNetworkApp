import HoursBarChart from './HoursBarChart'
import barChart from '../barChart';
export default function HoursCompletedBarChart({data}) {
    return (
      <div>
        <h3 style={{ color: 'black' }}>Hours Completed</h3>
        <HoursBarChart data={data}/>
        {/* <barChart /> */}
      </div>
      
    );
}
  