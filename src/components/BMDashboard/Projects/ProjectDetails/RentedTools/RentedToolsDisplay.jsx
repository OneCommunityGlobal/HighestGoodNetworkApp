import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card } from 'reactstrap';
import { fetchTools } from '~/actions/bmdashboard/toolActions';
import { fetchAllEquipments } from '~/actions/bmdashboard/equipmentActions';
import { buildRentalItems, formatDueIn, sortAndFilterItems } from '../alertUtils';
import { AlertControls } from '../AlertControls';
import { AlertCard, useSessionPrefs } from '../AlertCard';
import styles from '../ProjectAlerts.module.css';

const PREFS_KEY = 'bmProjectAlerts:rentals';
const DEFAULT_PREFS = { sortBy: 'urgency', level: 'all' };
const formatDate = date => (date ? new Date(date).toLocaleDateString() : null);

function RentedToolsDisplay({ projectId }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const tools = useSelector(state => state.bmTools?.toolslist);
  const equipments = useSelector(state => state.bmEquipments?.equipmentslist);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useSessionPrefs(PREFS_KEY, DEFAULT_PREFS);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([dispatch(fetchTools()), dispatch(fetchAllEquipments(projectId))]).then(
      () => {
        if (!cancelled) setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [dispatch, projectId]);

  const items = useMemo(() => buildRentalItems({ tools, equipments, projectId }), [
    tools,
    equipments,
    projectId,
  ]);
  const visibleItems = useMemo(() => sortAndFilterItems(items, prefs), [items, prefs]);

  let content;
  if (loading && items.length === 0) {
    content = <p className={styles.emptyState}>Loading rentals…</p>;
  } else if (items.length === 0) {
    content = <p className={styles.emptyState}>No active rentals for this project.</p>;
  } else if (visibleItems.length === 0) {
    content = <p className={styles.emptyState}>No rentals match this filter.</p>;
  } else {
    content = (
      <ul className={styles.cardList} aria-label="Rented tools and equipment">
        {visibleItems.map(item => (
          <AlertCard
            key={item.id}
            item={item}
            title={item.name}
            imageUrl={item.imageUrl}
            detailPath={item.detailPath}
            onOpen={() => history.push(item.detailPath)}
            badgeText={formatDueIn(item.daysLeft)}
            meta={[
              ['Type', item.kind === 'tool' ? 'Tool' : 'Equipment'],
              ['Category', item.category],
              ['Due date', formatDate(item.dueDate)],
              ['Rented on', formatDate(item.rentedOnDate)],
              ['Make / model', item.vendor],
              ['Responsible', item.responsible],
            ]}
          />
        ))}
      </ul>
    );
  }

  return (
    <Card className={`${styles.section} ${darkMode ? styles.sectionDark : ''}`}>
      {items.length > 0 && (
        <AlertControls idPrefix="rentals" prefs={prefs} onChange={setPrefs} items={items} />
      )}
      {content}
    </Card>
  );
}

export default RentedToolsDisplay;
