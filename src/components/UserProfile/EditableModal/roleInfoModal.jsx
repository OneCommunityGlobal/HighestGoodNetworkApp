import React, { useState } from 'react';
import { 
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
 } from 'reactstrap';

const RoleInfoModal = ({info}) => {
    const [isOpen, setOpen] = useState(false);  
    const {infoContent, CanRead} = {...info};
    const handleMouseOver = () => {
      setOpen(true);
    }

    const handleClose = () => {
      setOpen(false);
    }
    if(CanRead){
      return (<div>
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for user class information"
          style={{ fontSize: 24, cursor: 'pointer', color: '#00CCFF', marginTop: '2px', marginLeft: '5px'}}
          aria-hidden="true"
          className="fa fa-info-circle"
          onMouseOver={handleMouseOver}
        />
        {isOpen && (
          <Modal isOpen={isOpen} size="lg">
          <ModalHeader>Welcome to Information Page!</ModalHeader>
          <ModalBody>
           <div 
              style={{ paddingLeft: '20px' }} 
              dangerouslySetInnerHTML={{ __html: infoContent }}/>
          </ModalBody>
          <ModalFooter>
          <Button onClick={handleClose}>Close</Button>
          </ModalFooter>
          </Modal>
        )}
      </div>)
    }
    return (
        <div>
          <p>Please Input Informations first!</p>
        </div>
        
    )
}

export default RoleInfoModal;
;