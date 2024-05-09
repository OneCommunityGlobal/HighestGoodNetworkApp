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

  return <Form className='d-flex align-item-center justify-content-evenly border border-grey rounded p-1 mb-3' style={{height: "3em"}} >
    <Form.Group className='d-flex w-100'>
    <Form.Label className='w-50 mt-2 ml-2'>First name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="First name"
            className='w-60 ml-0'
            name='firstName'
            value={firstName}
            onChange={onChangeInputField}
            // defaultValue=""
          />
    </Form.Group>
    <Form.Group className='d-flex w-100 ml-3'>
          <Form.Label className='w-50 mt-2'>Last name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Last name"
            // defaultValue=""
            className='w-60'
            name='lastName'
            value={lastName}
            onChange={onChangeInputField}
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
    <Form.Group className='d-flex w-100 ml-3'>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={(e) => handleNameSubmit(e,firstName, lastName)}>Search Project</Button>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={cancelSearchByName}>Back</Button>
      </Form.Group>    
    
  </Form>
  
  
}