import React, { useEffect, useReducer, useState } from 'react';
// import EditableModal from './editableModal';
import EditableInfoModal from './EditableInfoModal'

const Infos = (props) => {
  // userProfile, updateInfo,
  const {  asUser, newArea } = props;
  const [editableModalOpen, setEditableModalOpen] = useState(false);
  const toggleEditableModal = () => {
    setEditableModalOpen(!editableModalOpen);
  }
  // useEffect(() => {
  //   updateInfo(infoCollections);
  // }, [infoCollections]);

  return (
    <div>
      <i
        data-toggle="tooltip"
        data-placement="right"
        title="Click for user class information"
        style={{ fontSize: 25, cursor: 'pointer', color: '#00CCFF' }}
        aria-hidden="true"
        className="fa fa-info-circle"
        onMouseOver={() => {
          toggleEditableModal(editableModalOpen); // open modal
        }}
      />
      {editableModalOpen && (
        <EditableInfoModal 
        asUser={asUser}
        areaName={newArea}
        isOpen={editableModalOpen}
        toggle={toggleEditableModal}/>
      )}
    </div>
  );
}

// Infos.propTypes = {
//   updateInfo: PropTypes.func.isRequired,
//   userProfile: PropTypes.object.isRequired,
// };
export default Infos;