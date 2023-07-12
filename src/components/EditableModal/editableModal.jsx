import React, {  useEffect, useState } from 'react';
import { Modal, ModalBody, Label, Input, ModalHeader, Button, ModalFooter, CustomInput } from 'reactstrap';

// export default RoleInfoModal;
const EditableModal = (props) => {
  const { role, infoId, isOpen, info, updateInfo, toggle } = props;
  const [editing, setEditing] = useState(false);
  const [currInfo, setCurrInfo] = useState('');

  useEffect(() => {
    setCurrInfo(info);
  }, [info]);

  const handleEditing = () => {
    setEditing(!editing);
  }

  const handleInputChange = (event) => {
    const newInfo = event.target.value;
    setCurrInfo(newInfo);
  };

  const handleSave = () => {
    handleEditing();
    updateInfo(infoId, currInfo);
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader>Welcome to Role Class Information Page!</ModalHeader>
      <ModalBody>
        <Input
          rows={10}
          type='textarea'
          disabled={!editing}
          value={currInfo}
          onChange={handleInputChange}
        />
      </ModalBody>
      <ModalFooter>
        {role === 'Owner' && !editing &&
          <Button onClick={handleEditing}>
            Edit
          </Button>}
        {editing &&
          <Button onClick={handleSave}>Save</Button>}
        <Button onClick={toggle}>Close</Button>
      </ModalFooter>
    </Modal>
  );
}

export default EditableModal;

// import React, {  useEffect, useState } from 'react';
// import { Modal, ModalBody, Label, Input, ModalHeader, Button, ModalFooter, CustomInput } from 'reactstrap';

// const EditableModal = (props) =>{
//   const {role, infoId, isOpen, info, updateInfo} = props;
//   const [editing, setEditing] = useState(false);
//   const [currInfo, setCurrInfo] = useState('');
//   useEffect(() => {
//     setCurrInfo(info);
// }, [currInfo]);

//   const handleEditing = () => {
//     setEditing(!editing);
//   }
//   const handleInputChange = (event) => {
//     const newInfo = event.target.value;
//     setCurrInfo(newInfo);
//   };

//   const handleUpdateInfo = (updatedInfoContent) => {
//     const updatedInfo = {
//       area: newArea,
//       content: updatedInfoContent,
//       infoId: infoId,
//     }
//     updatedInfoContent(infoId, updateInfo)
//   };

//   const handleSave = () => {
//     handleEditing();
//     updateInfo(infoId, currInfo);
//     // const updatedInfo = {
//     //   area: newArea,
//     //   content: updatedInfoContent,
//     //   infoId: infoId,
//     // }
//     // updatedInfoContent(infoId, updateInfo)
//     // handleUpdateInfo(infoId, currInfo);
//   }

//     return (
//       <Modal isOpen={isOpen} toggle={toggle} size="lg">
//         <ModalHeader>Welcome to Role Class Information Page!</ModalHeader>
//         <ModalBody>
//           <Input
//             rows={10}
//             type='textarea'
//             disabled={!editing}
//             value={currInfo}
//             onChange={handleInputChange}
//           />
//         </ModalBody>
//         <ModalFooter>
//           {(role === 'Owner')&&(!editing)&&
//             (<Button onClick={handleEditing}>
//               Edit
//               </Button> 
//             )}
//           {(editing)&&
//             (<Button onClick={handleSave}>Save</Button> 
//             )}
//           <Button onClick={toggle}>Close</Button> 
//         </ModalFooter>
//       </Modal>
//     );
//   }
// export default EditableModal;