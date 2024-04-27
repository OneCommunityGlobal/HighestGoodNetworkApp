/*********************************************************************************
 * Component: postProject
 * Author: Sucheta Mukherjee - 04/27/24
 * This component is used to serach projects by a specific user/person
 ********************************************************************************/
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';




export default function SearchProjectByPerson(){
  return <Form className='d-flex align-item-center justify-content-evenly border border-grey rounded p-1 mb-3' style={{height: "3em"}}>
    <Form.Group className='d-flex w-100'>
    <Form.Label className='w-50 mt-2'>First name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="First name"
            className='w-60 ml-0'
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
          />
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
        </Form.Group>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}}>Search Project</Button>
  </Form>
  
}