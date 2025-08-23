import React, { useState, useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { Select, DatePicker, Spin } from 'antd';

import axios from 'axios';
import { fetchInjuriesOverTime } from 'actions/bmdashboard/injuryActions';

function InjuriesOverTimeChart(props) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [selProjects, setSelProjects] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selInjTypes, setSelInjTypes] = useState([]);
  const [selDepts, setSelDepts] = useState([]);
  const [selSeverties, setSelSeverities] = useState([]);

  useEffect(() => {
    dispatch(
      fetchInjuriesOverTime({
        projectId: selProjects,
        date: dateRange,
        injuryType: selInjTypes,
        department: selDepts,
        severity: selSeverties,
      }),
    );
  }, []);

  return (
    <>
      <>InjuriesOverTimeChart</>
    </>
  );
}

export default InjuriesOverTimeChart;
