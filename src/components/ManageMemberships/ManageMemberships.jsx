// import React, {Fragment} from 'react';
// import Form from '../common/Form';
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
// import _ from 'lodash'
// import ShowSaveWarning from "../common/ShowSaveWarning"
// import {getAllProjects} from "../../services/projectService"
// import {getAllTeams} from "../../services/teamService"

// class ManageMemberships extends Form {
//     constructor(props) {
//         super(props);
//         this.state.allEntities = [];
//         this.state.isLoading = true;
//         this.toggle = this.toggle.bind(this);
//         this.state.modal = false;
//         this.schema = props.schema
//         this.state.data = this.props.data;
//         this.initialState = _.cloneDeep(this.state)
//     }

//     getDerivedStateFromProps(props)
//     {
//         this.state.data = props.data
//         this.initialState = _.cloneDeep(this.state)
//     }

//     loadData = async() => {

//         this.toggle();
//         let {data:allEntities} = this.props.collection === "teams" ?  await getAllTeams() : await getAllProjects()
//         let isLoading = false;
//         this.setState({allEntities, isLoading})
//     }

//     toggle() {
//         this.setState({
//           modal: !this.state.modal
//         });
//     }

//     onCancel = () => {
//         this.resetForm();
//         this.toggle();
//     }

//     doSubmit = () =>
//     {
//         this.toggle();
//         this.props.onSubmit(this.props.collection, this.state.data);
//         return this.initialState = _.cloneDeep(this.state)
//     }
//     getName = element => element[this.pathName()]
//     getCheckedStatus= id => this.state.data.some(membership => membership._id === id)? true: null
//     pathName = () => this.props.collection === "teams" ?  "teamName" : "projectName"
//     handleChange = (e) => {
//         let {allEntities, data} = this.state;
//         if(e.target.checked) //item was selected so add it to the memberships
//         {
//             let newMembership = allEntities[ _.findIndex(allEntities, o => o._id === e.target.id)];
//             data.push(_.pick(newMembership, _.keys(this.schema)))
//         }
//         else
//         {
//             let index = _.findIndex(data, o => o._id === e.target.id);
//             _.pullAt(data, [index])
//         }
//         this.setState({data})
//     }

//     render() {

//         let {allEntities} = this.state;
//         let {label} = this.props;
//         return(

//         <Fragment>
//             <div className="btn btn-success" onClick = {this.loadData}>{`Manage ${_.startCase(label)}s`}</div>

//             <Modal isOpen={this.state.modal} toggle={this.toggle} >
//                 <ModalHeader toggle={this.toggle}>{`${_.startCase(label)}s`}</ModalHeader>
//                 <form>
//                     <ModalBody>
//                         {this.isStateChanged() && <ShowSaveWarning/>}
//                         {this.renderCheckboxCollection({items: allEntities, pathName:this.pathName(), isChecked : this.getCheckedStatus,onChange : this.handleChange   })}
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button color="primary"onClick = {e=> this.doSubmit(e)}>Done</Button>
//                         <Button color="secondary" onClick={this.onCancel}>Cancel</Button>
//                     </ModalFooter>
//                 </form>
//             </Modal>
//        </Fragment>

//         )

//     }
// }

// export default ManageMemberships;
