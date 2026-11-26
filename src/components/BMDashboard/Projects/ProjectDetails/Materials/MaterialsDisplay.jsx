import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from 'reactstrap';
import { fetchAllMaterials, resetMaterialUpdate } from '~/actions/bmdashboard/materialsActions';
import UpdateMaterialModal from '~/components/BMDashboard/UpdateMaterials/UpdateMaterialModal';
import RecordsModal from '~/components/BMDashboard/ItemList/RecordsModal';
import { buildLowStockItems, sortAndFilterItems } from '../alertUtils';
import { AlertControls } from '../AlertControls';
import { AlertCard, useSessionPrefs } from '../AlertCard';
import RestockRequestModal from './RestockRequestModal';
import styles from '../ProjectAlerts.module.css';

const PREFS_KEY = 'bmProjectAlerts:materials';
const DEFAULT_PREFS = { sortBy: 'urgency', level: 'all' };

function MaterialsDisplay({ projectId }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const materials = useSelector(state => state.materials?.materialslist);
  const updateResult = useSelector(state => state.materials?.updateMaterials);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useSessionPrefs(PREFS_KEY, DEFAULT_PREFS);

  // Which quick action is open, and for which item.
  const [restockItem, setRestockItem] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateRecord, setUpdateRecord] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRecord, setHistoryRecord] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // allSettled never rejects, so a failed request still ends the loading state.
    Promise.allSettled([dispatch(fetchAllMaterials())]).then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // After "Update quantity" succeeds (UpdateMaterial shows the toast), refresh
  // the list and clear the result, the same way Materials > View does.
  useEffect(() => {
    if (updateResult?.result != null && !updateResult.loading && !updateResult.error) {
      dispatch(fetchAllMaterials());
      dispatch(resetMaterialUpdate());
    }
  }, [updateResult, dispatch]);

  const items = useMemo(() => buildLowStockItems({ materials, projectId }), [materials, projectId]);
  const visibleItems = useMemo(() => sortAndFilterItems(items, prefs), [items, prefs]);

  const openHistory = item => {
    setHistoryRecord(item.raw);
    setHistoryOpen(true);
  };

  const openUpdate = item => {
    // Clear any earlier update result so the modal doesn't close on open.
    dispatch(resetMaterialUpdate());
    setUpdateRecord(item.raw);
    setUpdateOpen(true);
  };

  let content;
  if (loading && items.length === 0) {
    content = <p className={styles.emptyState}>Loading materials…</p>;
  } else if (items.length === 0) {
    content = <p className={styles.emptyState}>No materials are below 20% for this project.</p>;
  } else if (visibleItems.length === 0) {
    content = <p className={styles.emptyState}>No materials match this filter.</p>;
  } else {
    content = (
      <ul className={styles.cardList} aria-label="Materials with less than 20% left">
        {visibleItems.map(item => (
          <AlertCard
            key={item.id}
            item={item}
            title={item.name}
            onOpen={() => openHistory(item)}
            badgeText={`${item.percentLeft.toFixed(1)}% left`}
            meta={[
              ['Available', `${item.available} of ${item.bought} ${item.unit}`.trim()],
              ['Brand', item.vendor],
            ]}
            actions={
              <>
                <Button size="sm" color="primary" onClick={() => setRestockItem(item)}>
                  Create restock request
                </Button>
                <Button size="sm" color="secondary" outline onClick={() => openUpdate(item)}>
                  Update quantity
                </Button>
                <Button size="sm" color="secondary" outline onClick={() => openHistory(item)}>
                  View history
                </Button>
              </>
            }
          />
        ))}
      </ul>
    );
  }

  return (
    <Card className={`${styles.section} ${darkMode ? styles.sectionDark : ''}`}>
      {items.length > 0 && (
        <AlertControls idPrefix="materials" prefs={prefs} onChange={setPrefs} items={items} />
      )}
      {content}

      <RestockRequestModal
        isOpen={Boolean(restockItem)}
        toggle={() => setRestockItem(null)}
        projectId={projectId}
        item={restockItem}
        onSubmitted={() => dispatch(fetchAllMaterials())}
      />
      <UpdateMaterialModal modal={updateOpen} setModal={setUpdateOpen} record={updateRecord} />
      <RecordsModal
        modal={historyOpen}
        setModal={setHistoryOpen}
        record={historyRecord}
        setRecord={setHistoryRecord}
        recordType="Update"
        itemType="Materials"
      />
    </Card>
  );
}

export default MaterialsDisplay;
