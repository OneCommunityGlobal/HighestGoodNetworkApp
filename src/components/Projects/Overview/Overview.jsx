import React, { Component } from 'react'

class Overview extends Component {

  render() {
  
   return (

    <div className="projects__overview--top">
        <div className="card" id="card_project">
            <div className="card-body">
                <h4 className="card-title">{this.props.numberOfProjects}</h4>
                <h6 className="card-subtitle">
                <i className="fa fa-folder" aria-hidden="true"></i> Projects
                </h6>
            </div>
        </div>

        <div className="card" id="card_active">
            <div className="card-body">
                <h4 className="card-title">{this.props.numberOfActive}</h4>
                <h6 className="card-subtitle" >
                <div className="isActive">
                    <i className="fa fa-circle" aria-hidden="true"></i> Active Projects
                </div>
                </h6>
            </div>
        </div>

    </div>
    )
  }
}

export default Overview;

