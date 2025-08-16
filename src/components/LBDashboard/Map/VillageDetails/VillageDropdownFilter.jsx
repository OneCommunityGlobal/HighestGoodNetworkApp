/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './VillageDropdownFilter.css';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDropdownFilterData } from '~/actions/villageDetailsAction';

export default function VillageDropdownFilter() {
  const [selected, setSelected] = useState('all');
  const history = useHistory();
  const dispatch = useDispatch();
  const villages = useSelector(state => state.villageMap.villages || []);

  useEffect(() => {
    dispatch(getVillageDropdownFilterData());
  }, [dispatch]);

  const handleSelect = e => {
    const value = e.target.value;
    setSelected(value);
    if (value !== 'all') {
      // history.push(`/lbdashboard/${encodeURIComponent(value)}`);
      history.push(`/lbdashboard/village/${value}`);
    }
  };

  return (
    <div className="selector-container">
      <h1>Select a Village</h1>
      <select value={selected} onChange={handleSelect}>
        <option value="all">All</option>
        {villages.map(v => (
          <option key={v._id} value={v._id}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
