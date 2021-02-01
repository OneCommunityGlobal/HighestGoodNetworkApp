/*********************************************************************************
 * Component: MEMBERS
 * Author: Henry Ng - 01/25/20
 * Display members of the project
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NavItem } from 'reactstrap'
import { connect } from 'react-redux'
import { fetchAllMembers, findUserProfiles, getAllUserProfiles, assignProject } from './../../../actions/projectMembers'
import Member from './Member'
import FoundUser from './FoundUser'
import { UserRole } from "./../../../utils/enums"
import './members.css'

const Members = (props) => {
  const [role] = useState(props.state ? props.state.auth.user.role : null);
  let [keyword, setKeyword] = useState('');
  const projectId = props.match.params.projectId;


  useEffect(() => {
    props.fetchAllMembers(projectId);
  }, [projectId]);

  const pressEnter = (event, keyword) => {
    if (event.key === "Enter") {
      props.findUserProfiles(keyword);
    }
  }

  const assignAll = () => {
    const allUsers = props.state.projectMembers.foundUsers.filter(user => user.assigned === false);
    allUsers.forEach(user => {
      props.assignProject(projectId, user._id, "Assign", user.firstName, user.lastName);
    });
  }


  return (
    <React.Fragment>
      <div className='container'>

        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <NavItem tag={Link} to={`/projects/`}>
              <button type="button" className="btn btn-secondary" >
                <i className="fa fa-chevron-circle-left" aria-hidden="true"></i>
              </button>
            </NavItem>

            <div id="member_project__name">
              PROJECTS {props.projectId}
            </div>

          </ol>
        </nav>
        {role === UserRole.Administrator ? (
          <div className="input-group" id="new_project">
            <div className="input-group-prepend">
              <span className="input-group-text" >Find user</span>
            </div>

            <input type="text" className="form-control" aria-label="Search user" placeholder="Name"
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => pressEnter(e, keyword)}
            />
            <div className="input-group-append">
              <button className="btn btn-outline-primary" type="button"
                onClick={(e) => props.findUserProfiles(keyword)}>
                <i className="fa fa-search" aria-hidden="true"></i>
              </button>
              <button className="btn btn-outline-primary" type="button"
                onClick={(e) => props.getAllUserProfiles()}>
                All
                        </button>

            </div>
          </div>) : null}

        {props.state.projectMembers.foundUsers.length === 0 ? null :

          < table className="table table-bordered table-responsive-sm">
            <thead>
              <tr>
                <th scope="col" id="foundUsers__order">#</th>
                <th scope="col" >Name</th>
                <th scope="col" >Email</th>
                {role === UserRole.Administrator ? (
                  <th scope="col" >Assign
                    <button className="btn btn-outline-primary" type="button" onClick={() => assignAll()}>
                      +All
                                </button>
                  </th>) : null}


              </tr>
            </thead>
            <tbody>
              {
                props.state.projectMembers.foundUsers.map((user, i) =>
                  <FoundUser index={i} key={user._id}
                    projectId={projectId}
                    uid={user._id}
                    email={user.email}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    assigned={user.assigned}
                  />)}


            </tbody>
          </table>
        }


        <table className="table table-bordered table-responsive-sm">
          <thead>
            <tr>
              <th scope="col" id="members__order">#</th>
              <th scope="col" id="members__name"></th>
              {role === UserRole.Administrator ? (
                <th scope="col" id="members__name"></th>) : null}

            </tr>
          </thead>
          <tbody>
            {props.state.projectMembers.members.map((member, i) =>
              <Member index={i} key={member._id}
                projectId={projectId}
                uid={member._id}
                fullName={member.firstName + " " + member.lastName} />)}
          </tbody>
        </table>
      </div>

    </React.Fragment >
  )
}


const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { fetchAllMembers, findUserProfiles, getAllUserProfiles, assignProject })(Members)

