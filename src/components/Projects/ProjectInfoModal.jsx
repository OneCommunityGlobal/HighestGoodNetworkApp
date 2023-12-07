// import React from 'react';
// import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';
// import { boxStyle } from 'styles';

// const ProjectInfoModal = ({ isOpen, toggle }) => (
//   <div>
//     <Modal isOpen={isOpen} toggle={toggle}>
//       <ModalHeader toggle={toggle}>HOW TO IMPORT A NEW WORK BREAKDOWN STRUCTURE (WBS)</ModalHeader>
//       <ModalBody>
//         <ol type="1" className="project_info_modal_ol">
//           <li>As an Admin, go to Other Links → Projects </li>
//           <li>
//             Choose the Project you want to import the WBS to and click on the WBS Icon for that
//             Project
//           </li>
//           <li>
//             In the “Add new WBS” field, type the name of the WBS you are importing and hit the “+”
//             to add it
//           </li>
//           <li>
//             Click the new WBS name that will now appear under that project to visit it’s empty WBS
//           </li>
//           <li>
//             Click “Import Tasks” and read the “Import Tasks” warning. Check your Google Sheet to
//             confirm:
//             <ol type="a" className="project_info_modal_ol">
//               <li>All numbers (for the tasks) are sequential</li>
//               <li>No dots/periods at the end of numbers, double periods in numbers, etc.</li>
//               <li>
//                 Export tab to its own file, otherwise the app will try and import the first tab of
//                 your spreadsheet
//               </li>
//               <li>Download as an Excel file</li>
//             </ol>
//           </li>
//           <li>Click “Choose File” and choose your newly created Excel File</li>
//           <li>
//             On the popup that happens next, double check the Rows listed match the rows being
//             imported.
//             <ol type="a" className="project_info_modal_ol">
//               <li>If they do, click “Upload” and you are done! </li>
//               <li>
//                 If they don’t, go back and double check all numbers are sequential, no additional
//                 periods exist, etc. for numbering the tasks and that your file column structure and
//                 other details perfectly matches the source template. Fix errors and try again.{' '}
//               </li>
//             </ol>
//           </li>
//         </ol>
//       </ModalBody>
//       <ModalFooter>
//         <Button onClick={toggle} color="secondary" className="float-left" style={boxStyle}>
//           {' '}
//           Ok{' '}
//         </Button>
//       </ModalFooter>
//     </Modal>
//   </div>
// );

// export default ProjectInfoModal;
