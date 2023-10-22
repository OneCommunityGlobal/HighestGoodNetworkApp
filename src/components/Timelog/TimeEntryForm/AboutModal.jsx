import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

/**
 * Modal displaying information about how time entry works
 * @param {*} props
 * @param {Boolean} props.visible
 * @param {Func} props.setVisible
 */
function AboutModal(props) {
  return (
    <Modal isOpen={props.visible}>
      <ModalHeader>Info</ModalHeader>
      <ModalBody>
        <p>
          This is the One Community time clock! It is used to clock in and out when doing your
          volunteer work with One Community. Whenever you stop this timer, it will ask you to log
          your time to a “Project/Task” list that is specific to you.
        </p>
        <p>
          Because you log time to specific tasks, it is important that you start the timer when you
          start work on a task and stop it when you finish work on that task. If working on multiple
          tasks, you should log your time (stop the timer) when completing each task for the day and
          clock in separately (start a new timer) when starting your other task.
        </p>
        <p>
          * What About Breaks: If taking a break, you can pause the timer by closing it or clicking
          the “pause” button.
        </p>
        <p>
          * Timer Must Remain Open: The timer must remain open while you work. Closing the window,
          power outages, etc. will pause the timer.
        </p>
        <p>
          * Log Your Time Daily: You must log your time daily. The timer will automatically stop and
          request you log your time if left running for more than 10 hours.
        </p>
        <p>
          * Editing Your Time: Your time can be edited same-day if you make a mistake using it, but
          repeated edits will result in blue squares being issued. So please use the timer
          correctly.
        </p>
        <p>
          * Project/Task: Your Project or Task list includes the project(s) and/or task(s) you’ve
          been assigned to work on. Please log your time only to the correct task.
        </p>
        <p>
          * Notes: The “Notes” section is where you write a summary of what you did during the time
          you are about to log. You must write a minimum of 10 words because we want you to be
          specific. You must include a link to your work so others can easily confirm and review it.
        </p>
        <p>
          * Tangible Time: By default, the “Tangible” box is clicked. Tangible time is any time
          spent working on your Projects/Tasks and counts towards your committed time for the week
          and also the time allocated for your task.
        </p>
        <p>
          * Intangible Time: Clicking the Tangible box OFF will mean you are logging “Intangible
          Time.” This is for time not related to your tasks OR for time you need a manager to change
          to “Tangible” for you because you were working away from your computer or made a mistake
          and are trying to manually log time. Intangible time will not be counted towards your
          committed time for the week or your tasks. “Intangible” time changed by a manager to
          “Tangible” time WILL be counted towards your committed time for the week and whatever task
          it is logged towards. For Blue Square purposes, changing Intangible Time to Tangible Time
          for any reason other than work away from your computer will count and be recorded in the
          system the same as a time edit.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => props.setVisible(false)} color="primary">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default AboutModal;
