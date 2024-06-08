/*********************************************************************************
 * Component: postProject
 * Author: Sucheta Mukherjee - 04/27/24
 * This component is used to serach projects by a specific user/person
 ********************************************************************************/
import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';



export default function SearchProjectByPerson(props){

const {onChangeInputField, nameInput, handleNameSubmit, cancelSearchByName, allUsers, darkMode} = props;

//  Below filetr function utilizes the state object gets all userProfile
 let filteredSuggestion = allUsers.filter(user =>{
  return user.firstName.toLowerCase().includes(nameInput.toLowerCase()) || user.lastName.toLowerCase().includes(nameInput.toLowerCase())  
 })
//  The below code renders a list of suggested name that matches the input name
 let renderSuggestedUser = filteredSuggestion.map((user, index)=>{
  let name = `${user.firstName} ${user.lastName}`
  return <option key={`${name}_${index}`} value={name}>{name}</option>})


  return <div id='search_form_container'>
    <Form id="project_search_by_user_form" onSubmit={(e)=> handleNameSubmit(e,nameInput)}>
        <Form.Group className='project_search_by_user_form-group'>
            <Form.Label className={darkMode? 'bg-oxford-blue text-light project_search_by_user_form-label':'project_search_by_user_form-label'}>Search Project By Person</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Search by First or Last name"
              className='project_search_by_user_form-input'
              name='nameInput'
              value={nameInput}
              onChange={onChangeInputField}
            />
          
      </Form.Group>
       
      <Form.Group className='project_search_by_user_form-group-btn btn-group'>
        <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={(e) => handleNameSubmit(e,nameInput)}>Search Project</Button>
        <Button className='p-2 ml-2 btn-md btn-grey border w-100 text-center' style={{height: "2.4em"}} onClick={cancelSearchByName}>Clear Search</Button>
      </Form.Group>    
    
  </Form>

  <span className='search-name_project-list'>
  {nameInput && <select name ='nameSelector' className='form-select_options' value={nameInput} onChange={onChangeInputField}>
      <option >Suggested Users</option>
      {renderSuggestedUser}
    </select>}
  </span>
  </div>
  
}