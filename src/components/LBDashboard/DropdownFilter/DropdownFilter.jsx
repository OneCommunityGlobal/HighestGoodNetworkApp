import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDropdownFilterData } from '~/actions/lbdashboard/villageDetailsAction';
import { FIXED_VILLAGES } from '../Home/data.jsx';
import styles from './DropdownFilter.module.css';

export default function VillageDropdownFilter() {
  const [selected, setSelected] = useState('all');
  const history = useHistory();
  const dispatch = useDispatch();
  const villages = useSelector(state => state.villageDetails.villages || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    dispatch(getVillageDropdownFilterData());
  }, [dispatch]);

  const displayVillages =
    villages.length > 0
      ? villages.map(v => ({ id: v._id, name: v.name }))
      : FIXED_VILLAGES.map(v => ({ id: null, name: v }));

  const handleSelect = e => {
    const value = e.target.value;
    setSelected(value);
    if (value !== 'all') {
      const [id, villageName] = value.split('|');
      const slug = villageName.replace(/\s+/g, '-');
      const path =
        id && id !== 'null'
          ? `/lbdashboard/village/${slug}?id=${id}`
          : `/lbdashboard/village/${slug}`;
      history.push(path);
    }
  };

  return (
    <div className={`${styles.selectorContainer} ${darkMode ? styles.dark : ''}`}>
      <select
        className={`${styles.select} ${darkMode ? styles.selectDark : ''}`}
        value={selected}
        onChange={handleSelect}
        aria-label="Filter by village"
      >
        <option value="all">Filter by Village</option>
        {displayVillages.map(v => (
          <option key={v.name} value={`${v.id}|${v.name}`}>
            {v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
