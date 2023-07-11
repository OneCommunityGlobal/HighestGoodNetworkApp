// export default RoleInfoModal;
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, ModalBody, Input, ModalHeader, Button, ModalFooter, CustomInput } from 'reactstrap';

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
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader>Welcome to Role Class Information Page!</ModalHeader>
        <ModalBody>
          <Input
            rows={10}
            type='textarea'
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
