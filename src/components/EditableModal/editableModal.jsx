// import React, { useState, useReducer } from 'react';
// import {
//   Button,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Label,
//   CardBody,
//   Card,
//   Col,
// } from 'reactstrap';
// import PropTypes from 'prop-types';
// import { useSelector } from 'react-redux';
// // export default InfoModal;
// const EditableModal = (props) => {
//   const {userProfile, areaName, isOpen, toggle, onUpdate} = props;
//   const [editing, setEditing] = useState(false);
//   const [currInfo, setCurrInfo] = useState({areaName:areaName, 
//                                             content:'Please input content!'});

//   useEffect(() => {
//     infoCollections.forEach(info => {
//       if(info.areaName === currInfo.areaName){
//         setCurrInfo(info)
//       }
//     });
//   }, [infoCollections]); // Depends on infoCollections
  

//   const handleEditing = () => {
//     setEditing(!editing);
//   }

//   const handleInputChange = (event) => {
//     setCurrInfo({...currInfo, content:event.target.value});
//   };

//   const handleSave = () => {
//     const newInfoCollections = [...infoCollections];
//     let found = false;
//     for(let info of newInfoCollections){
//       if(info.areaName == currInfo.areaName){
//         info.content = currInfo.content;
//         found = true;
//       }
//     }
//     if(!found){
//       newInfoCollections.push(currInfo);
//     }
//     console.log('new', newInfoCollections)
//     handleEditing();
//     OnDispatch({
//         type: 'addOrUpdate',
//         payload: currInfo,
//     });
//     console.log('inof',currInfo)
//     onUpdate(newInfoCollections);
//     };

//   return (
//     <Modal isOpen={isOpen} toggle={toggle} size="lg">
//       <ModalHeader>Welcome to Role Class Information Page!</ModalHeader>
//       <ModalBody>
//         <Input
//           rows={10}
//           type='textarea'
//           disabled={!editing}
//           value={currInfo.content}
//           onChange={handleInputChange}
//         />
//       </ModalBody>
//       <ModalFooter>
//         {role === 'Owner' && !editing &&
//           <Button onClick={handleEditing}>
//             Edit
//           </Button>}
//         {editing &&
//           <Button onClick={handleSave}>Save</Button>}
//         <Button onClick={toggle}>Close</Button>
//       </ModalFooter>
//     </Modal>
//   );
// }

// export default EditableModal;
import React, { useState, useReducer } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  CardBody,
  Card,
  Col,
} from 'reactstrap';
import PropTypes from 'prop-types';
// import styles from './InfoCollection.css';
// import { boxStyle } from 'styles';

const EditableModal = props => {
  const { userProfile, areaName, isOpen, toggle, updateInfo} = props;
  const [newareaName, setAreaName] = useState('');
  const [areaContent, setAreaContent] = useState('');
  const [infoCollections, dispatchInfoCollection] = useReducer(
    (infoCollections, { type, value, passedIndex }) => {
      switch (type) {
        case 'add':
          setAreaName('');
          setAreaContent('');
          return [...infoCollections, value];
        case 'remove':
          return infoCollections.filter((_, index) => index !== passedIndex);
        case 'updateName':
          return infoCollections.filter((_, index) => {
            if (index === passedIndex) {
              _.Name = value;
            }
            return _;
          });
        case 'updateContent':
          return infoCollections.filter((_, index) => {
            if (index === passedIndex) {
              _.Content = value;
            }
            return _;
          });
        default:
          return infoCollections;
      }
    },
    userProfile.infoCollections,
  );

  return (
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Edit Info</ModalHeader>
        <ModalBody>
          <CardBody>
            <Card style={{ padding: '16px' }}>
              <Label style={{ display: 'flex', margin: '5px' }}>Area Information:</Label>
              <div style={{ display: 'flex', margin: '5px' }}>
                <div className="customTitle">Area Name</div>
                <div className="customTitle">Area Content</div>
              </div>
              {infoCollections.map((info, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', margin: '5px' }}
                  className="info-fields"
                >
                  <input
                    className="customInput"
                    value={info.Name}
                    onChange={e =>
                      dispatchInfoCollection({
                        type: 'updateName',
                        value: e.target.value,
                        passedIndex: index,
                      })
                    }
                  />
                  <textarea
                    className="customInput"
                    value={info.Content}
                    onChange={e =>
                      dispatchInfoCollection({
                        type: 'updateContent',
                        value: e.target.value,
                        passedIndex: index,
                      })
                    }
                  />
                  <button
                    type="button"
                    className="closeButton"
                    color="danger"
                    onClick={() =>
                      dispatchInfoCollection({ type: 'remove', passedIndex: index })
                    }
                  >
                    X
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', margin: '5px' }}>
                <div className="customTitle">+ ADD INFO:</div>
              </div>

              <div style={{ display: 'flex', margin: '5px' }} className="info-fields">
                <input
                  className="customEdit"
                  id="areaName"
                  placeholder="enter area name"
                  onChange={e => setAreaName(e.target.value)}
                />
                <textarea
                  className="customEdit"
                  id="areaContent"
                  placeholder="enter area content"
                  onChange={e => setAreaContent(e.target.value)}
                />
                <button
                  type="button"
                  className="addButton"
                  onClick={() =>
                    dispatchInfoCollection({
                      type: 'add',
                      value: { Name: areaName, Content: areaContent },
                    })
                  }
                >
                  +
                </button>
              </div>
            </Card>
          </CardBody>
        </ModalBody>
        <ModalFooter>
          <Button
            color="info"
            onClick={() => {
              updateInfo(infoCollections);
              toggle();
            }}
          >
            Update
          </Button>
          <Button color="primary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
  );
};

EditableModal.propTypes = {
  updateInfo: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};
export default EditableModal;
