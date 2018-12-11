import React, {Fragment} from 'react';
import Joi from 'joi'
import Form from './common/form';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import _ from 'lodash'
import ShowSaveWarning from "./common/ShowSaveWarning"
import Loading from './common/Loading'
import {getAllProjects} from "../services/projectService"
import {getAllTeams} from "../services/teamService"

class ManageMemberships extends Form {
    constructor(props) {
        super(props);
        this.state.modal = false;
        this.toggle = this.toggle.bind(this);
        this.state.data = props.data
        this.initialState = _.cloneDeep(this.state)
        this.schema = props.schema
        this.state.allEntities = [];
        this.isLoading = true
    }

    loadData = async() => {

        this.toggle();
        let {data:allEntities} = this.props.collection === "teams" ?  await getAllTeams() : await getAllProjects()
       let isLoading = false;       
       this.setState({allEntities, isLoading})
       
    }

    toggle() {
        this.setState({
          modal: !this.state.modal
        });
      }

      onCancel = ()=>
    {
        this.resetForm();
        this.toggle();
    }

    doSubmit()
    {
        this.props.onSubmit(this.props.collection, this.state.data, "create");
        this.toggle();
        this.resetForm()
    }

    getName = element => this.props.collection === "teams" ?  element.teamName : element.projectName
    getCheckedStatus= id => this.state.data.some(membership => membership._id === id)? true: null
    handleClick = e => console.log(e)


    render() { 

        let {isLoading,allEntities, data: memberships} = this.state;
        let {label} = this.props
        return(

            <Fragment>
         <button className="btn btn-primary" onClick = {this.loadData}>Manage {label} </button>

<Modal isOpen={this.state.modal} toggle={this.toggle} >
  <ModalHeader toggle={this.toggle}>Manage{label}</ModalHeader>
  <form onSubmit={e => this.handleSubmit(e)}>
  <ModalBody>
    {this.isStateChanged() && <ShowSaveWarning/>}
    {allEntities.map(element => 
    <div className="form-check">   
    {this.renderInput({label: this.getName(element), 
        checked : this.getCheckedStatus(element._id), 
        type: "checkbox", inputClassName: "form-check-input" , 
        labelClassName: "form-check-label",
        onClick : e => this.handleClick(e)
        })}
   
    </div>
    
       )}

  
 
  </ModalBody>
  <ModalFooter>            
 {this.renderButton("Done")}
<Button color="secondary" onClick={this.onCancel}>Cancel</Button>
  </ModalFooter>
  </form>
</Modal>
       </Fragment>

           
        )

    }
}
 
export default ManageMemberships;