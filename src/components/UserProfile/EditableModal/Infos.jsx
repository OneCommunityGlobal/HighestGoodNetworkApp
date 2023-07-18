import React, { useEffect, useReducer, useState } from 'react';
// import EditableModal from './editableModal';
import EditableInfoModal from './EditableInfoModal'
import { useDispatch } from 'react-redux';
import * as actions from '../../../actions/infoCollections';

const Infos = (props) => {
  const {asUser, areaName, infos, fontSize} = props;
  const [editableModalOpen, setEditableModalOpen] = useState(false);
  const toggleEditableModal = () => {
    setEditableModalOpen(!editableModalOpen);
  }

  return (
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
        asUser={asUser}
        isOpen={editableModalOpen}
        toggle={toggleEditableModal}
        infos={infos}
        />
      )}
    </div>
  );
}

export default Infos;