import React, { useEffect, useReducer, useState } from 'react';
import EditableModal from './editableModal';
// import PropTypes from 'prop-types';

// const infoCollectionsReducer = (state, action) => {
//   switch (action.type) {
//     case 'remove':
//       return state.filter(info => info.areaName !== action.payload.areaName);
//     case 'addOrUpdate':
//       const updatedState = state.filter(info => info.areaName !== action.payload.areaName);
//       updatedState.push({
//         areaName: action.payload.areaName,
//         content: action.payload.content
//       });
//       return updatedState;
//     default:
//       return state;
//   }
// };

const Infos = (props) => {
  const { userProfile, updateInfo, newArea } = props;
  const [editableModalOpen, setEditableModalOpen] = useState(false);
  // const infoCollections = [...userProfile.infoCollections];
  // const [areaName, setAreaName] = useState('')
  // const [content, setContent] = useState('')
  // const [info, setInfo] = useState({});
  // const [infoCollectionsReducer, dispatchInfo] = useReducer(
  //   (infoCollections, { type, value, passedIndex}) => {
  //     setChanged(true);
  //     switch (type) {
  //       case 'add':
  //         setAreaName(areaName);
  //         setContent('Please input content');
  //         return [...personalLinks, value];
  //       case 'remove':
  //         return personalLinks.filter((_, index) => index !== passedIndex);
  //       case 'updateName':
  //         return personalLinks.filter((_, index) => {
  //           if (index === passedIndex) {
  //             _.Name = value;
  //           }
  //           return _;
  //         });
  //       case 'updateLink':
  //         return personalLinks.filter((_, index) => {
  //           if (index === passedIndex) {
  //             _.Link = value;
  //           }
  //           return _;
  //         });
  //       default:
  //         return personalLinks;
  //     }
  //   },
  //   userProfile.personalLinks,
  // );
  // // const [infoCollections, dispatchInfo] = useReducer(infoCollectionsReducer, userProfile.infoCollections);
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
        <EditableModal 
        userProfile={userProfile}
        areaName={newArea}
        isOpen={editableModalOpen}
        toggle={toggleEditableModal}
        updateInfo={updateInfo} />
      )}
    </div>
  );
}

// Infos.propTypes = {
//   updateInfo: PropTypes.func.isRequired,
//   userProfile: PropTypes.object.isRequired,
// };
export default Infos;