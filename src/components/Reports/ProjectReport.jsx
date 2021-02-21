import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { getProjectDetail} from '../../actions/project';


class ProjectReport extends Component{
  constructor(props) {
    super(props);
    this.state = {
      project: {},
      projectId:'',
      isLoading: false
    }
  }


  async componentDidMount() {
    if (this.props.match) {
      this.props.getProjectDetail(this.props.match.params.projectId)
      this.setState({
        project: {
          ...this.props.project},
        projectId: this.props.match.params.projectId,
        isLoading: false,
      })
    }
  }

  render() {
    const {
      project
    } = this.state
    const {
      isActive,
      _id,
      projectName,
    } = project

    return(
      <div>
        <DropdownButton id="dropdown-basic-button" title="Time Frame">
          <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
          <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
          <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
          <Dropdown.Item href="#/action-6">Custom range</Dropdown.Item>
        </DropdownButton>

        <h2>Project Name:{projectName}</h2>
        <h2>Project ID:{_id}</h2>
        <h5>Active:{String(isActive)}</h5>
      </div>
    )
  }

}
const mapStateToProps = state => ({
  project: state.project,
});

export default connect(mapStateToProps, {
  getProjectDetail
})(ProjectReport);
