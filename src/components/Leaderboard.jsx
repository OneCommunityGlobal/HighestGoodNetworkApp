import React, { Component } from "react";
import { getCurrentUser } from "../services/loginService";
import { getLeaderboardData } from "../services/dashBoardService";
import _ from "lodash";
import { Link } from "react-router-dom";
import Loading from './common/Loading'

class Leaderboard extends Component {
  state = {
    leaderboardData: [],
    maxtotal: 0,
    loggedinUser: {},
    isLoading : true
  };

  getcolor = effort => {
    let color = "purple";

    if (_.inRange(effort, 0, 5)) color = "red";
    if (_.inRange(effort, 5, 10)) color = "orange";
    if (_.inRange(effort, 10, 20)) color = "green";
    if (_.inRange(effort, 20, 30)) color = "blue";
    if (_.inRange(effort, 30, 40)) color = "indigo";
    if (_.inRange(effort, 40, 50)) color = "violet";

    return color;
  };

  async componentDidMount() {
    let loggedinUser = getCurrentUser().userid;
    let maxtotal = 0;

    let results = await getLeaderboardData(loggedinUser);
    let isLoading = false;
    let data = results.data;

    let leaderboardData = [];

    maxtotal = _.maxBy(data, "totaltime_hrs").totaltime_hrs;

    maxtotal = maxtotal === 0 ? 10 : maxtotal;

    //Sets the leaderboard array with Objects
     data.forEach(element => {
      leaderboardData.push({
        didMeetWeeklyCommitment:
          element.totaltangibletime_hrs >= element.weeklyComittedHours
            ? true
            : false,
        name: element.name,
        weeklycommited: _.round(element.weeklyComittedHours, 2),
        personId: element.personId,
        tangibletime: _.round(element.totaltangibletime_hrs, 2),
        intangibletime: _.round(element.totalintangibletime_hrs, 2),
        tangibletimewidth: _.round(
          (element.totaltangibletime_hrs * 100) / maxtotal,
          0
        ),
        intangibletimewidth: _.round(
          (element.totalintangibletime_hrs * 100) / maxtotal,
          0
        ),
        tangiblebarcolor: this.getcolor(element.totaltangibletime_hrs),
        totaltime: _.round(element.totaltime_hrs, 2)
      });
    });

    this.setState({ leaderboardData, maxtotal, loggedinUser, isLoading });
  }


  render() {
    let {isLoading}= this.state;
   
    let { leaderboardData, loggedinUser, maxtotal } = this.state;
    
      return (
      <div className="card hgn_leaderboard bg-dark">
        <div className="card-body text-white">
          <h5 className="card-title">LeaderBoard</h5>
          {isLoading && <Loading/>}
       
         { !isLoading && <div>
            <table className="table table-sm dashboardtable">
              <tbody>
                {leaderboardData.map(entry => {
                 return (
                  <tr
                    key={entry.personId}
                    className={
                      entry.personId === loggedinUser
                        ? "table-active row"
                        : "row"
                    }
                  >
                    <td className="col-1">
                      <i
                        className="fa fa-circle"
                        style={Object.assign({
                          color: (() =>
                            entry.didMeetWeeklyCommitment ? "green" : "red")()
                        })}
                        data-toggle="tooltip"
                        data-placement="left"
                        title={`Weekly Committed: ${
                          entry.weeklycommited
                        } hours\nTangibleEffort: ${entry.tangibletime} hours `}
                      />
                    </td>
                    <td className="text-left col-3">
                      <Link to={`/userprofile/${entry.personId}`}>
                        {entry.name}
                      </Link>
                    </td>
                    <td className="text-right text-justify text-nowrap col-2">
                      {entry.tangibletime} tan
                    </td>
                    <td className="col-4 text-center">
                      <Link to={`/timelog/${entry.personId}`}>
                        <div className="progress progress-leaderboard">
                          <div
                            className="progress-bar progress-bar-striped"
                            role="progressbar"
                            style={Object.assign({
                              width: entry.tangibletimewidth + "%",
                              backgroundColor: entry.tangiblebarcolor
                            })}
                            aria-valuenow={entry.tangibletime}
                            aria-valuemin="0 "
                            aria-valuemax={maxtotal}
                            data-toggle="tooltip"
                            data-placement="bottom"
                            title={`Tangible Effort: ${
                              entry.tangibletime
                            } hours`}
                          />
                          <div
                            className="progress-bar progress-bar-striped bg-info"
                            role="progressbar"
                            style={{ width: entry.intangibletimewidth }}
                            aria-valuenow={entry.intangibletime}
                            aria-valuemin="0"
                            aria-valuemax={maxtotal}
                            data-toggle="tooltip"
                            data-placement="bottom"
                            title={`Intangible Effort: ${
                              entry.intangibletime
                            } hours`}
                          />
                        </div>
                      </Link>
                    </td>
                    <td className="text-right text-justify text-nowrap col-2">
                      {entry.totaltime} tot
                    </td>
                  </tr>
                  ) }
                )}
              </tbody>
            </table>
          </div>}
        </div>
      </div>
    );
  }
}

export default Leaderboard;
