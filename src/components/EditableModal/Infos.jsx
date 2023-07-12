import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { addNewInfo, updateInfo, getAllInfos } from '../../actions/info'
import { updateUserProfile, getUserProfile } from '../../actions/userProfile';
import { getAllUserProfile } from '../../actions/userManagement';
import EditableModal from './editableModal';

const Infos = (props) => {
  useEffect(() => {
    getAllInfos();
    props.getUserRole(props.auth?.user.userid);
  }, [props.getUserRole, props.auth, getAllInfos]);

  const{role, newArea, infos, getAllInfos, addNewInfo, updateInfo} = props;

  const [editableModalOpen, setEditableModalOpen] = useState(false);
  const toggleEditableModal = () => {
    setEditableModalOpen(!editableModalOpen);
  }
  const newInfoObject = {
    area: newArea,
    content: 'welcome to role Info',
  }
  const handleAddNewInfo = () => {
    addNewInfo(newInfoObject);
  };


  const infoId = props.infoId;
  // for(const info of infos){
  //   if(info.area === newArea){
  //     infoId = info._id;
  //   }
  // }

  const getSelectedInfo = (infoId) => {
    const selectedInfo = infos.find(info => info._id === infoId);
    return selectedInfo ? selectedInfo.content : '';
  }

  const selectedInfoContent = getSelectedInfo(infoId);


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
        <EditableModal 
        role={role}
        infoId={infoId}
        isOpen={editableModalOpen}
        info={getSelectedInfo(infoId)}
        updateInfo={updateInfo}
        /> // replace this line with your modal component
      )}
    </div>
  );
}


const mapStateToProps = state => ({
  infos: state.info.infos, 
  auth: state.auth,
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => ({
  getAllInfos: () => dispatch(getAllInfos()),
  updateUserProfile: data => dispatch(updateUserProfile(data)),
  getAllUsers: () => dispatch(getAllUserProfile()),
  getUserRole: id => dispatch(getUserProfile(id)),
  addNewInfo: newInfo => dispatch(addNewInfo(newInfo)),
  updateInfo: (infoId, updatedInfo) => dispatch(updateInfo(infoId, updatedInfo)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Infos);
