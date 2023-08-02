import React from 'react';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Table } from 'reactstrap';

const HistoryModal = ({ isOpen, toggle, userName, userHistory }) => {
  return (
    <div>
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Past Promised Hours</ModalHeader>
        <ModalBody>
          {userHistory.length <= 1 ? (
            <p>{userName} has never made any changes to the promised hours.</p>
          ) : (
            <Table striped>
              <thead>
                <tr>
                  <th>Promised Hours</th>
                  <th>Starting Date (from most recent)</th>
                </tr>
              </thead>
              <tbody>
                {[...userHistory].reverse().map(item => (
                  <tr key={item._id}>
                    <td style={{ textAlign: 'center' }}>{item.hours}</td>
                    <td style={{ textAlign: 'center' }}>
                      {new Date(item.dateChanged).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default HistoryModal;
