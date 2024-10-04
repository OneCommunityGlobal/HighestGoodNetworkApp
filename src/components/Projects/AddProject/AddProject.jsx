 import React, { useState } from 'react';
 import Select from 'react-select';

 const AddProject = props => {
   const [showAddButton, setShowAddButton] = useState(false);
   const [newName, setNewName] = useState('');
   const [newCategory, setNewCategory] = useState({ value: 'Unspecified', label: 'Select Category' });
   const [loading, setLoading] = useState(false);

   const options = [
     { value: 'Food', label: 'Food' },
     { value: 'Energy', label: 'Energy' },
     { value: 'Housing', label: 'Housing' },
     { value: 'Education', label: 'Education' },
     { value: 'Society', label: 'Society' },
     { value: 'Economics', label: 'Economics' },
     { value: 'Stewardship', label: 'Stewardship' },
     { value: 'Other', label: 'Other' }
   ];
 
   const changeNewName = name => {
     if (name.length !== 0) {
       setShowAddButton(true);
     } else {
       setShowAddButton(false);
     }
     setNewName(name);
   };
 
   const handleAddProject = () => {
     setLoading(true); // Start loading
     Promise.resolve(props.onAddNewProject(newName, newCategory.value))
    .then(() => {
      // Reset fields after the project is added
      setNewName('');
      setNewCategory('Unspecified');
      setShowAddButton(false);
    })
    .finally(() => {
      setLoading(false); // Stop loading
    });
   };
 
   return (
     <div className="input-group" id="new_project">
       <div className="input-group-prepend">
         <span className="input-group-text">Add new project</span>
       </div>
       <input
         type="text"
         className="form-control"
         aria-label="New Project"
         placeholder="Project Name (required) type to add."
         value={newName}
         onChange={e => changeNewName(e.target.value)}
         disabled={loading}
       />
       <div className="input-group-append">
        <Select
          value={newCategory}
          onChange={setNewCategory}
          options={options}
        />
       </div>
       <div className="input-group-append">
         {showAddButton && (
           <button
             className="btn btn-outline-primary"
             type="button"
             onClick={handleAddProject}
             disabled={loading}
           >
             {loading ? (
               <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>
             ) : (
               <i className="fa fa-plus" aria-hidden="true"></i>
             )}
           </button>
         )}
       </div>
     </div>
   );
 };
 
 export default AddProject;