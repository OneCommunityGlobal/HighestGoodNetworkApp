// // RoleInfoModal.js
// import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Modal, ModalHeader, ModalBody } from 'reactstrap';

// const RoleInfoModal = ({ role, isOpen, toggle }) => {
//   const dispatch = useDispatch();
//   // Get the text from the store
//   const storedText = useSelector(state => state.roleInfo.roleInfo);

//   // Local state for the input
//   const [inputText, setInputText] = useState(storedText);

//   // Update the input field when the stored text changes
//   useEffect(() => {
//     setInputText(storedText);
//   }, [storedText]);

//   // Handle input change
//   const handleInputChange = (event) => {
//     setInputText(event.target.value);
//   };

//   // Update the stored text when save button is clicked
//   const handleSave = () => {
//     dispatch({ type: 'SET_TEXT', payload: inputText });
//     toggle(false);
//   };

//   if (!isOpen) {
//     return null;
//   }

//   return (
//     <div>
//       <Modal toggle={toggle} isOpen={isOpen}>
//         <span className="close" onClick={() => toggle(false)}>&times;</span>
//         <input type="text" value={inputText} onChange={handleInputChange} />
//         <button onClick={handleSave}>Save</button>
//       </Modal>
//     </div>
//   );
// };

// export default RoleInfoModal;// TextModal.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, Input, ModalHeader, Button, ModalFooter } from 'reactstrap';

class RoleInfoModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roleInfo: this.props.roleInfo,
      role: this.props.role,
      editing: false,
    };
  }
  handleEditing = () => {
      this.setState({editing:!this.state.editing});
  }
  handleInputChange = (event) => {
    const newRoleInfo = event.target.value;
    this.setState({ roleInfo: newRoleInfo });
  };

  handleSave = () => {
    this.setState({editing:false})
    this.props.setRoleInfo(this.state.roleInfo);
  }

  render(){
    const { isOpen, toggle} = this.props;
    const { roleInfo } = this.state;

    return (
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader>Welcome to Role Class Information Page!</ModalHeader>
        <ModalBody>
          <Input 
            disabled={!this.state.editing}
            value={roleInfo}
            onChange={this.handleInputChange}
          />
        </ModalBody>
        <ModalFooter>
          {(this.state.role === 'Owner')&&(!this.state.editing)&&
            (<Button onClick={this.handleEditing}>
              Edit
              </Button> 
            )}
          {(this.state.editing)&&
            (<Button onClick={this.handleSave}>Save</Button> 
            )}
          <Button onClick={toggle}>Close</Button> 
        </ModalFooter>
      </Modal>
    );
  }
}

// map Redux state to component props
const mapStateToProps = (state) => ({
  roleInfo: state.roleInfo.roleInfo,
});

// map Redux dispatch to component props
const mapDispatchToProps = (dispatch) => ({
  setRoleInfo: (roleInfo) => dispatch({ type: 'SET_ROLEINFO', payload: roleInfo }),
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleInfoModal);
