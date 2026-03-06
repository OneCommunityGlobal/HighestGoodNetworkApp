import React, { useEffect, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItemUpdateHistory } from '~/actions/bmdashboard/invTypeActions';
import styles from './ItemListView.module.css';
import PropTypes from 'prop-types';

export default function ViewUpdateHistoryModal({ item, isOpen, toggle }) {
  const dispatch = useDispatch();

  const historyData = useSelector(state => state.bmInvTypes?.historyList || []);

  const itemTypeObj = item?.itemType ?? null;
  const hasInvalidItem = !itemTypeObj;

  // Fetch history when modal opens
  useEffect(() => {
    if (isOpen && itemTypeObj?._id) {
      dispatch(fetchItemUpdateHistory(itemTypeObj._id));
    }
  }, [isOpen, itemTypeObj?._id, dispatch]);

  const formattedHistory = useMemo(() => {
    return historyData.map(entry => ({
      id: entry?._id,
      date: entry?.editedAt ? new Date(entry.editedAt).toLocaleDateString() : 'N/A',
      field: entry?.field ?? 'N/A',
      oldValue: entry?.oldValue ?? 'N/A',
      newValue: entry?.newValue ?? 'N/A',
      userId: entry?.editedBy?._id,
      userName: entry?.editedBy
        ? `${entry.editedBy.firstName ?? ''} ${entry.editedBy.lastName ?? ''}`.trim()
        : 'Unknown',
      email: entry?.editedBy?.email ?? 'N/A',
    }));
  }, [historyData]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>View Update History</ModalHeader>

      <ModalBody>
        {hasInvalidItem ? (
          'Please select a valid row for viewing history'
        ) : (
          <div className={styles.historyTable}>
            <Table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Field</th>
                  <th>Old Value</th>
                  <th>New Value</th>
                  <th>User</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {formattedHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No history available
                    </td>
                  </tr>
                ) : (
                  formattedHistory.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{entry.field}</td>
                      <td>{entry.oldValue}</td>
                      <td>{entry.newValue}</td>
                      <td>
                        {entry.userId ? (
                          <a href={`/userprofile/${entry.userId}`}>{entry.userName}</a>
                        ) : (
                          entry.userName
                        )}
                      </td>
                      <td>{entry.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
ViewUpdateHistoryModal.propTypes = {
  toggle: PropTypes.func.isRequired,
  item: PropTypes.any,
  isOpen: PropTypes.any,
};
