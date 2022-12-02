// import React from 'react';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import Form from '../common/Form';
// import _ from 'lodash'
// import ShowSaveWarning from "../common/ShowSaveWarning"

// class RenderInfringment extends Form {
//     constructor(props) {
//         super(props);
//         this.state = {
//             data: {...props.infringment},
//             isUserAdmin: props.isUserAdmin,
//             modal: false,
//             index: props.index,
//             errors: {}
//          }
//          this.toggle = this.toggle.bind(this);
//          this.prevState = this.state;
//          this.initialState = _.cloneDeep(this.state)
//          this.schema = props.schema
//     }

//     toggle() {
//         this.setState({
//           modal: !this.state.modal
//         });
//       }

//       onCancel = () => {
//           this.toggle();
//           return this.resetForm()

//       }

//       doSubmit = ()=> {
//           (this.state.index >= 0)?
//           this.props.handleInfringment(this.state.data,"edit", this.state.index):
//           this.props.handleInfringment(this.state.data,"create")
//           this.toggle()
//       }
//     render() {

//         let {date, description}  = this.state.data;
//         let {isUserAdmin, index} = this.state;
//         let {handleInfringment} = this.props
//         let isEmpty = !(!!date && !! description);
//         let className = isEmpty? "fa fa-square": "fa fa-square infringement";
//         let tooltip = !isEmpty ? `Date: ${date} \nDescription: ${description}`: ""

//         return (

//             <div className = "m-1">
//             <div className="row ml-1 mr-1">
//             <span className = {className}
//             data-toggle="tooltip" data-placement="bottom"
//         title = {tooltip}/>
//             </div>
//             {isUserAdmin && <React.Fragment>
//         <div className="row ml-1">
//         <span className="fa fa-pencil" onClick={this.toggle}/>
//          <Modal isOpen={this.state.modal} toggle={this.toggle} >
//           <ModalHeader toggle={this.toggle}>Infringment</ModalHeader>
//           <form onSubmit={e => this.handleSubmit(e)}>
//           <ModalBody>
//           {this.isStateChanged() && <ShowSaveWarning/>}
//           {this.renderInput({name: "date", label: "Date:", className : "col-md-12", value :date, type: "date"  })}
//           {this.renderInput({name: "description", label: "Description:",spellCheck: true, className : "col-md-12", value : description})}
//           </ModalBody>
//           <ModalFooter>
//           {this.renderButton("Submit")}
//             <Button color="secondary" onClick={this.onCancel}>Cancel</Button>
//           </ModalFooter>
//           </form>
//         </Modal>

//             </div>
//             <div className="row ml-1">
//             {!isEmpty && <span className="fa fa-trash" onClick = {()=>handleInfringment(this.state.data,"delete",index )}/> }
//             </div>
//             </React.Fragment> }
//             </div>

//           );
//     }
// }

// export default RenderInfringment;
