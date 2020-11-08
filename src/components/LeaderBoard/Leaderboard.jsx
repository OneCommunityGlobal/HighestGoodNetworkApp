import React, { Component, useEffect, useState } from 'react'
import './Leaderboard.css'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import { Table, Badge, Progress, Modal, ModalBody, ModalFooter, ModalHeader, Button } from 'reactstrap'
let scrolled = false;

const LeaderBoard = ({ getLeaderboardData, leaderBoardData, loggedInUser, organizationData }) => {
  useEffect(() => {
    getLeaderboardData(loggedInUser.userid);
  }, [leaderBoardData.length])

  useEffect(() => {
    try {
      if (window.screen.width < 540) {
        let scrollWindow = document.getElementById('leaderboard');
        if (scrollWindow) {
          let elem = document.getElementById('id' + loggedInUser.userid); //
          
          if (elem) {
            let topPos = elem.offsetTop;
            console.log(topPos);
            scrollWindow.scrollTo(0, (topPos - 100) < 100 ? 0 : (topPos - 100));
            
          }
        }
      }
    } catch {
      
    }

  }, [])

  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  return (
    <div>
      <h3>
        LeaderBoard&nbsp;&nbsp;
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click to refresh the leaderboard"
          style={{ fontSize: 24, cursor: 'pointer' }}
          aria-hidden="true"
          className="fa fa-refresh"
          onClick={() => {
            getLeaderboardData(loggedInUser.userid)
          }}
        ></i>
        &nbsp;&nbsp;
        <i
          data-toggle="tooltip"
          data-placement="right"
          title="Click for more information"
          style={{ fontSize: 24, cursor: 'pointer' }}
          aria-hidden="true"
          className="fa fa-info-circle"
          onClick={toggle}
        ></i>
      </h3>
      <span className="leaderboard">
      <Modal isOpen={isOpen} toggle={toggle}>
        <ModalHeader toggle={toggle}>Leaderboard Info</ModalHeader>
        <ModalBody>
         <p>This is the One Community Leaderboard! It is used to show how much tangible and total time you’ve contributed, whether or not you’ve achieved your total committed hours for the week, and (in the case of teams) where your completed hours for the week rank you compared to other team members. It can also be used to access key areas of this application.</p> 
<ul>
<li>The HGN Totals at the top shows how many volunteers are currently active in the system, how many volunteer hours they are collectively committed to, and how many tangible and total hours they have completed. The color and length of that bar changes based on what percentage of the total committed hours for the week have been completed: >10%: Red, 10-50%: Orange, 50-60% hrs: Green, 60-70%: Blue, 70-80%: Indigo, 80-100%: Violet, and More than 100%: Purple.</li>
<li>The red/green dot shows whether or not a person has completed their “tangible” hours commitment for the week. Green = yes (Great job!), Red = no. Clicking this dot will take you to a person’s tasks section on their/your dashboard. </li>
<li>The time bar shows how much tangible and total (tangible + intangible) time you’ve completed so far this week. In the case of teams, it also shows you where your completed hours for the week rank you compared to other people on your team. Clicking a person’s time bar will take you to the time log section on their/your dashboard. This bar also changes color based on how many tangible hours you have completed: >5 hrs: Red, 5-10 hrs: Orange, 10-20 hrs: Green, 20-30 hrs: Blue, 30-40 hrs: Indigo, 40-50 hrs: Violet, and 50+ hrs: Purple</li>
<li>Clicking a person’s name will lead to their/your profile page.</li>
</ul>
<p>Hovering over any of these areas will tell you how they function too. </p>

        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
      </span>
      <div id='leaderboard' className="my-custom-scrollbar table-wrapper-scroll-y">
      <Table className="leaderboard table-fixed">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>
              <span className="d-sm-none">Tan. Time</span>
              <span className="d-none d-sm-block">Tangible Time</span>
            </th>
            <th>Progress</th>
            <th>
              <span className="d-sm-none">Tot. Time</span>
              <span className="d-none d-sm-block">Total Time</span>
            </th>
          </tr>
        </thead>
        <tbody className="my-custome-scrollbar">
          <tr>
            <td>
              <div
                title={`Weekly Committed: ${organizationData.weeklyComittedHours} hours`}
                style={{
                  backgroundColor:
                    organizationData.totaltime >= organizationData.weeklyComittedHours
                      ? 'green'
                      : 'red',
                  width: 15,
                  height: 15,
                  borderRadius: 7.5,
                }}
              ></div>
            </td>
            <th scope="row">{organizationData.name}</th>
            <td>
              <span title="Tangible time">{organizationData.tangibletime}</span>
            </td>
            <td>
              <Progress
                title={`TangibleEffort: ${organizationData.tangibletime} hours`}
                value={organizationData.barprogress}
                color={organizationData.barcolor}
              />
            </td>
            <td>
              <span title="Tangible + Intangible time = Total time">{organizationData.totaltime} of {organizationData.weeklyComittedHours}</span>
            </td>
          </tr>
          {leaderBoardData.map((item, key) => (
            <tr key={key}>
              <td>
                <a href={'#tasksLink'}>
                  <div
                    title={`Weekly Committed: ${item.weeklyComittedHours} hours`}
                    style={{
                      backgroundColor: item.totaltime >= item.weeklyComittedHours ? 'green' : 'red',
                      width: 15,
                      height: 15,
                      borderRadius: 7.5,
                    }}
                  ></div>
                </a>
              </td>
              <th scope="row">
                <Link to={`/userprofile/${item.personId}`} title="View Profile">
                  {item.name}
                </Link>
              </th>
              <td id={'id' + item.personId}>
                  <span title="Tangible time">{item.tangibletime}</span>
              </td>
              <td>
                <Link
                  to={`/timelog/${item.personId}`}
                  title={`TangibleEffort: ${item.tangibletime} hours`}
                >
                  <Progress value={item.barprogress} color={item.barcolor} />
                </Link>
              </td>
              <td>
                <span title="Total time">{item.totaltime}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>
    </div>
  )
}

export default LeaderBoard
