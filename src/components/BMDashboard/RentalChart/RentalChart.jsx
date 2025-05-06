import { useRef, useEffect } from 'react'
import Chart from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

export default function RentalChart() {
    const chartRef = useRef(null);
    
    // fake data (will delete after creating backend)
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Dataset 1',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: 'blue',
                tension: 0.4,
                fill: false,
            },
            {
                label: 'Dataset 2',
                data: [28, 48, 40, 81, 19, 27],borderColor: 'red',
                tension: 0.4,
                fill: false,
            },
            
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend:{
                position: 'top',
            },
            title: {
                display: true,
                text: 'Line Chart Example',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    const LineChart = () => {
        return <Line data={data} options={options}/>
    }
    return ( 
        <div>
            Testing the page!
            <LineChart/>
        </div>
    );
} 