import { useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getVillageDropdownFilterData } from '~/actions/lbdashboard/villageDetailsAction';
import { FIXED_VILLAGES } from '../Home/data.jsx';
import styles from './DropdownFilter.module.css';

export default function VillageDropdownFilter() {
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

  const location = useLocation();

  const selected = useMemo(() => {
    const match = location.pathname.match(/^\/lbdashboard\/village\/([^/]+)/);
    if (!match) return 'all'; // not on a village page

    const slug = decodeURIComponent(match[1]);
    const idFromQuery = new URLSearchParams(location.search).get('id');

    const current = displayVillages.find(v =>
      idFromQuery ? v.id === idFromQuery : v.name.replace(/\s+/g, '-') === slug,
    );
    return current ? `${current.id}|${current.name}` : 'all';
  }, [location.pathname, location.search, displayVillages]);

  const handleSelect = e => {
    const value = e.target.value;
    if (value === 'all') return;
    const [id, villageName] = value.split('|');
    const slug = villageName.replace(/\s+/g, '-');
    const path =
      id && id !== 'null'
        ? `/lbdashboard/village/${slug}?id=${id}`
        : `/lbdashboard/village/${slug}`;
    const onVillagePage = location.pathname.startsWith('/lbdashboard/village/');
    if (onVillagePage) history.replace(path);
    else history.push(path);
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
