import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { fetchAllTasks } from '../../actions/task'
import ImportTask from '../Projects/WBS/WBSDetail/ImportTask/ImportTask'

class TasksTable extends Component{
  constructor(props) {
    super(props);
    this.state = {
      tasks: {},
    }
  }


  async componentDidMount() {
    if (this.props.WbsTasksID.length>0) {
      for (var i = 0; i < this.props.WbsTasksID.length; i++) {
        this.props.fetchAllTasks(this.props.WbsTasksID[i]);
        console.log('yueru bere')
        console.log(this.props.fetchAllTasks(this.props.WbsTasksID[i]))
        this.setState({
          tasks: {
            ...this.props.tasks},
          isLoading: false,
        })
      }


    }

  }

  render() {
    // const {
    //   tasks
    // } = this.state
    // const {
    //   taskItems
    // } = tasks

    return(
      <div>

      </div>
    )
  }

}
const mapStateToProps = state => ({
  tasks: state.tasks,
});


export default connect(mapStateToProps, {
  fetchAllTasks
})(TasksTable);
