import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Table } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchItemUpdateHistory } from '~/actions/bmdashboard/invTypeActions';
import moment from 'moment';
import styles from './ItemListView.module.css';

export default function ViewUpdatehistoryModal({ item, isOpen, toggle }) {
  const dispatch = useDispatch();
  const error = !item || item?.itemType === null;
  const [errors, setErrors] = useState({});
  const historyData = useSelector(state => state.bmInvTypes.historyList);

  useEffect(() => {
    if (!error && item && isOpen) dispatch(fetchItemUpdateHistory(item?.itemType?._id));
  }, [item, isOpen, dispatch]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>View Update History</ModalHeader>
      <ModalBody>
        {error && 'Please select a named row for viewing history'}
        <div className={styles.historyTable}>
          {!error && (
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
                {historyData.map(data => {
                  return (
                    <tr key={data._id}>
                      <td>{moment.utc(data.editedAt).format('LL')}</td>
                      <td>{data.field}</td>
                      <td>{data.oldValue}</td>
                      <td>{data.newValue}</td>
                      <td>
                        <a href={`/userprofile/${data.editedBy._id}`}>
                          {`${data.editedBy.firstName} ${data.editedBy.lastName}`}
                        </a>
                      </td>
                      <td>{data.editedBy?.email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
