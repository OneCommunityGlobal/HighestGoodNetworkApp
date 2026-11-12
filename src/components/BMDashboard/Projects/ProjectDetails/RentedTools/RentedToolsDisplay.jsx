import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from 'reactstrap';
import { toast } from 'react-toastify';
import { fetchTools } from '~/actions/bmdashboard/toolActions';
import { fetchAllEquipments } from '~/actions/bmdashboard/equipmentActions';
import {
  extendRental,
  markRentalReturned,
  sendRentalReminder,
} from '~/actions/bmdashboard/rentalActions';
import { buildRentalItems, formatDueIn, sortAndFilterItems } from '../alertUtils';
import { AlertControls } from '../AlertControls';
import { AlertCard, useSessionPrefs } from '../AlertCard';
import { ConfirmReturnModal, ExtendRentalModal } from './RentalActionModals';
import styles from '../ProjectAlerts.module.css';

const PREFS_KEY = 'bmProjectAlerts:rentals';
const DEFAULT_PREFS = { sortBy: 'urgency', level: 'all' };
const formatDate = date => (date ? new Date(date).toLocaleDateString() : null);
const errorMessage = (result, fallback) =>
  typeof result?.data?.message === 'string' ? result.data.message : fallback;

function RentedToolsDisplay({ projectId }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const tools = useSelector(state => state.bmTools?.toolslist);
  const equipments = useSelector(state => state.bmEquipments?.equipmentslist);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useSessionPrefs(PREFS_KEY, DEFAULT_PREFS);
  // Which modal is open ('return' | 'extend'), for which item, and which
  // item has a request in flight.
  const [dialog, setDialog] = useState({ type: null, item: null });
  const [busyId, setBusyId] = useState(null);

  const refresh = useCallback(
    () => Promise.allSettled([dispatch(fetchTools()), dispatch(fetchAllEquipments(projectId))]),
    [dispatch, projectId],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const closeDialog = () => setDialog({ type: null, item: null });

  const handleReturn = async () => {
    const { item } = dialog;
    setBusyId(item.id);
    const result = await markRentalReturned(item.id);
    setBusyId(null);
    if (result.ok) {
      toast.success(
        `${item.name} marked as returned${result.data?.returnedLate ? ' (returned late)' : ''}`,
      );
      closeDialog();
      refresh();
    } else {
      toast.error(errorMessage(result, `Could not mark ${item.name} as returned.`));
    }
  };

  const handleExtend = async (rentalDueDate, setFieldError) => {
    const { item } = dialog;
    setBusyId(item.id);
    const result = await extendRental(item.id, rentalDueDate);
    setBusyId(null);
    if (result.ok) {
      toast.success(
        `${item.name} rental extended to ${new Date(rentalDueDate).toLocaleDateString()}`,
      );
      closeDialog();
      refresh();
    } else {
      setFieldError(errorMessage(result, 'Could not extend the rental.'));
    }
  };

  const handleReminder = async item => {
    setBusyId(item.id);
    const result = await sendRentalReminder(item.id);
    setBusyId(null);
    if (result.ok) {
      const { sentTo, emailSent } = result.data || {};
      if (emailSent) {
        toast.success(`Return reminder emailed to ${sentTo}`);
      } else {
        toast.info(
          `Reminder for ${sentTo} was recorded, but email sending is turned off in this environment.`,
        );
      }
    } else if (result.status === 429) {
      toast.info(errorMessage(result, 'A reminder was already sent recently.'));
    } else {
      toast.error(errorMessage(result, `Could not send a reminder for ${item.name}.`));
    }
  };

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
            badgeText={formatDueIn(item.daysLeft)}
            meta={[
              ['Type', item.kind === 'tool' ? 'Tool' : 'Equipment'],
              ['Category', item.category],
              ['Due date', formatDate(item.dueDate)],
              ['Rented on', formatDate(item.rentedOnDate)],
              ['Make / model', item.vendor],
              ['Responsible', item.responsible],
            ]}
            actions={
              <>
                <Button
                  size="sm"
                  color="primary"
                  disabled={busyId === item.id}
                  onClick={() => setDialog({ type: 'return', item })}
                >
                  Mark returned
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  outline
                  disabled={busyId === item.id}
                  onClick={() => setDialog({ type: 'extend', item })}
                >
                  Extend rental
                </Button>
                <Button
                  size="sm"
                  color="secondary"
                  outline
                  disabled={busyId === item.id}
                  onClick={() => handleReminder(item)}
                >
                  Send reminder
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
        <AlertControls idPrefix="rentals" prefs={prefs} onChange={setPrefs} items={items} />
      )}
      {content}

      <ConfirmReturnModal
        item={dialog.item}
        isOpen={dialog.type === 'return'}
        toggle={closeDialog}
        onConfirm={handleReturn}
        busy={Boolean(busyId)}
      />
      <ExtendRentalModal
        item={dialog.item}
        isOpen={dialog.type === 'extend'}
        toggle={closeDialog}
        onSubmit={handleExtend}
        busy={Boolean(busyId)}
      />
    </Card>
  );
}

export default RentedToolsDisplay;
