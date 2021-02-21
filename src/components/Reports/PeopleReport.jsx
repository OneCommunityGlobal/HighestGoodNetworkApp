import React , { Component }from 'react';
import '../Teams/Team.css';
import { Dropdown, DropdownButton } from "react-bootstrap";
import { connect } from 'react-redux'
import { getUserProfile} from '../../actions/userProfile';
import _ from 'lodash'
import { getWeeklySummaries, updateWeeklySummaries } from '../../actions/weeklySummaries'
import moment from 'moment'


class PeopleReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userProfile: {},
      userId: '',
      isLoading: true,
      infringments:{}
    }
  }


  async componentDidMount() {
    if (this.props.match) {
      const { userId } = this.props.match.params.userId
       this.props.getUserProfile(this.props.match.params.userId)
       this.props.getWeeklySummaries(this.props.match.params.userId);

      this.setState({
          userId: this.props.match.params.userId,
          isLoading: false,
          userProfile: {
            ...this.props.userProfile,
            privacySettings: {
              email: true,
              phoneNumber: true,
              blueSquares: true,
            },
          },
        infringments : this.props.userProfile.infringments
        }
      )
    }
  }

  render() {
    const {
      userProfile,
      infringments,
    } = this.state
    const {
      firstName,
      lastName,
      weeklyComittedHours,
      totalComittedHours
    } = userProfile

    const Infringments = props => {
      let BlueSquare = []
      if (props.infringments.length > 0) {
        BlueSquare = props.infringments.map((current, index) => (
            <div >
              <div>{current.date} {current.description}</div>
            </div>
        ))}
      return (
        <div>
          <h1>Blue Square</h1>
          <h1>Total: {props.infringments.length}</h1>
        { BlueSquare }
        </div>
      )
    }
    const StartDate = (props) => {
        return (
          <h2>Start Date:{moment(props.userProfile.createdDate).format('YYYY-MM-DD')}</h2>
    )
    };

      return (
        <table>
          <DropdownButton id="dropdown-basic-button" title="Time Frame">
            <Dropdown.Item href="#/action-1">Past Week</Dropdown.Item>
            <Dropdown.Item href="#/action-2">Past Two Weeks</Dropdown.Item>
            <Dropdown.Item href="#/action-3">Past Month</Dropdown.Item>
            <Dropdown.Item href="#/action-4">Past 6 Months</Dropdown.Item>
            <Dropdown.Item href="#/action-5">Past Year</Dropdown.Item>
            <Dropdown.Item href="#/action-6">Custom range</Dropdown.Item>
          </DropdownButton>
          <div>
            <h1
              style={{ display: 'inline-block', marginRight: 10 }}
            >Name: {`${firstName} ${lastName}`}</h1>
            <h2>Weekly Comitted Hours:{weeklyComittedHours}</h2>
            <h2>Total Comitted Hours:{totalComittedHours}</h2>
            <StartDate userProfile={userProfile}/>
            <Infringments infringments={infringments}/>
          </div>
        </table>
      )
    }
}


const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  infringments: state.userProfile.infringments,
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
});

export default connect(mapStateToProps, {
  getUserProfile,
  getWeeklySummaries,
  updateWeeklySummaries,
})(PeopleReport);
