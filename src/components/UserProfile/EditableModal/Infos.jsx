import React, { useEffect, useReducer, useState } from 'react';
import EditableInfoModal from './EditableInfoModal'

const Infos = (props) => {
  const {areaName, fontSize, CanEdit, CanRead} = props;
  const [editableModalOpen, setEditableModalOpen] = useState(false);
  const toggleEditableModal = () => {
    setEditableModalOpen(!editableModalOpen);
  }

  return (
    (CanRead)&&(
      <div>
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for user class information"
          style={{ fontSize: fontSize, cursor: 'pointer', color: '#00CCFF' }}
          aria-hidden="true"
          className="fa fa-info-circle"
          onMouseOver={() => {
            toggleEditableModal(editableModalOpen); // open modal
          }}
        />
        {editableModalOpen && (
          <EditableInfoModal 
          areaName={areaName}
          CanEdit={CanEdit}
          CanRead={CanRead}
          isOpen={editableModalOpen}
          toggle={toggleEditableModal}
          />
        )}
    </div>)   
  );
}

export default Infos;