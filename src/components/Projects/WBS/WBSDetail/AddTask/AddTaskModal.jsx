import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux'
import ReactTooltip from 'react-tooltip'
import { fetchAllMembers } from './../../../../../actions/projectMembers'

const AddTaskModal = (props) => {
  const tasks = props.tasks.taskItems;
  const { members } = props.projectMembers;
  let foundedMembers = [];

  // modal
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  // all posible cases 
  let newNums = [{ 'p': '', 'n': '0' }];

  // above new tasks
  const [above, setAbove] = useState([]);

  // members name
  const [memberName, setMemberName] = useState(null);

  // resources 
  const [resources] = useState([]);

  // links
  const [links] = useState([]);


  // list of num
  const nums = [];
  const taskNames = [];
  tasks.forEach(task => {
    nums.push(task.num);
    taskNames.push(task.taskName);
  });


  // all posible cases 
  if (tasks.length > 0) {
    newNums = [];

    nums.forEach((num, i) => {
      let numArr = num.split('.');
      let end = numArr[numArr.length - 1];
      let before = '';
      for (let i = 0; i < numArr.length - 1; i++) {
        before += numArr[i] + '.';
      }
      // sibling
      let newNum = before + (parseInt(end) + 1);
      if (!nums.includes(newNum)) {
        newNums.push({ 'p': taskNames[i], 'n': newNum });
      }
      // child
      if (numArr.length < 4) {
        newNum = num + '.1';
        if (!nums.includes(newNum)) {
          newNums.push({ 'p': taskNames[i], 'n': newNum });
        }
      }
    });

    newNums.sort((a, b) => a['n'].split('.')[0] - b['n'].split('.')[0]);
  } else {
    newNums.push({ 'p': '', 'n': '0' })
  }

  const changeAbove = (index) => {
    setAbove(newNums[index]['p']);
    props.fetchAllMembers(props.projectId);
  }


  const [foundMembersHTML, setfoundMembersHTML] = useState('');
  const findMembers = () => {
    foundedMembers = members.filter(user => (user.firstName + " " + user.lastName).toLowerCase().includes(memberName.toLowerCase()));
    const html = foundedMembers.map(elm =>
      <div>
        <input
          type="text"
          className='task-resouces-input'
          value={elm.firstName + ' ' + elm.lastName}
          disabled />
        <button
          data-tip="Add this member"
          className="task-resouces-btn"
          type="button"
          onClick={() => addResources(elm._id, elm.firstName, elm.lastName)}
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
        </button>
      </div>
    );
    setfoundMembersHTML(html);
  }

  // Add Resources
  const [resourcesHTML, setResourcesHTML] = useState('');
  const addResources = (id, first, last) => {
    resources.push({
      id,
      first,
      last
    });

    const html = resources.map(elm =>
      <a data-tip={elm.first}
        href={`/userprofile/${elm.id}`} target='_blank'><span className="dot">{elm.first.substring(0, 2)}</span>
      </a>);
    setResourcesHTML(html);

  }


  // Links
  const [link, setLink] = useState('');
  const [linksHTML, setLinksHTML] = useState('');
  const addLink = () => {
    links.push(link);

    const html = links.map(link =>
      <div><a href={link} target='_blank'>{link.replace('http://', '')}</a></div>);
    setLinksHTML(html);
  }






  useEffect(() => {
    setAbove(newNums[0]['p']);
  }, [tasks]);


  return (
    <div>
      <Button color="primary" onClick={toggle}>Add Task</Button>
      <div>
        <br />
      </div>
      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>Add New Task</ModalHeader>
        <ModalBody>
          <ReactTooltip />

          <table className="table table-bordered">
            <tbody>
              <tr>
                <td scope="col" data-tip="WBS ID">
                  <div></div><br /><br />
                  WBS #
                  </td>
                <td scope="col" >
                  <div className='above'><i>{above}</i></div>
                  <div><i class="fa fa-arrows-v" aria-hidden="true"></i></div>
                  <select id="nums" onChange={(e) => changeAbove(e.target.value)}>
                    {newNums.map((num, i) => <option value={i}>{num['n']}</option>)}
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" >Task Name</td>
                <td scope="col" >
                  <input
                    type="text"
                    className='task-name' />
                </td>
              </tr>
              <tr>
                <td scope="col" >Priority</td>
                <td scope="col" >
                  <select id="priority">
                    <option value='Primary'>Primary</option>
                    <option value='Secondary'>Secondary</option>
                    <option value='Tertiary'>Tertiary</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" >Resources</td>
                <td scope="col" >
                  <div>
                    <input type="text"
                      aria-label="Search user"
                      placeholder="Name"
                      className='task-resouces-input'
                      data-tip="Input a name"
                      onChange={(e) => setMemberName(e.target.value)}
                      onKeyPress={(e) => setMemberName(e.target.value)}
                    />
                    <button
                      className="task-resouces-btn"
                      type="button"
                      data-tip="Find members"
                      onClick={findMembers}
                    >
                      <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className='task-reousces-list'>
                    <div>
                      {foundMembersHTML}
                    </div>
                  </div>
                  <div className='task-reousces-list'>

                    {resourcesHTML}
                  </div>
                </td>
              </tr>
              <tr>
                <td scope="col" >Assigned</td>
                <td scope="col" >
                  <select id="Assigned">
                    <option value='Yes'>Yes</option>
                    <option value='No'>No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" >Status</td>
                <td scope="col" >
                  <select id="Status">
                    <option value='Started'>Started</option>
                    <option value='Secondary'>Not Started</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Best">Hours-Best</td>
                <td scope="col" data-tip="Hours-Best">
                  <input type='number' min='0' />
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Worst">Hours-Worst</td>
                <td scope="col" data-tip="Hours-Worst">
                  <input type='number' min='0' />
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Hours-Most">Hours-Most</td>
                <td scope="col" data-tip="Hours-Most">
                  <input type='number' min='0' />
                </td>
              </tr>
              <tr>
                <td scope="col" data-tip="Estimated Hours">Estimated Hours</td>
                <td scope="col" data-tip="Estimated Hours">
                  <input type='number' min='0' />
                </td>
              </tr>
              <tr>
                <td scope="col" >Start Date</td>
                <td scope="col" >
                  <input type='text' />
                </td>
              </tr>
              <tr>
                <td scope="col" >End Date</td>
                <td scope="col" >
                  <input type='text' />
                </td>
              </tr>
              <tr>
                <td scope="col" >Links</td>
                <td scope="col" >
                  <div>
                    <input type="text"
                      aria-label="Search user"
                      placeholder="Link"
                      className='task-resouces-input'
                      data-tip="Add a link"
                      onChange={(e) => setLink(e.target.value)}
                    />
                    <button
                      className="task-resouces-btn"
                      type="button"
                      data-tip="Add Link"
                      onClick={addLink}
                    >
                      <i className="fa fa-plus" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div>
                    {linksHTML}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>


        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle}>Save</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Modal >
    </div >
  );
}

const mapStateToProps = state => { return state }
export default connect(mapStateToProps, {
  fetchAllMembers
})(AddTaskModal);