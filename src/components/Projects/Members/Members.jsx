/*********************************************************************************
 * Component: MEMBERS  
 * Author: Henry Ng - 01/25/20
 * Display members of the project
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NavItem } from 'reactstrap'
import { connect } from 'react-redux'
import { fetchAllMembers } from './../../../actions/projectMembers'
import Member from './Member'
import './members.css'

const Members = (props) => {
    const [init, setInit] = useState(false);
    const projectId = props.match.params.projectId;

    if (!init) {
        props.fetchAllMembers(projectId);
        setInit(true);
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
                            <Member index={i} key={member._id} fullName={member.firstName + " " + member.lastName} />)}
                    </tbody>
                </table>
            </div>

        </React.Fragment>
    )
}


const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { fetchAllMembers })(Members)

