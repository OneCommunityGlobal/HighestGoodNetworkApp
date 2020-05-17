/*********************************************************************************
 * Component: MEMBERS  
 * Author: Henry Ng - 01/25/20
 * Display members of the project
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NavItem } from 'reactstrap'
import { connect } from 'react-redux'
import { fetchAllMembers, findUserProfiles } from './../../../actions/projectMembers'
import Member from './Member'
import FoundUser from './FoundUser'
import './members.css'

const Members = (props) => {
    const [init, setInit] = useState(false);
    let [keyword, setKeyword] = useState('');
    const projectId = props.match.params.projectId;

    /*if (!init) {
        props.fetchAllMembers(projectId);
        setInit(true);
    }*/

    useEffect(() => {
        props.fetchAllMembers(projectId);
    }, [projectId]);

    const pressEnter = (event, keyword) => {
        if (event.key === "Enter") {
            props.findUserProfiles(keyword);
        }
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

                    </div>
                </div>

                {props.state.projectMembers.foundUsers.length === 0 ? null :

                    < table className="table table-bordered table-responsive-sm">
                        <thead>
                            <tr>
                                <th scope="col" id="foundUsers__order">#</th>
                                <th scope="col" >Name</th>
                                <th scope="col" >Email</th>
                                <th scope="col" >Assign</th>
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
                            <th scope="col" id="members__name"></th>

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
export default connect(mapStateToProps, { fetchAllMembers, findUserProfiles })(Members)

