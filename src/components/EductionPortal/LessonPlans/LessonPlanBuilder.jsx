/* eslint-disable no-console */
// /* eslint-disable prettier/prettier */
// // // import { useState } from 'react';
// // // import styles from './LessonPlanBuilder.module.css';
// // // import AssignLessonPlanModal from './AssignLessonPlanModal';

// // // export default function LessonPlanBuilder() {
// // //   const [showModal, setShowModal] = useState(false);

// // //   const handleAssignClick = () => setShowModal(true);

// // //   return (
// // //     <div className={styles.container}>
// // //       <div className={styles.header}>
// // //         <h2>Lesson Plan Builder</h2>
// // //         <button className={styles.saveBtn}>Save Lesson Plan</button>
// // //       </div>

// // //       {/* Example top row */}
// // //       <div className={styles.actions}>
// // //         <select>
// // //           <option>Add Row</option>
// // //         </select>
// // //         <select>
// // //           <option>Import from Template</option>
// // //         </select>
// // //       </div>

// // //       {/* Table Placeholder */}
// // //       <table className={styles.table}>
// // //         <thead>
// // //           <tr>
// // //             <th>Assignment</th>
// // //             <th>Type</th>
// // //             <th>Due Date</th>
// // //             <th>Pass Mark</th>
// // //             <th>Weight</th>
// // //             <th>Assign</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {/* Example row */}
// // //           <tr>
// // //             <td>Assignment 1</td>
// // //             <td>
// // //               <select>
// // //                 <option>Read-only</option>
// // //                 <option>Write-only</option>
// // //                 <option>Offline-entry</option>
// // //               </select>
// // //             </td>
// // //             <td>
// // //               <input type="date" />
// // //             </td>
// // //             <td>
// // //               <input type="text" placeholder="6/10" />
// // //             </td>
// // //             <td>
// // //               <input type="number" placeholder="%" />
// // //             </td>
// // //             <td>
// // //               <button>Duplicate</button>
// // //               <button>Delete</button>
// // //             </td>
// // //           </tr>
// // //         </tbody>
// // //       </table>

// // //       {/* Total Row */}
// // //       <div className={styles.total}>
// // //         <span>Total Weight: 100%</span>
// // //       </div>

// // //       <div className={styles.footer}>
// // //         <button className={styles.addSubtaskBtn}>+ Add Subtask</button>
// // //         <button className={styles.assignBtn} onClick={handleAssignClick}>
// // //           Assign Lesson Plan
// // //         </button>
// // //       </div>

// // //       {/* Modal */}
// // //       {showModal && <AssignLessonPlanModal onClose={() => setShowModal(false)} />}
// // //     </div>
// // //   );
// // // }

// // // decent
// // import { useState } from 'react';

// // export default function LessonPlanBuilder() {
// //   const [subtasks, setSubtasks] = useState([
// //     {
// //       name: 'Subtask 1: Research summary',
// //       type: 'Write-only',
// //       dueDate: '',
// //       passMark: '8/10',
// //       weight: '40%',
// //     },
// //     {
// //       name: 'Subtask 2: Terminology',
// //       type: 'Read-only',
// //       dueDate: '',
// //       passMark: '6/10',
// //       weight: '30%',
// //     },
// //     { name: 'Subtask 3:', type: 'Offline entry', dueDate: '', passMark: '6/10', weight: '30%' },
// //   ]);

// //   const addSubtask = () => {
// //     setSubtasks([
// //       ...subtasks,
// //       { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '' },
// //     ]);
// //   };

// //   const updateSubtask = (index, field, value) => {
// //     const newSubtasks = [...subtasks];
// //     newSubtasks[index][field] = value;
// //     setSubtasks(newSubtasks);
// //   };

// //   const deleteSubtask = index => {
// //     setSubtasks(subtasks.filter((_, i) => i !== index));
// //   };

// //   const duplicateSubtask = index => {
// //     setSubtasks([...subtasks, { ...subtasks[index] }]);
// //   };

// //   return (
// //     <div className="p-6">
// //       {/* Header */}
// //       <div className="flex justify-between items-center mb-6">
// //         <button className="px-3 py-2 border rounded">&larr; Previous</button>
// //         <h1 className="text-2xl font-bold">Lesson Plan Builder</h1>
// //         <button className="px-4 py-2 bg-blue-600 text-white rounded">Save lesson plan</button>
// //       </div>

// //       {/* Controls */}
// //       <div className="flex gap-2 mb-4">
// //         <button className="px-3 py-2 border rounded">Add row</button>
// //         <select className="px-3 py-2 border rounded">
// //           <option>Import from template</option>
// //           <option>Template 1</option>
// //           <option>Template 2</option>
// //         </select>
// //       </div>

// //       {/* Table */}
// //       <div className="border rounded shadow-md overflow-hidden">
// //         <table className="w-full border-collapse">
// //           <thead>
// //             <tr className="bg-gray-100 text-left border-b">
// //               <th className="p-2">Assignment 1</th>
// //               <th className="p-2">Type</th>
// //               <th className="p-2">Due Date</th>
// //               <th className="p-2">Pass Mark</th>
// //               <th className="p-2">Weight</th>
// //               <th className="p-2">Assign</th>
// //               <th className="p-2">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {subtasks.map((subtask, i) => (
// //               <tr key={i} className="border-b">
// //                 <td className="p-2">
// //                   <input
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.name}
// //                     onChange={e => updateSubtask(i, 'name', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-2">
// //                   <select
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.type}
// //                     onChange={e => updateSubtask(i, 'type', e.target.value)}
// //                   >
// //                     <option>Write-only</option>
// //                     <option>Read-only</option>
// //                     <option>Offline entry</option>
// //                   </select>
// //                 </td>
// //                 <td className="p-2">
// //                   <input
// //                     type="date"
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.dueDate}
// //                     onChange={e => updateSubtask(i, 'dueDate', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-2">
// //                   <input
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.passMark}
// //                     onChange={e => updateSubtask(i, 'passMark', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-2">
// //                   <input
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.weight}
// //                     onChange={e => updateSubtask(i, 'weight', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-2">
// //                   <button className="px-3 py-1 border rounded">Select</button>
// //                 </td>
// //                 <td className="p-2 flex gap-2">
// //                   <button
// //                     onClick={() => duplicateSubtask(i)}
// //                     className="px-3 py-1 bg-green-500 text-green rounded"
// //                   >
// //                     Duplicate
// //                   </button>
// //                   <button
// //                     onClick={() => deleteSubtask(i)}
// //                     className="px-3 py-1 bg-red-500 text-white rounded"
// //                   >
// //                     Delete
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //           <tfoot>
// //             <tr className="bg-gray-100">
// //               <td className="p-2 font-bold">Total</td>
// //               <td colSpan={4}></td>
// //               <td className="p-2 font-bold text-right" colSpan={2}>
// //                 100%
// //               </td>
// //             </tr>
// //           </tfoot>
// //         </table>
// //       </div>

// //       {/* Footer buttons */}
// //       <div className="flex justify-between mt-4">
// //         <button onClick={addSubtask} className="px-4 py-2 bg-blue-600 text-black rounded">
// //           Add subtask +
// //         </button>
// //         <button className="px-4 py-2 bg-green-400 text-white rounded">Assign Lesson Plan </button>
// //       </div>
// //     </div>
// //   );
// // }

// // 3rd try
// // import { useState } from 'react';
// // import AssignLessonPlanModal from './AssignLessonPlanModal';
// // import { FaTrashAlt, FaCopy, FaChevronDown } from 'react-icons/fa';

// // // Dummy ID for the API call
// // const LESSON_PLAN_ID = 123;

// // export default function LessonPlanBuilder() {
// //   const [subtasks, setSubtasks] = useState([
// //     {
// //       name: 'Subtask 1: Research summary',
// //       type: 'Write-only',
// //       dueDate: '',
// //       passMark: '8/10',
// //       weight: '40%',
// //     },
// //     {
// //       name: 'Subtask 2: Terminology',
// //       type: 'Read-only',
// //       dueDate: '',
// //       passMark: '6/10',
// //       weight: '30%',
// //     },
// //     { name: 'Subtask 3:', type: 'Offline entry', dueDate: '', passMark: '6/10', weight: '30%' },
// //   ]);

// //   const [isModalOpen, setIsModalOpen] = useState(false);

// //   const addSubtask = () => {
// //     setSubtasks([
// //       ...subtasks,
// //       { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '' },
// //     ]);
// //   };

// //   const updateSubtask = (index, field, value) => {
// //     const newSubtasks = [...subtasks];
// //     newSubtasks[index][field] = value;
// //     setSubtasks(newSubtasks);
// //   };

// //   const deleteSubtask = index => {
// //     setSubtasks(subtasks.filter((_, i) => i !== index));
// //   };

// //   const duplicateSubtask = index => {
// //     setSubtasks([...subtasks, { ...subtasks[index] }]);
// //   };

// //   const handleAssignClick = () => {
// //     setIsModalOpen(true);
// //   };

// //   return (
// //     <div className="max-w-7xl mx-auto p-6">

// //       {/* Header: Centered Lesson Plan Builder Title */}
// //       <div className="flex justify-start relative items-center mb-6">
// //         <button className="px-3 py-2 border rounded">&larr; Previous</button>
// //         <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
// //           Lesson Plan Builder
// //         </h1>
// //       </div>

// //       {/* Controls (Add row, Import) */}
// //       <div className="flex gap-2 mb-4">
// //         <button className="px-3 py-2 border rounded">Add row</button>
// //         <select className="px-3 py-2 border rounded">
// //           <option>Import from template</option>
// //           <option>Template 1</option>
// //           <option>Template 2</option>
// //         </select>
// //       </div>

// //       {/* Table */}
// //       <div className="border rounded shadow-md overflow-x-auto">
// //         <table className="w-full border-collapse">
// //           <thead>
// //             <tr className="bg-gray-100 text-left border-b">
// //               <th className="p-3">Assignment 1</th>
// //               <th className="p-3 w-40">Type</th>
// //               <th className="p-3 w-40">Due Date</th>
// //               <th className="p-3 w-32">Pass Mark</th>
// //               <th className="p-3 w-32">Weight</th>
// //               <th className="p-3 w-20">Assign</th>
// //               <th className="p-3 w-48">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {subtasks.map((subtask, i) => (
// //               <tr key={i} className="border-b hover:bg-gray-50">
// //                 <td className="p-3">
// //                   {/* Input to edit subtask name */}
// //                   <input
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.name}
// //                     onChange={e => updateSubtask(i, 'name', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-3">
// //                   {/* Select for type */}
// //                   <select
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.type}
// //                     onChange={e => updateSubtask(i, 'type', e.target.value)}
// //                   >
// //                     <option>Write-only</option>
// //                     <option>Read-only</option>
// //                     <option>Offline entry</option>
// //                   </select>
// //                 </td>
// //                 <td className="p-3">
// //                   {/* Input for due date */}
// //                   <input
// //                     type="date"
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.dueDate}
// //                     onChange={e => updateSubtask(i, 'dueDate', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-3">
// //                   {/* Input for pass mark */}
// //                   <input
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.passMark}
// //                     onChange={e => updateSubtask(i, 'passMark', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-3">
// //                   {/* Input for weight */}
// //                   <input
// //                     className="w-full border px-2 py-1 rounded"
// //                     value={subtask.weight}
// //                     onChange={e => updateSubtask(i, 'weight', e.target.value)}
// //                   />
// //                 </td>
// //                 <td className="p-3">
// //                   <button className="px-3 py-1 border rounded text-gray-700 hover:bg-gray-200">
// //                     Select
// //                   </button>
// //                 </td>

// //                 {/* ACTIONS COLUMN: DUPLICATE BUTTON AND TRASH ICON */}
// //                 <td className="p-3 flex items-center gap-1">
// //                   <button
// //                     onClick={() => duplicateSubtask(i)}
// //                     className="flex items-center justify-center gap-1 px-2 py-1 bg-white text-green-600 border border-green-600 rounded text-xs hover:bg-green-50 transition-colors"
// //                   >
// //                     <FaCopy size={10} />
// //                     Duplicate
// //                   </button>
// //                   <button
// //                     onClick={() => deleteSubtask(i)}
// //                     className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
// //                   >
// //                     <FaTrashAlt size={14} />
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //           <tfoot>
// //             <tr className="bg-gray-100 border-t">
// //               <td className="p-3 font-bold">Total</td>
// //               <td colSpan={4}></td>
// //               <td className="p-3 font-bold text-right" colSpan={2}>
// //                 100%
// //               </td>
// //             </tr>
// //           </tfoot>
// //         </table>
// //       </div>

// //       {/* Footer buttons - Aligned Left/Right */}
// //       <div className="flex justify-between mt-4">
// //         {/* Left: Add Subtask button */}
// //         <button
// //           onClick={addSubtask}
// //           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
// //         >
// //           Add subtask +
// //         </button>

// //         {/* Right: Assign Lesson Plan button (split button look) */}
// //         <div className="flex">
// //           <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
// //             Save Lesson Plan
// //           </button>
// //           <button
// //             onClick={handleAssignClick}
// //             className="px-4 py-2 bg-green-500 text-white rounded-l hover:bg-green-600"
// //           >
// //             Assign Lesson Plan
// //           </button>
// //           {/* The small dropdown arrow part on the button (optional, can be removed if not needed) */}
// //           <button className='px-2 py-2 bg-green-500 text-white rounded-r border-l border-green-400 hover:bg-green-600'>
// //             <FaChevronDown size={14} />
// //           </button>
// //         </div>
// //       </div>

// //       {/* Modal Rendering */}
// //       {isModalOpen && (
// //         <AssignLessonPlanModal
// //           onClose={() => setIsModalOpen(false)}
// //           lessonPlanId={LESSON_PLAN_ID}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// //4th try
// import { useState } from 'react';
// import AssignLessonPlanModal from './AssignLessonPlanModal';
// // Import icons: Trash, Copy (for Duplicate), and ChevronDown (for dropdowns)
// import { FaTrashAlt, FaCopy } from 'react-icons/fa';

// // Dummy ID for the API call
// const LESSON_PLAN_ID = 123;

// export default function LessonPlanBuilder() {
//   const [subtasks, setSubtasks] = useState([
//     {
//       name: 'Subtask 1: Research summ',
//       type: 'Write-only',
//       dueDate: '',
//       passMark: '8/10',
//       weight: '40%',
//     },
//     {
//       name: 'Subtask 2: Terminology',
//       type: 'Read-only',
//       dueDate: '',
//       passMark: '6/10',
//       weight: '30%',
//     },
//     { name: 'Subtask 3:', type: 'Offline entry', dueDate: '', passMark: '6/10', weight: '30%' },
//   ]);

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // --- Data Logic Functions ---
//   const addSubtask = () => {
//     setSubtasks([
//       ...subtasks,
//       { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '' },
//     ]);
//   };

//   const updateSubtask = (index, field, value) => {
//     const newSubtasks = [...subtasks];
//     newSubtasks[index][field] = value;
//     setSubtasks(newSubtasks);
//   };

//   const deleteSubtask = index => {
//     setSubtasks(subtasks.filter((_, i) => i !== index));
//   };

//   const duplicateSubtask = index => {
//     setSubtasks([...subtasks, { ...subtasks[index] }]);
//   };

//   const handleAssignClick = () => {
//     setIsModalOpen(true);
//   };
//   // -----------------------------

//   return (
//     <div className="max-w-7xl mx-auto p-6">

//       {/* 1. RESTORED: Title Bar (Centered Title and Save Lesson Plan Button) */}
//       <div className="flex justify-between items-center mb-6 relative">
//         <h1 className="text-2xl font-bold absolute left-1/2 transform -translate-x-1/2">
//           Lesson Plan Builder
//         </h1>
//         {/* Save Lesson Plan button (Blue) - Placed on the right */}
//         <div className="ml-auto">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
//             Save Lesson Plan
//           </button>
//         </div>
//       </div>

//       {/* Header: Break down activities into checkpoints */}
//       <p className="text-gray-700 font-medium text-lg mb-4">Break down activities into checkpoints</p>

//       {/* Controls (Add row, Import from template) */}
//       <div className="flex gap-2 mb-4">
//         <select className="px-3 py-1 border rounded text-sm hover:bg-gray-50 appearance-none bg-white">
//           <option>Add row</option>
//           <option>1 row</option>
//         </select>
//         <select className="px-3 py-1 border rounded text-sm bg-white appearance-none">
//           <option>Import from template</option>
//           <option>Template 1</option>
//         </select>
//       </div>

//       {/* Table Container */}
//       <div className="border border-gray-200 rounded-lg shadow-md overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             {/* Using a light blue/gray background for the header row */}
//             <tr className="bg-blue-50 text-left text-sm text-gray-700 font-semibold border-b border-gray-200">
//               <th className="p-3 w-1/4">Assignment 1</th>
//               <th className="p-3 w-32">Type</th>
//               <th className="p-3 w-40">Due Date</th>
//               <th className="p-3 w-32">Pass Mark</th>
//               <th className="p-3 w-32">Weight</th>
//               <th className="p-3 w-64">Assign</th> {/* Wider to fit Select, Duplicate, and Trash */}
//             </tr>
//           </thead>
//           <tbody>
//             {subtasks.map((subtask, i) => (
//               <tr key={i} className="border-b border-gray-100 last:border-b-0">
//                 <td className="p-3">
//                   <input
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
//                     value={subtask.name}
//                     onChange={e => updateSubtask(i, 'name', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <select
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
//                     value={subtask.type}
//                     onChange={e => updateSubtask(i, 'type', e.target.value)}
//                   >
//                     <option>Write-only</option>
//                     <option>Read-only</option>
//                     <option>Offline entry</option>
//                   </select>
//                 </td>
//                 <td className="p-3">
//                   {/* RESTORED: Date Picker for Due Date */}
//                   <input
//                     type="date"
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
//                     value={subtask.dueDate}
//                     onChange={e => updateSubtask(i, 'dueDate', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <input
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm text-center"
//                     value={subtask.passMark}
//                     onChange={e => updateSubtask(i, 'passMark', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <input
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm text-center"
//                     value={subtask.weight}
//                     onChange={e => updateSubtask(i, 'weight', e.target.value)}
//                   />
//                 </td>

//                 {/* Assign Column: Select, DUPLICATE, and Trash */}
//                 <td className="p-3 flex items-center gap-2 justify-start">
//                   <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-100">
//                     Select
//                   </button>

//                   {/* RESTORED: Duplicate button (Light green border/text) */}
//                   <button
//                     onClick={() => duplicateSubtask(i)}
//                     className="flex items-center justify-center px-3 py-1 bg-white text-green-600 border border-green-600 rounded text-xs hover:bg-green-50 transition-colors"
//                   >
//                     <FaCopy size={10} />
//                     Duplicate
//                   </button>

//                   {/* Delete Icon (Trash Can) */}
//                   <button
//                     onClick={() => deleteSubtask(i)}
//                     className="p-1 text-gray-500 hover:text-red-600 transition-colors"
//                   >
//                     <FaTrashAlt size={16} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot>
//             {/* Total Row */}
//             <tr className="bg-white border-t border-gray-200">
//               <td className="p-3 font-semibold text-gray-700">Total</td>
//               <td colSpan={4}></td>
//               <td className="p-3 font-semibold text-right text-gray-700" colSpan={1}>
//                 100%
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* MISALIGNMENT FIX: Footer buttons are now clearly separated and correctly aligned */}
//       <div className="flex justify-between mt-6">

//         {/* Left: Add subtask + (Blue) */}
//         <button
//           onClick={addSubtask}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 font-medium"
//         >
//           Add subtask +
//         </button>

//         {/* Right: Assign Lesson Plan (Green) */}
//         <button
//           onClick={handleAssignClick}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
//         >
//           Assign Lesson Plan
//         </button>
//       </div>

//       {/* Modal Rendering */}
//       {isModalOpen && (
//         <AssignLessonPlanModal
//           onClose={() => setIsModalOpen(false)}
//           lessonPlanId={LESSON_PLAN_ID}
//         />
//       )}
//     </div>
//   );
// }

// // / 5th try
// import { useState } from 'react';
// import AssignLessonPlanModal from './AssignLessonPlanModal';
// import { FaTrashAlt } from 'react-icons/fa'; // Only need the trash icon now

// // Dummy ID for the API call
// const LESSON_PLAN_ID = 123;

// export default function LessonPlanBuilder() {
//   const [subtasks, setSubtasks] = useState([
//     {
//       name: 'Subtask 1: Research summ',
//       type: 'Write-only',
//       dueDate: '',
//       passMark: '8/10',
//       weight: '40%',
//     },
//     {
//       name: 'Subtask 2: Terminology',
//       type: 'Read-only',
//       dueDate: '',
//       passMark: '6/10',
//       weight: '30%',
//     },
//     { name: 'Subtask 3:', type: 'Offline entry', dueDate: '', passMark: '6/10', weight: '30%' },
//   ]);

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // --- Data Logic Functions ---
//   const addSubtask = () => {
//     setSubtasks([
//       ...subtasks,
//       { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '' },
//     ]);
//   };

//   const updateSubtask = (index, field, value) => {
//     const newSubtasks = [...subtasks];
//     newSubtasks[index][field] = value;
//     setSubtasks(newSubtasks);
//   };

//   const deleteSubtask = index => {
//     setSubtasks(subtasks.filter((_, i) => i !== index));
//   };

//   const duplicateSubtask = index => {
//     setSubtasks([...subtasks, { ...subtasks[index] }]);
//   };

//   const handleAssignClick = () => {
//     setIsModalOpen(true);
//   };

//   const handleSaveClick = () => {
//     // eslint-disable-next-line no-console
//     console.log('Lesson Plan Saved!');
//     // Logic to save the lesson plan data
//   };
//   // -----------------------------

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       {/* FIXED: Title (Using exact classes from image 19784f) */}
//       <div className="flex justify-center items-center mb-6">
//         <h1 className="text-2xl font-bold text-blue-700">Lesson Plan Builder</h1>
//         {/* Placeholder for Save Button logic - not visible in current UI, but kept for function */}
//       </div>

//       {/* Header: Break down activities into checkpoints */}
//       <p className="text-gray-700 font-medium text-lg mb-4">
//         Break down activities into checkpoints
//       </p>

//       {/* Controls (Add row, Import from template) */}
//       <div className="flex gap-2 mb-4">
//         <select className="px-3 py-1 border rounded text-sm hover:bg-gray-50 appearance-none bg-white">
//           <option>Add row</option>
//           <option>1 row</option>
//         </select>
//         <select className="px-3 py-1 border rounded text-sm bg-white appearance-none">
//           <option>Import from template</option>
//           <option>Template 1</option>
//         </select>
//       </div>

//       {/* Table Container */}
//       <div className="border-t border-b border-gray-200 shadow-sm overflow-x-auto">
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className="bg-blue-50 text-left text-sm text-gray-700 font-semibold border-b border-gray-200">
//               <th className="p-3 w-1/4">Assignment 1</th>
//               <th className="p-3 w-32">Type</th>
//               <th className="p-3 w-40">Due Date</th>
//               <th className="p-3 w-32">Pass Mark</th>
//               <th className="p-3 w-32">Weight</th>
//               <th className="p-3 w-48">Assign</th>
//             </tr>
//           </thead>
//           <tbody>
//             {subtasks.map((subtask, i) => (
//               <tr key={i} className="border-b border-gray-100 last:border-b-0">
//                 <td className="p-3">
//                   <input
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
//                     value={subtask.name}
//                     onChange={e => updateSubtask(i, 'name', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <select
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm"
//                     value={subtask.type}
//                     onChange={e => updateSubtask(i, 'type', e.target.value)}
//                   >
//                     <option>Write-only</option>
//                     <option>Read-only</option>
//                     <option>Offline entry</option>
//                   </select>
//                 </td>
//                 <td className="p-3 flex items-center relative">
//                   {/* Date Picker Input (Restored type="date" functionality) */}
//                   <input
//                     type="date"
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm pr-8" // Add padding right for the icon
//                     value={subtask.dueDate}
//                     onChange={e => updateSubtask(i, 'dueDate', e.target.value)}
//                   />
//                   {/* Calendar Icon - Placed absolutely inside the TD for the clean look */}
//                   <span className="absolute right-4 text-gray-500 cursor-pointer pointer-events-none">
//                     &#x1F4C5; {/* Unicode calendar icon */}
//                   </span>
//                 </td>
//                 <td className="p-3">
//                   <input
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm text-center"
//                     value={subtask.passMark}
//                     onChange={e => updateSubtask(i, 'passMark', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <input
//                     className="w-full border border-gray-300 px-2 py-1 rounded text-sm text-center"
//                     value={subtask.weight}
//                     onChange={e => updateSubtask(i, 'weight', e.target.value)}
//                   />
//                 </td>

//                 {/* Assign Column: Select, Duplicate, and Trash */}
//                 <td className="p-3 flex items-center gap-2 justify-start">
//                   <button className="btn btn-sm btn-light border text-secondary">Select</button>

//                   {/* FIXED: Duplicate button using Bootstrap classes and inline style for green border */}
//                   <button
//                     onClick={() => duplicateSubtask(i)}
//                     className="btn btn-sm"
//                     style={{
//                       backgroundColor: '#e6f7e6', // Light green background (analogous to bg-green-100)
//                       color: '#1a751a', // Dark green text
//                       borderColor: '#5cb85c', // Green border
//                       borderWidth: '1px',
//                     }}
//                   >
//                     Duplicate
//                   </button>

//                   {/* FIXED: Delete Icon (Red color) */}
//                   <button
//                     onClick={() => deleteSubtask(i)}
//                     className="text-danger p-1" // Use Bootstrap text-danger
//                     style={{ background: 'none', border: 'none', cursor: 'pointer' }}
//                   >
//                     <i className="fa fa-trash-alt" />{' '}
//                     {/* Use Font Awesome icon if available, or FaTrashAlt */}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot>
//             {/* Total Row */}
//             <tr className="bg-white border-t border-gray-200">
//               <td className="p-3 font-semibold text-gray-700">Total</td>
//               <td colSpan={4}></td>
//               <td className="p-3 font-semibold text-right text-gray-700" colSpan={1}>
//                 100%
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* FIXED: Footer buttons (Using exact classes from images 1974e4 & 1974ad) */}
//       <div className="d-flex justify-content-between mt-4">
//         {/* Left: Add subtask + (Blue) */}
//         <button
//           onClick={addSubtask}
//           className="btn btn-primary" // Bootstrap primary for blue
//         >
//           Add subtask +
//         </button>

//         {/* Right: Assign Lesson Plan (Green) */}
//         <button
//           onClick={handleAssignClick}
//           className="btn"
//           style={{ backgroundColor: '#5cb85c', color: 'white' }} // Custom green for visibility
//         >
//           Assign Lesson Plan
//         </button>
//       </div>

//       {/* Modal Rendering */}
//       {isModalOpen && (
//         <AssignLessonPlanModal
//           onClose={() => setIsModalOpen(false)}
//           lessonPlanId={LESSON_PLAN_ID}
//         />
//       )}
//     </div>
//   );
// }

// 6th try
// import { useState } from 'react';
// import AssignLessonPlanModal from './AssignLessonPlanModal';
// // Using standard Font Awesome (fa) convention, common in Bootstrap projects
// import { FaTrashAlt, FaCopy } from 'react-icons/fa';
// // Import the new CSS Module
// import styles from './LessonPlanBuilder.module.css';

// // Dummy ID for the API call
// const LESSON_PLAN_ID = 123;

// export default function LessonPlanBuilder() {
//   const [subtasks, setSubtasks] = useState([
//     {
//       name: 'Subtask 1: Research summ',
//       type: 'Write-only',
//       dueDate: '',
//       passMark: '8/10',
//       weight: '40%',
//     },
//     {
//       name: 'Subtask 2: Terminology',
//       type: 'Read-only',
//       dueDate: '',
//       passMark: '6/10',
//       weight: '30%',
//     },
//     { name: 'Subtask 3:', type: 'Offline entry', dueDate: '', passMark: '6/10', weight: '30%' },
//   ]);

//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // --- Data Logic Functions ---
//   const addSubtask = () => {
//     setSubtasks([
//       ...subtasks,
//       { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '' },
//     ]);
//   };

//   const updateSubtask = (index, field, value) => {
//     const newSubtasks = [...subtasks];
//     newSubtasks[index][field] = value;
//     setSubtasks(newSubtasks);
//   };

//   const deleteSubtask = index => {
//     setSubtasks(subtasks.filter((_, i) => i !== index));
//   };

//   const duplicateSubtask = index => {
//     setSubtasks([...subtasks, { ...subtasks[index] }]);
//   };

//   const handleAssignClick = () => {
//     setIsModalOpen(true);
//   };

//   const handleSaveClick = () => {
//     // eslint-disable-next-line no-console
//     console.log('Lesson Plan Saved!');
//     // Logic to save the lesson plan data
//   };
//   // -----------------------------

//   return (
//     <div className={styles.lessonPlanContainer}>
//       {/* Title Bar (Centered Title and Save Button) - Using Bootstrap d-flex classes */}
//       <div className="d-flex justify-content-center align-items-center mb-4 position-relative">
//         <h1 className="h2 text-primary font-weight-bold" style={{ color: '#007bff' }}>
//           Lesson Plan Builder
//         </h1>
//         {/* Placeholder for Save Button - positioned absolutely to the right */}
//         <div className="position-absolute" style={{ right: 0 }}>
//           <button onClick={handleSaveClick} className={`btn ${styles.blueBtn}`}>
//             Save Lesson Plan
//           </button>
//         </div>
//       </div>

//       {/* Header: Break down activities into checkpoints */}
//       <p className="text-secondary font-weight-medium h6 mb-3">
//         Break down activities into checkpoints
//       </p>

//       {/* Controls (Add row, Import from template) */}
//       <div className="d-flex gap-2 mb-4">
//         <select className="form-select form-control form-control-sm">
//           <option>Add row</option>
//           <option>1 row</option>
//         </select>
//         <select className="form-select form-control form-control-sm">
//           <option>Import from template</option>
//           <option>Template 1</option>
//         </select>
//       </div>

//       {/* Table Container */}
//       <div className="border border-light shadow-sm overflow-auto">
//         <table className="table table-borderless table-sm mb-0">
//           <thead>
//             <tr className={styles.tableHeader}>
//               <th className="p-3 w-25">Assignment 1</th>
//               <th className="p-3 w-auto">Type</th>
//               <th className="p-3 w-auto">Due Date</th>
//               <th className="p-3 w-auto">Pass Mark</th>
//               <th className="p-3 w-auto">Weight</th>
//               <th className="p-3 w-auto">Assign</th>
//             </tr>
//           </thead>
//           <tbody>
//             {subtasks.map((subtask, i) => (
//               <tr key={i} className="border-bottom">
//                 <td className="p-3">
//                   <input
//                     type="text"
//                     className="form-control form-control-sm"
//                     value={subtask.name}
//                     onChange={e => updateSubtask(i, 'name', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <select
//                     className="form-select form-control form-control-sm"
//                     value={subtask.type}
//                     onChange={e => updateSubtask(i, 'type', e.target.value)}
//                   >
//                     <option>Write-only</option>
//                     <option>Read-only</option>
//                     <option>Offline entry</option>
//                   </select>
//                 </td>
//                 <td className="p-3 position-relative">
//                   {/* Date Picker Input (using native type=date for functionality) */}
//                   <input
//                     type="date"
//                     className="form-control form-control-sm pr-4"
//                     value={subtask.dueDate}
//                     onChange={e => updateSubtask(i, 'dueDate', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <input
//                     type="text"
//                     className="form-control form-control-sm text-center"
//                     value={subtask.passMark}
//                     onChange={e => updateSubtask(i, 'passMark', e.target.value)}
//                   />
//                 </td>
//                 <td className="p-3">
//                   <input
//                     type="text"
//                     className="form-control form-control-sm text-center"
//                     value={subtask.weight}
//                     onChange={e => updateSubtask(i, 'weight', e.target.value)}
//                   />
//                 </td>

//                 {/* Assign Column: Select, Duplicate, and Trash */}
//                 <td className="p-3 d-flex align-items-center gap-2">
//                   <button className="btn btn-sm btn-light border text-secondary">Select</button>

//                   {/* FIXED: Duplicate button using the custom CSS Module class */}
//                   <button onClick={() => duplicateSubtask(i)} className={styles.duplicateBtn}>
//                     Duplicate
//                   </button>

//                   {/* FIXED: Delete Icon (Red color using custom CSS Module class) */}
//                   <button
//                     onClick={() => deleteSubtask(i)}
//                     className={`btn btn-link p-0 ${styles.deleteIcon}`}
//                   >
//                     <FaTrashAlt size={16} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot>
//             {/* Total Row */}
//             <tr>
//               <td className="p-3 font-weight-bold" style={{ backgroundColor: '#f8f9fa' }}>
//                 Total
//               </td>
//               <td colSpan={4} style={{ backgroundColor: '#f8f9fa' }}></td>
//               <td
//                 className="p-3 font-weight-bold text-right"
//                 colSpan={1}
//                 style={{ backgroundColor: '#f8f9fa' }}
//               >
//                 100%
//               </td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>

//       {/* FIXED: Footer buttons (Correctly aligned and visible with custom styles) */}
//       <div className="d-flex justify-content-between mt-4">
//         {/* Left: Add subtask + (Blue) */}
//         <button onClick={addSubtask} className={`btn ${styles.blueBtn} ${styles.footerButton}`}>
//           Add subtask +
//         </button>

//         {/* Right: Assign Lesson Plan (Green) */}
//         <button
//           onClick={handleAssignClick}
//           className={`btn ${styles.assignBtn} ${styles.footerButton}`}
//         >
//           Assign Lesson Plan
//         </button>
//       </div>

//       {/* Modal Rendering */}
//       {isModalOpen && (
//         <AssignLessonPlanModal
//           onClose={() => setIsModalOpen(false)}
//           lessonPlanId={LESSON_PLAN_ID}
//         />
//       )}
//     </div>
//   );
// }
// require('dotenv').config();

import { useState, useEffect } from 'react';
import AssignLessonPlanModal from './AssignLessonPlanModal';
// Including FaCopy to make Duplicate button logic runnable, although not visible in UI
import { FaTrashAlt, FaCopy } from 'react-icons/fa';
import styles from './LessonPlanBuilder.module.css'; // Importing the CSS Module
import LessonPlanLogTable from './LessonPlanLogTable';
import styles2 from './LessonPlanLogTable.module.css';
// Dummy ID for the API call
const LESSON_PLAN_ID = '68ed6e6e746d9b633a6158f3';

// Helper function to safely parse response body as JSON
// const safeJsonParse = async response => {
//   try {
//     const clonedResponse = response.clone();
//     return await clonedResponse.json();
//   } catch (e) {
//     return null;
//   }
// };

// Assume you have a simple utility for showing notifications
const showNotification = (message, type = 'success') => {
  console.log(`Notification (${type}): ${message}`);
  // eslint-disable-next-line no-alert
  alert(message);
};

export default function LessonPlanBuilder() {
  const [subtasks, setSubtasks] = useState([
    {
      name: 'Subtask 1: Research summary',
      type: 'Write-only',
      dueDate: '',
      passMark: '8/10',
      weight: '40%',
    },
    {
      name: 'Subtask 2: Terminology',
      type: 'Read-only',
      dueDate: '',
      passMark: '6/10',
      weight: '30%',
    },
    { name: 'Subtask 3:', type: 'Offline entry', dueDate: '', passMark: '6/10', weight: '30%' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for tracking assignment status ---
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  // State to hold the logs ---
  const [logs, setLogs] = useState([]);

  // Function to fetch logs ---
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_APIENDPOINT}/educator/logs/${LESSON_PLAN_ID}`,
        {
          headers: { Authorization: token },
        },
      );
      const data = await response.json();
      if (response.ok) {
        setLogs(data);
      } else {
        console.error('Failed to fetch logs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // useEffect to fetch logs on component load ---
  useEffect(() => {
    fetchLogs();
  }, []); // Empty array means this runs once on load

  // --- Data Logic Functions
  const addSubtask = () => {
    setSubtasks([
      ...subtasks,
      { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '' },
    ]);
  };

  const updateSubtask = (index, field, value) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index][field] = value;
    setSubtasks(newSubtasks);
  };

  const deleteSubtask = index => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const duplicateSubtask = index => {
    setSubtasks([...subtasks, { ...subtasks[index] }]);
  };

  // Centralized API Function ---
  const assignTasks = async (isAutoAssigned, onAssignmentSuccess) => {
    const payload = {
      lessonPlanId: LESSON_PLAN_ID, // Use the actual lesson plan ID
      assignmenDate: new Date().toISOString().split('T')[0],
      isAutoAssigned: isAutoAssigned,
    };

    // const rawToken = localStorage.getItem('token');
    const token = localStorage.getItem('token');

    // let token = null;
    // if (rawToken) {
    //   try {
    //     token = JSON.parse(rawToken);
    //   } catch (e) {
    //     showNotification('Authentication error: Could not parse the user token. ', 'error');
    //     return;
    //   }
    // }
    if (!token) {
      showNotification('Authentication error: No user token found. Please log in again.', 'error');
      return;
    }

    try {
      // const response = await fetch('/api/educator/assign-tasks', {
      const response = await fetch(`${process.env.REACT_APP_APIENDPOINT}/educator/assign-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      // const data = await safeJsonParse(response);

      if (!response.ok) {
        // const errorMessage = data?.message || 'Task assignment failed. Please try again.';
        // showNotification(`Task assignment failed. Error: ${errorMessage}`, 'error');
        // throw new Error(`API Error: ${response.status}`);

        // Use the status text for the error message (e.g., "Not Found")
        const errorMessage = `${response.statusText} (${response.status})`;
        throw new Error(errorMessage);
      }

      // If the response IS successful, parse the JSON.
      const data = await response.json();

      // if (data) {
      //   const { assigned_count = 0, skipped_count = 0 } = data;
      //   if (skipped_count > 0) {
      //     showNotification(
      //       `${assigned_count} tasks assigned, ${skipped_count} skipped due to unmet prerequisites.`,
      //       'warning',
      //     );
      //   } else {
      //     showNotification(`${assigned_count} tasks assigned successfully.`, 'success');
      //   }
      //   // TODO: Update local state/UI dashboard

      //   // --- THIS IS THE STATE UPDATE ---
      //   // Call the callback function on success
      //   if (onAssignmentSuccess) {
      //     onAssignmentSuccess();
      //   }
      // } else {
      //   showNotification('Tasks assigned, but response data was incomplete.', 'warning');
      // }
      const { assignedCount = 0, skippedCount = 0 } = data;
      if (skippedCount > 0) {
        showNotification(
          `${assignedCount} tasks assigned, ${skippedCount} skipped due to unmet prerequisites.`,
          'warning',
        );
      } else {
        showNotification(`${assignedCount} tasks assigned successfully.`, 'success');
      }

      // On success, call the callback to update the UI.
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
      // Refreshes the log table after a successful assignment ---
      fetchLogs();
    } catch (error) {
      // This will now catch both network errors and the errors we throw manually.
      showNotification(`Task assignment failed. Error: ${error.message}`, 'error');
      console.error('Final Assignment Error:', error.message);
      // Don't show a generic notification here if a specific one was already shown
    }
    // end of temporaryu change

    // --- SIMULATION LOGIC ---
    // This pretends the API call was successful and calls the success callback.
    // console.log('SIMULATING successful API call with payload:', payload);
    // showNotification('SIMULATION: 10 tasks assigned successfully.', 'success');
    // if (onAssignmentSuccess) {
    //   onAssignmentSuccess();
    // }
    // --- END OF TEMPORARY CHANGE ---
  };

  const handleAssignClick = () => {
    setIsModalOpen(true);
  };

  const handleSaveClick = async () => {
    // eslint-disable-next-line no-console
    console.log('Lesson Plan Saved!');
    // Logic to save the lesson plan data

    // After a successful save, trigger the auto-assignment
    console.log('Triggering auto-assignment...');
    // await assignTasks(true); // Call with isAutoAssigned = true -- old
    await assignTasks(true, () => {
      const timestamp = new Date().toLocaleTimeString();
      setAssignmentStatus(`Auto-assigned at ${timestamp}`);
    });
  };
  // -----------------------------
  //  Function to handle the successful assignment ---
  const handleManualAssignmentSuccess = () => {
    const timestamp = new Date().toLocaleTimeString();
    setAssignmentStatus(`Manually assigned at ${timestamp}`);
  };

  return (
    <div className={styles.lessonPlanContainer}>
      {/* Title Bar and Save Button */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4"> */}
      {/* <div className={styles.contentBox}> */}
      <div className={styles.titleBox}>
        <h2 className="h2 font-weight-bold w-100 text-left" style={{ color: '#000000' }}>
          Lesson Plan Builder
        </h2>
        {/* FIXED: Save Lesson Plan Button with custom color class
        <button onClick={handleSaveClick} className={styles.headerSaveBtn}>
          Save Lesson Plan
        </button> */}
        {/* <div className="d-flex align-items-center"> */}
        {/* Displays assignment status --- */}
        {assignmentStatus && <span className="text-success mr-3">{assignmentStatus}</span>}
        <button onClick={handleSaveClick} className={styles.headerSaveBtn}>
          Save Lesson Plan
        </button>
        {/* </div> */}
      </div>

      <div className={styles.grayBackgroundWrapper}>
        <div className={styles.contentBox}>
          {/* Header: Breaks down activities into checkpoints */}
          <p className="text-secondary font-weight-medium h6 mb-3">
            Break down activities into checkpoints
          </p>

          {/* Controls (Adding row, Import from template) */}
          <div className={styles.controlRow}>
            <select className="form-select form-control form-control-sm">
              <option>Add row</option>
              <option>1 row</option>
              <option>2 row</option>
            </select>
            <select className="form-select form-control form-control-sm">
              <option>Import from template</option>
              <option>Template 1</option>
              <option>Template 2</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="border border-light shadow-sm overflow-auto">
            <table className="table table-borderless table-sm mb-0">
              <thead>
                <tr className={styles.tableHeader}>
                  <th className="p-3 w-25">Assignment 1</th>
                  <th className="p-3 w-auto">Type</th>
                  <th className="p-3 w-auto">Due Date</th>
                  <th className="p-3 w-auto">Pass Mark</th>
                  <th className="p-3 w-auto">Weight</th>
                  <th className="p-3 w-auto">Assign</th>
                </tr>
              </thead>
              <tbody>
                {subtasks.map((subtask, i) => (
                  <tr key={i} className="border-bottom">
                    <td className="p-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={subtask.name}
                        onChange={e => updateSubtask(i, 'name', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <select
                        className="form-select form-control form-control-sm"
                        value={subtask.type}
                        onChange={e => updateSubtask(i, 'type', e.target.value)}
                      >
                        <option>Write-only</option>
                        <option>Read-only</option>
                        <option>Offline entry</option>
                      </select>
                    </td>
                    <td className="p-3 position-relative">
                      {/* Date Picker Input */}
                      <input
                        type="date"
                        className={`form-control form-control-sm pr-4 ${styles.inputNarrow}`}
                        value={subtask.dueDate}
                        onChange={e => updateSubtask(i, 'dueDate', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className={`form-control form-control-sm text-center ${styles.inputNarrow}`}
                        value={subtask.passMark}
                        onChange={e => updateSubtask(i, 'passMark', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        className={`form-control form-control-sm text-center ${styles.inputNarrow}`}
                        value={subtask.weight}
                        onChange={e => updateSubtask(i, 'weight', e.target.value)}
                      />
                    </td>

                    {/* Assign Column: Select, Duplicate, and Trash */}
                    <td className="p-3 d-flex align-items-center">
                      <button className={styles.selectBtn}>Select</button>

                      {/* FIXED: Duplicate button using custom CSS Module class */}
                      <button onClick={() => duplicateSubtask(i)} className={styles.duplicateBtn}>
                        Duplicate
                      </button>

                      {/* FIXED: Delete Icon (Red color using custom CSS Module class) */}
                      <button
                        onClick={() => deleteSubtask(i)}
                        className={`btn btn-link p-0 ${styles.deleteIcon}`}
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Empty row to create the constant space below the last entry */}
                <tr className="border-bottom">
                  <td colSpan="6" style={{ height: '100px', backgroundColor: 'white' }}></td>
                </tr>
              </tbody>
              <tfoot>
                {/* Total Row */}
                <tr>
                  <td
                    className="p-3 font-weight-bold text-secondary"
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    Total
                  </td>
                  <td colSpan={4} style={{ backgroundColor: '#f8f9fa' }}></td>
                  <td
                    className="p-3 font-weight-bold text-right text-secondary"
                    colSpan={1}
                    style={{ backgroundColor: '#f8f9fa' }}
                  >
                    100%
                  </td>
                </tr>
                <tr className="border-bottom">
                  <td colSpan="6" style={{ height: '80px', backgroundColor: 'white' }}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* FIXED: Footer buttons (Correctly aligned and visible with custom styles) */}
          {/* <div className="d-flex justify-content-between mt-4"> */}
          {/* Left: Add subtask + (Blue) */}
          {/* <div className={styles.footerButtonWrapper}> */}
          <div className={styles.addSubTaskDiv}>
            <button onClick={addSubtask} className={styles.addSubtaskBtn}>
              Add subtask +
            </button>
          </div>
          <br />
          {/* Right: Assign Lesson Plan (Green) */}
          <button onClick={handleAssignClick} className={styles.assignLsnBtn}>
            Assign Lesson Plan
          </button>
          {/* </div> */}
        </div>
        {/* ADDDING THE LOG TABLE AT THE BOTTOM --- */}
        {/* {loading && <p className="loading-message">Loading...</p>}
        {error && (
          <p data-testid="error-message" className="error-message">
            {error}
          </p>
        )}{' '} */}
        {/* This goes inside grayBackgroundWrapper, AFTER the first contentBox */}
        {/* <div className={styles2.tableResponsive}>
          <h3 className="h5 font-weight-bold mb-3">Edit & Assignment History</h3>
          <LessonPlanLogTable logs={logs} />
        </div> */}
        <br />
        <br />
        {/* --- END OF NEW CODE --- */}
      </div>
      {/* </div> */}
      {/* Modal Rendering */}
      {isModalOpen && (
        <AssignLessonPlanModal
          onClose={() => setIsModalOpen(false)}
          lessonPlanId={LESSON_PLAN_ID}
          // Pass the assignTasks function to the modal
          // assignTasks={assignTasks}
          assignTasks={isAuto => assignTasks(isAuto, handleManualAssignmentSuccess)}
        />
      )}
    </div>
  );
}
