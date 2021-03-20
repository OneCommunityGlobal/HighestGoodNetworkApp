import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { fetchAllTasks } from '../../actions/task'
import ImportTask from '../Projects/WBS/WBSDetail/ImportTask/ImportTask'
import WbsTable from './WbsTable'
import TasksDetail from './TasksDetail'

class TasksTable extends Component{
  constructor(props) {
    super(props);
    this.props=props
    this.state = {
      tasks: {},
      tasks_per_project: {},
      tasks_filter: {}
    }
    this.setTasks=this.setTasks.bind(this)
    this.get_task_by_wbsId=this.get_task_by_wbsId.bind(this)


  }
  setTasks( get_tasks=[]) {
    this.setState((state) => {
      return {
        tasks_filter: get_tasks
      }
    });
  }



  async componentDidMount() {
    this.setState({
      tasks:{
        ...this.props.tasks
      },
      WbsTasksID:{
        ...this.props.WbsTasksID
      },

    })


  }
  get_task_by_wbsId(){
    var get_tasks=[]
    if ( Object.keys(this.props.WbsTasksID).length>0) {
      var i=0
      while( i< Object.keys(this.props.WbsTasksID).length) {
        if (this.props.tasks.fetched) {
          var result = this.props.tasks.taskItems.filter(task => task.wbsId == this.props.WbsTasksID[i]);
          i+=1
          if ( Object.keys(result).length<Object.keys(this.props.tasks.taskItems).length) {
            get_tasks.push(result)
          }
          else if(Object.keys(result).length==Object.keys(this.props.tasks.taskItems).length && i==Object.keys(this.props.WbsTasksID).length-1){
            get_tasks[0]=result
            break
          }
          else{
            break
          }
        }
      }
    }
    return get_tasks
  }






  render() {
    const {
      tasks,
      id_List,
      tasks_filter
    } = this.state
    const {
      taskItems
    } = tasks

    var get_tasks=this.get_task_by_wbsId()

    return(
      <tbody>
      <TasksDetail tasks_filter={get_tasks}/>
      </tbody>
    )
  }

}
const mapStateToProps = state => ({
  tasks: state.tasks,
  id_List:state.id_List,
  tasks_filter:state.tasks_filter
});


export default connect(mapStateToProps, {
  fetchAllTasks
})(TasksTable);
