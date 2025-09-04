import React from 'react';
import { Line } from '@ant-design/charts';
import { Card, Typography } from 'antd';
import styles from './DemandOverTime.module.css';

const { Title } = Typography;

const metricLabels = {
  pageVisits: 'Page Visits',
  numberOfBids: 'Number of Bids',
  averageRating: 'Average Rating',
  averageBid: 'Average Bid',
  finalPrice: 'Final Price/Income',
  occupancyRate: 'Occupancy Rate (%)',
  averageDuration: 'Average Duration of Stay (days)',
};

const PropertyDemandChart = ({ data, metric, dateRange }) => {
  // Process data for the chart
  const processedData = [];

  data.forEach(property => {
    property.data.forEach(point => {
      processedData.push({
        date: point.date,
        value: point.value,
        property: property.name,
      });
    });
  });

  const config = {
    data: processedData,
    xField: 'date',
    yField: 'value',
    seriesField: 'property',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    label: {
      style: {
        fill: '#aaa',
      },
      formatter: datum => {
        return datum.value;
      },
    },
    legend: {
      position: 'top',
    },
    xAxis: {
      title: {
        text: 'Date',
      },
    },
    yAxis: {
      title: {
        text: metricLabels[metric] || metric,
      },
    },
  };

  return (
    <Card className={styles.chartCard}>
      <Title level={3}>Comparing Demand of Properties across time</Title>
      <div className={styles.chart}>
        <Line {...config} />
      </div>
    </Card>
  );
};

export default PropertyDemandChart;
