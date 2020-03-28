/*********************************************************************************
 * Component: TAKS 
 * Author: Henry Ng - 21/03/20
 ********************************************************************************/
import React from 'react'
import { connect } from 'react-redux'
import { assignProject } from './../../../../actions/projectMembers'
import './wbs.css';

const WBSTasks = (props) => {


  return (
    <React.Fragment>

      <div className='container' >

        <table class="table table-bordered">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Task</th>
              <th scope="col">Priority</th>
              <th scope="col">Resources</th>
              <th scope="col" data-toggle="tooltip" data-placement="top" title="Tooltip on top" ><i class="fa fa-user-circle-o" aria-hidden="true"></i></th>
              <th scope="col"><i class="fa fa-tasks" aria-hidden="true"></i></th>
              <th scope="col"><i class="fa fa-hourglass-start" aria-hidden="true"></i></th>
              <th scope="col"><i class="fa fa-hourglass" aria-hidden="true"></i></th>
              <th scope="col"><i class="fa fa-hourglass-half" aria-hidden="true"></i></th>
              <th scope="col"><i class="fa fa-clock-o" aria-hidden="true"></i></th>
              <th scope="col"><i class="fa fa-calendar-check-o" aria-hidden="true"></i> Start</th>
              <th scope="col"><i class="fa fa-calendar-times-o" aria-hidden="true"></i> End</th>
              <th scope="col"><i class="fa fa-link" aria-hidden="true"></i></th>


            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td><div className='level-space-1'><i class="fa fa-caret-down" aria-hidden="true"></i> General Capabilities</div></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>

            </tr>

            <tr>
              <th scope="row">1.1</th>
              <td><div className='level-space-2'>Create log-in functionality to control and protect access</div></td>
              <td>Primary</td>
              <td>Programmer</td>
              <td>No</td>
              <td><i class="fa fa-pause" aria-hidden="true"></i></td>
              <td>20</td>
              <td>40</td>
              <td>30</td>
              <td>60</td>
              <td>12/20/19</td>
              <td>12/29/19</td>
              <td></td>

            </tr>


            <tr>
              <th scope="row">1.1.1</th>
              <td><div className='level-space-3'>Make login lead to the volunteer landing page</div></td>
              <td>Primary</td>
              <td>Programmer</td>
              <td>Yes</td>
              <td><i class="fa fa-play" aria-hidden="true"></i></td>
              <td>20</td>
              <td>40</td>
              <td>30</td>
              <td>60</td>
              <td>12/20/19</td>
              <td>12/29/19</td>
              <td></td>
            </tr>

            <tr>
              <th scope="row">1.1.2</th>
              <td><div className='level-space-3'>Make login page embeddable on our website</div></td>
              <td>Primary</td>
              <td>Programmer</td>
              <td>Yes</td>
              <td><i class="fa fa-play" aria-hidden="true"></i></td>
              <td>20</td>
              <td>40</td>
              <td>30</td>
              <td>60</td>
              <td>12/20/19</td>
              <td>12/29/19</td>
              <td></td>
            </tr>

            <tr>
              <th scope="row">2</th>
              <td><div className='level-space-1'><i class="fa fa-caret-down" aria-hidden="true"></i> Manager Level Capabilities</div></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>

            </tr>

            <tr>
              <th scope="row">2.1</th>
              <td><div className='level-space-2'>Team Management Dashboard</div></td>
              <td>Primary</td>
              <td>Programmer</td>
              <td>No</td>
              <td><i class="fa fa-pause" aria-hidden="true"></i></td>
              <td>20</td>
              <td>40</td>
              <td>30</td>
              <td>60</td>
              <td>12/20/19</td>
              <td>12/29/19</td>
              <td></td>

            </tr>


            <tr>
              <th scope="row">2.1.1</th>
              <td><div className='level-space-3'>Team Member Tasks</div></td>
              <td>Primary</td>
              <td>Programmer</td>
              <td>Yes</td>
              <td><i class="fa fa-play" aria-hidden="true"></i></td>
              <td>20</td>
              <td>40</td>
              <td>30</td>
              <td>60</td>
              <td>12/20/19</td>
              <td>12/29/19</td>
              <td></td>
            </tr>

            <tr>
              <th scope="row">2.1.2</th>
              <td><div className='level-space-3'>Make login page embeddable on our website</div></td>
              <td>Primary</td>
              <td>Programmer</td>
              <td>Yes</td>
              <td><i class="fa fa-play" aria-hidden="true"></i></td>
              <td>20</td>
              <td>40</td>
              <td>30</td>
              <td>60</td>
              <td>12/20/19</td>
              <td>12/29/19</td>
              <td></td>
            </tr>

          </tbody>
        </table>

      </div>


    </React.Fragment>
  )
}

export default connect(null, { assignProject })(WBSTasks)

