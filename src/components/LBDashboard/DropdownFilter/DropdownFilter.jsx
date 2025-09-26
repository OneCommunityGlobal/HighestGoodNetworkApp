import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './DropdownFilter.css';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDropdownFilterData } from '~/actions/lbdashboard/villageDetailsAction';

export default function VillageDropdownFilter() {
  const [selected, setSelected] = useState('all');
  const history = useHistory();
  const dispatch = useDispatch();
  const villages = useSelector(state => state.villageDetails.villages || []);

  useEffect(() => {
    dispatch(getVillageDropdownFilterData());
  }, [dispatch]);

  const handleSelect = e => {
    const value = e.target.value;
    setSelected(value);
    if (value !== 'all') {
      const [id, name] = value.split('|');
      const slug = name.replace(/\s+/g, '-');
      history.push(`/lbdashboard/village/${slug}?id=${id}`);
    }
  };

  return (
    <div className="selector-container">
      <select value={selected} onChange={handleSelect}>
        <option value="all">Filter by Village</option>
        {villages.map(v => (
          <option key={v._id} value={`${v._id}|${v.name}`}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
