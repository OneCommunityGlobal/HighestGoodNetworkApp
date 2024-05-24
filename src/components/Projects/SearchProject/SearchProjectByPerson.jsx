/*********************************************************************************
 * Component: postProject
 * Author: Sucheta Mukherjee - 04/27/24
 * This component is used to serach projects by a specific user/person
 ********************************************************************************/
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



export default function SearchProjectByPerson(props){

 const {onChangeInputField, nameInput, handleNameSubmit, cancelSearchByName, allUsers} = props;

 let filteredSuggestion = allUsers.filter(user =>{
  return user.firstName.toLowerCase() == nameInput.toLowerCase() || user.lastName.toLowerCase() == nameInput.toLowerCase()
 })
//  The below code renders a list of suggested name that matches the input name
 let renderSuggestedUser = filteredSuggestion.map((user, index)=>{
  let name = `${user.firstName} ${user.lastName}`
  return <option key={index} value={name}>{name}</option>})


  return <Form id="project_search_by_user_form" >
    <Form.Group className='project_search_by_user_form-group'>
          <Form.Label className='project_search_by_user_form-label'>Search Name</Form.Label>
          <Form.Control
            required
            type="text"
            placeholder="Search by First or Last name"
            className=''
            name='nameInput'
            value={nameInput}
            onChange={onChangeInputField}
            // defaultValue=""
          />
         
    </Form.Group>
    {nameInput && <select name ='nameSelector' className='search-name_project-list' value={nameInput} onChange={onChangeInputField}>
      {renderSuggestedUser}
    </select>}
    
    <Form.Group className='project_search_by_user_form-group'>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={(e) => handleNameSubmit(e,firstName, lastName)}>Search Project</Button>
    <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={cancelSearchByName}>Back</Button>
      </Form.Group>    
    
  </Form>
  
  
}