 import React, { useState } from 'react';

 const AddProject = props => {
   const [showAddButton, setShowAddButton] = useState(false);
   const [newName, setNewName] = useState('');
   const [newCategory, setNewCategory] = useState('Unspecified');
   const [loading, setLoading] = useState(false);
 
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
     Promise.resolve(props.onAddNewProject(newName, newCategory))
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
         <select
           value={newCategory}
           onChange={e => setNewCategory(e.target.value)}
           disabled={loading}
         >
           <option default value="Unspecified">
             Select Category
           </option>
           <option value="Food">Food</option>
           <option value="Energy">Energy</option>
           <option value="Housing">Housing</option>
           <option value="Education">Education</option>
           <option value="Society">Society</option>
           <option value="Economics">Economics</option>
           <option value="Stewardship">Stewardship</option>
           <option value="Other">Other</option>
         </select>
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
 

