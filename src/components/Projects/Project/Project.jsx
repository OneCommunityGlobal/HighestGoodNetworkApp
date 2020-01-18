import React, { Component } from 'react'
import './../projects.css'

class Project extends Component {

  constructor(props){
    super(props);
    this.state = {
      name: '',
      active: false
    }
  }

  componentDidMount() {

    this.setState({ 
      name: this.props.name,
      active: this.props.active    
    });
  }

  onChangeName(value){
    this.setState({
         name: value
    });
  }

  onClickActive(active){
    this.props.onClickActive(active);
    this.setState({
      active: !(active)
    })
  }

  onClickDelete(projectId,active){
    this.props.onClickDelete(active);
    var v = document.getElementById(`tr_${projectId}`); 
    v.className += " isDisabled"; 
  }

  render() {
  var {name, active} = this.state;
  var {projectId, index} = this.props;

   return (
            <tr className="projects__tr" id={"tr_"+projectId}>
              <th className='projects__order--input' scope="row"><div>{index+1}</div></th>
              <td className='projects__name--input'><input type="text" className="form-control" value={name} onChange={e => this.onChangeName(e.target.value)}/></td>
              <td className='projects__active--input' onClick={() => this.onClickActive(active)}>
                {active ? <div className="isActive"><i className="fa fa-circle" aria-hidden="true"></i></div>: 
                <div className="isNotActive"><i className="fa fa-circle-o" aria-hidden="true"></i></div>}
                </td>
              <td><button type="button" className="btn btn-outline-info"><i className="fa fa-users" aria-hidden="true"></i></button></td>
              <td><button type="button" className="btn btn-outline-info"><i className="fa fa-tasks" aria-hidden="true"></i></button></td>
              <td><button type="button" className="btn btn-outline-danger" onClick={(e) => this.onClickDelete(projectId,active)}>Delete</button></td>
            </tr>
    )
  }
}

export default Project;

