import React from 'react';
import NewProfileLink from './NewProfileLink'

const ProfileLinksCard = ({data:links,canEdit, label, handleProfileLinks, collection }) => {
    return ( 
        <div className="card border-secondary w-100">
            <div className="card-body">
            <h4 class="card-title">{label} Links</h4>
    <h6 class="card-subtitle mb-2 text-muted">{links.length === 0 ? `No ${label} link defined`: ""}</h6>
    <p class="card-text">

{links.map((link, index) => 
    <div className="form-group row">
    <label htmlFor="" className="label col-2">{link.Name}</label>
    <a href={link.Link} className="col-8" target="_blank" data-toggle="tooltip" data-placement="bottom">
    <input type="url" className="form-control col-12" value = {link.Link}/>
    </a>
    {canEdit &&  <span class="fa fa-trash pull-right col-1 label" data-toggle="tooltip" data-placement="right" title="Remove this link" onClick = {() => handleProfileLinks(collection,link,"delete", index)} ></span> }
    

    </div>
)}
{canEdit && <NewProfileLink label = {label} onSubmit = {handleProfileLinks} collection  = {collection}/>}
    </p>
            </div>
            </div>
     );
}
 
export default ProfileLinksCard;