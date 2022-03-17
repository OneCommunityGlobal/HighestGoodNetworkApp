// import React from 'react';
// import _ from 'lodash'
// import {Link} from 'react-router-dom'
// import ManageMemberships from "./../ManageMemberships"

// const Memberships = ({collection,label, data, canEdit,handleDelete, handleBulkUpdates, schema}) => {

//     const getLink = id =>`/${_.lowerCase(label)}/${id}`
//     const getText = element =>  _.has(element, "teamName")? element.teamName : element.projectName

//     return (
//         <div className="card background-primary w-100">
//         <div className="card-body">
//         <h4 className="card-title">{_.startCase(label)} Memberships</h4>
//         <p className="card-text">{data.length >0 ? "": `No memberships`}</p>
//         <ul className="list-group list-group-flush">
//         {data.map((element, index) =>
//         <li className="list-group-item" key = {element._id}>
//                <Link to = {getLink(element._id)}>{getText(element)}</Link>
//                {canEdit && <span className="fa fa-trash pull-right"
//                onClick = {() => handleDelete(collection, element, "delete", index )}></span> }
//         </li>)}

//         </ul>
//         </div>
//         <div className="card-footer">
//         {canEdit && <ManageMemberships loadData = {true} schema = {schema} label = {label} onSubmit = {handleBulkUpdates} data = {data} collection  = {collection}/>}
//         </div>
//         </div>
//      );
// }

// export default Memberships;
