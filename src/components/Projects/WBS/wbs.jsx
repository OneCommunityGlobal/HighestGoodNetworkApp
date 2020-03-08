/*********************************************************************************
 * Component: WBS  
 * Author: Henry Ng - 03/05/20
 * Display WBSs of project
 ********************************************************************************/
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { NavItem } from 'reactstrap'
import WBSItem from './WBSItem/WBSItem'

const wbs = (props) => {


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
              <th scope="col" id="members__name">Name</th>
              <th scope="col" id="members__name"></th>
            </tr>
          </thead>
          <tbody>

            <WBSItem index='1' key='1' projectId={props.projectId} name='This is the WBS for A Team' />
            <WBSItem index='2' key='1' projectId={props.projectId} name='This is the WBS for B Team' />
            <WBSItem index='3' key='1' projectId={props.projectId} name='This is the WBS for C Team' />
            <WBSItem index='4' key='1' projectId={props.projectId} name='This is the WBS for D Team' />
            <WBSItem index='5' key='1' projectId={props.projectId} name='This is the WBS for E Team' />
            <WBSItem index='6' key='1' projectId={props.projectId} name='This is the WBS for F Team' />
            <WBSItem index='7' key='1' projectId={props.projectId} name='This is the WBS for G Team' />
            <WBSItem index='88' key='1' projectId={props.projectId} name='This is the WBS for H Team' />
          </tbody>
        </table>
      </div>
    </React.Fragment >
  )
}

export default wbs

