/*********************************************************************************
 * Component: postProject
 * Author: Sucheta Mukherjee - 04/27/24
 * This component is used to serach projects by a specific user/person
 ********************************************************************************/
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



export default function SearchProjectByPerson(props){

 const {onChangeInputField, firstName, lastName, handleNameSubmit, cancelSearchByName} = props;

  return <Form id="project_search_by_user_form" >
    <Form.Group className='project_search_by_user_form-group'>
          <Form.Label className='project_search_by_user_form-label'>First name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="First name"
            className=''
            name='firstName'
            value={firstName}
            onChange={onChangeInputField}
            // defaultValue=""
          />
    </Form.Group>
    <Form.Group className='project_search_by_user_form-group'>
          <Form.Label className='project_search_by_user_form-label'>Last name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Last name"
            // defaultValue=""
            className=''
            name='lastName'
            value={lastName}
            onChange={onChangeInputField}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
    <Form.Group className='project_search_by_user_form-group'>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={(e) => handleNameSubmit(e,firstName, lastName)}>Search Project</Button>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={cancelSearchByName}>Back</Button>
      </Form.Group>    
    
  </Form>
  
  
}