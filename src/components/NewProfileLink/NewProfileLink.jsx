// import React from 'react';
// import Joi from 'joi'
// import Form from '../common/Form';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import _ from 'lodash'
// import ShowSaveWarning from "../common/ShowSaveWarning"

// class NewProfileLink extends Form {

//     constructor(props)
//     {
//         super(props);
//         this.state.modal = false;
//         this.toggle = this.toggle.bind(this);
//         this.state.data =
//         {
//             Name : "",
//             Link : ""
//         }
//         this.initialState = _.cloneDeep(this.state)
//     }
//     toggle() {
//         this.setState({
//           modal: !this.state.modal
//         });
//       }

//     schema ={
//         Name: Joi.string().trim().required(),
//         Link : Joi.string().trim().uri().required()
//     }

//     onCancel = ()=>
//     {
//         this.resetForm();
//         this.toggle();
//     }

//     doSubmit()
//     {
//         this.props.onSubmit(this.props.collection, this.state.data, "create");
//         this.toggle();
//         this.resetForm()
//     }

//     render() {
//         let {label} = this.props;
//         return (
//            <React.Fragment>
//             <div className="btn btn-link" onClick={this.toggle}>Add New {label} Link</div>

// <Modal isOpen={this.state.modal} toggle={this.toggle} >
//       <ModalHeader toggle={this.toggle}>New {label} Link</ModalHeader>
//       <form onSubmit={e => this.handleSubmit(e)}>
//       <ModalBody>
//       {this.isStateChanged() && <ShowSaveWarning/>}
//       {this.renderInput({name: "Name", label: "Name:", className : "col-md-12",  type: "text" ,value : this.state.data.Name  })}
//       {this.renderInput({name: "Link", label: "Link:", className : "col-md-12", type: "url", value : this.state.data.Link })}
//       </ModalBody>
//       <ModalFooter>
//      {this.renderButton("Done")}
//     <Button color="secondary" onClick={this.onCancel}>Cancel</Button>
//       </ModalFooter>
//       </form>
// </Modal>
//            </React.Fragment>

//          );
//     }
// }

// export default NewProfileLink;
