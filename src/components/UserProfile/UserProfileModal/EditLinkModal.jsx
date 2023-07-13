import React, { useState, useReducer } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Label,
  CardBody,
  Card,
  Col,
} from 'reactstrap';
import PropTypes from 'prop-types';
import hasPermission from '../../../utils/permissions';
import { useSelector } from 'react-redux';
import styles from './EditLinkModal.css';

const EditLinkModal = props => {
  const { isOpen, closeModal, updateLink, userProfile, setChanged, role, } = props;
  const { roles } = useSelector(state => state.role);
  const userPermissions = useSelector(state => state.auth.user?.permissions?.frontPermissions);
  
  const initialAdminLinkState =[{Name: 'Google Doc', Link:''},{Name: 'Dropbox Folder', Link:''}];
  const emptyLink = {Name:'',Link:''};
    
  const [newAdminLink, setNewAdminLink] = useState(emptyLink)
  const [newPersonalLink, setNewPersonalLink] = useState(emptyLink)
  
  
  const [googleLink, setGoogleLink] = useState(userProfile.adminLinks.find(link => link.Name === 'Google Doc')? userProfile.adminLinks.find(link => link.Name === 'Google Doc'): initialAdminLinkState[0])
  const [dropboxLink, setDropboxLink] = useState(userProfile.adminLinks.find(link => link.Name === 'Dropbox Folder')? userProfile.adminLinks.find(link => link.Name === 'Dropbox Folder'): initialAdminLinkState[1])
  const [adminLinks, setAdminLinks] = useState(userProfile.adminLinks?  (userProfile.adminLinks.filter(link => link.Name !== 'Google Doc')) : []);
  const [personalLinks, setPersonalLinks] = useState(userProfile.personalLinks? userProfile.personalLinks : []);
  
  const [isChanged, setIsChanged] = useState(false);
  const [isValidLink, setIsValidLink] = useState(false);

  const handleNameChanges = (e, links,index,setLinks) => {
    const updateLinks = [...links];
    updateLinks[index] = {...updateLinks[index], Name: e.target.value}
    setLinks(updateLinks);
    setIsChanged(true);
  }
  const handleLinkChanges = (e, links,index,setLinks) => {
    const updateLinks = [...links];
    updateLinks[index] = {...updateLinks[index], Link: e.target.value}
    setLinks(updateLinks);
    setIsChanged(true);
  }

  const addNewLink = (links,setLinks,newLink,clearInput) => {
    const newLinks = [...links,{Name:newLink.Name,Link:newLink.Link}];
    if(isDuplicateLink(links,newLink) || !isValidUrl(newLink.Link)){
      setIsValidLink(false);
    } else{
      setLinks(newLinks);
      setIsChanged(true);
      clearInput();
      setIsValidLink(true);
    }
  }

  const removeLink = (links, setLinks,{name,link}) => {
    const newLinks = links.filter((link) => {
      return (link.Name !== name)
    })
    setLinks(newLinks)
  }

  const isDuplicateLink = (links,newLink) => {
    // ! return true if there is a duplicate link, which is invalid
    if(newLink.Name === '' || newLink.Link === '') return true;
    else {
      const name = newLink.Name;
      const nameSet = new Set();
      links.forEach(link => {
        nameSet.add(link.Name);
      })
      return nameSet.has(name);
    }
  }

  const isValidUrl = (url) => {
    try {
      const pattern = /^(?:https?:\/\/)?[\w.-]+\.[a-zA-Z]{2,}(?:\/\S*)?$/;
      return pattern.test(url);

    } catch(err) {
        console.log(err)
        return false;
      }
  }


  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Edit Links</ModalHeader>
        <ModalBody>
          <div>
            {hasPermission(role, 'adminLinks', roles, userPermissions) && (
              <CardBody>
                <Card style={{ padding: '16px' }}>
                  <Label style={{ display: 'flex', margin: '5px' }}>Admin Links:</Label>
                  <div>
                    {/* // TODO: remove  */}
   
                    {googleLink && 
                        <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                          <p>Google Doc</p>
                          <input 
                            className='customEdit'
                            placeholder='Google Doc Link'
                            value={googleLink.Link}
                            onChange={e => {
                              setGoogleLink({...googleLink,Link:e.target.value})
                              setIsChanged(true);
                            }}
                          />
                        </div>
                    
                    }
                    {dropboxLink && 
                        <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                          <p>Dropbox Folder</p>
                          <input 
                            className='customEdit'
                            placeholder='Dropbox folder Link'
                            value={dropboxLink.Link}
                            onChange={e => {
                              setDropboxLink({...dropboxLink,Link:e.target.value})
                              setIsChanged(true);
                            }}
                          />
                        </div>
                    
                    }

                    {/* Other admin links are below */}
                    {adminLinks?.map((link, index) => (
                      
                      <div key={index} style={{ display: 'flex', margin: '5px' }} className="link-fields">
                        <input
                          className="customInput"
                          value={link.Name}
                          onChange={e => handleNameChanges(e,adminLinks,index,setAdminLinks)}
                          placeholder='Link Name'
                            />
                        <input
                          className="customInput"
                          value={link.Link}
                          onChange={e => handleLinkChanges(e,adminLinks,index,setAdminLinks)
                          }
                          placeholder='Link URL'
                        />
                        <button
                          type="button"
                          className="closeButton"
                          color="danger"
                          onClick={()=> removeLink(adminLinks,setAdminLinks,{name:link.Name,link:link.Link})}
                        >
                          X
                        </button>
                      </div>
                    ))}
                      {/* Adding New link below */}
                    <div style={{ display: 'flex', margin: '5px' }}>
                      <div className="customTitle">+ ADD LINK:</div>
                    </div>
                    <div style={{ display: 'flex', margin: '5px'}} className="link-fields">
                      <input
                        className="customEdit"
                        id="linkName"
                        placeholder="enter name"
                        value={newAdminLink.Name}
                        onChange={e => {
                          const { value } = e.target;
                          setNewAdminLink(prev => ({ ...prev, Name: value }));
                        }}
                        />
                      <input
                        className="customEdit"
                        id="linkURL"
                        placeholder="enter link"
                        value={newAdminLink.Link}
                        onChange={ e => {
                          const { value } = e.target;
                          setNewAdminLink(prev => ({ ...prev, Link: value }));
                        }}
                        />


                      <button
                        type="button"
                        className="addButton"
                        onClick={()=> {addNewLink(adminLinks,setAdminLinks,newAdminLink,()=>setNewAdminLink(emptyLink));}}
                        >
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              </CardBody>
            )}
            <CardBody>
              <Card style={{ padding: '16px' }}>
                <Label style={{ display: 'flex', margin: '5px' }}>Personal Links:</Label>
                <div>
                  {personalLinks.map((link, index) => (
                    <div key={index} style={{ display: 'flex', margin: '5px' }} className="link-fields">
                      <input
                        className="customInput"
                        value={link.Name}
                        onChange={e => handleNameChanges(e,personalLinks,index,setPersonalLinks)}
                        />
                      <input
                        className="customInput"
                        value={link.Link}
                        onChange={e => handleLinkChanges(e,personalLinks,index,setPersonalLinks)}
                        />
                      <button
                        type="button"
                        className="closeButton"
                        color="danger"
                        onClick={()=> removeLink(personalLinks,setPersonalLinks,{name:link.Name,link:link.Link})}
                        >
                        X
                      </button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', margin: '5px' }}>
                    <div className="customTitle">+ ADD LINK:</div>
                  </div>

                  <div style={{ display: 'flex', margin: '5px' }} className="link-fields">
                    <input
                      className="customEdit me-3"
                      id="linkName"
                      placeholder="enter name"
                      value={newPersonalLink.Name}
                      onChange={e => {
                        const { value } = e.target;
                        setNewPersonalLink(prev => ({ ...prev, Name: value }));
                        setIsChanged(true);
                      }}
                      />
                    <input
                      className="customEdit"
                      id="linkURL"
                      placeholder="enter link"
                      value={newPersonalLink.Link}
                      onChange={e => {
                        const { value } = e.target;
                        setNewPersonalLink(prev => ({ ...prev, Link: value }));
                        setIsChanged(true);
                      }}
                      />
                    <button
                      type="button"
                      className="addButton"
                      onClick={()=> {addNewLink(personalLinks,setPersonalLinks,newPersonalLink,()=>setNewPersonalLink(emptyLink));}}
                      >
                      +
                    </button>
                  </div>
                </div>
              </Card>
              {!isValidLink && <p className='invalid-help-context'>You can't either Empty or Duplicate link name, or invalid URL</p>}
            </CardBody>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="info"
            disabled={!isChanged}
            onClick={() => {
              // * here the 'adminLinks' should be the total of 'googleLink' and 'adminLink'
              updateLink(personalLinks, [googleLink,...adminLinks]);
              closeModal();
            }}
          >
            Update
          </Button>
          <Button color="primary" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

EditLinkModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  updateLink: PropTypes.func.isRequired,
  userProfile: PropTypes.object.isRequired,
};

export default EditLinkModal;
