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

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import AssignLessonPlanModal from './AssignLessonPlanModal';
import { FaTrashAlt } from 'react-icons/fa';
import styles from './LessonPlanBuilder.module.css'; // Importing the CSS Module

const notify = (message, type = 'success') => {
  if (type === 'error') toast.error(message);
  else if (type === 'warning') toast.warn(message);
  else toast.success(message);
};

// Share a small decimal validator between weights and each side of a fraction.
const isUnsignedDecimal = value => /^(?:\d+|\d*\.\d+)$/.test(value);

// Keep cleared fields editable, but always report them as invalid.
const getWeightError = value => {
  const trimmed = value.trim();
  if (!trimmed) return 'Weight is required.';
  const numericText = trimmed.endsWith('%') ? trimmed.slice(0, -1) : trimmed;
  const weight = Number(numericText);
  return isUnsignedDecimal(numericText) && weight >= 0 && weight <= 100
    ? ''
    : 'Enter a weight from 0 to 100, optionally followed by %.';
};

const getPassMarkError = value => {
  const trimmed = value.trim();
  if (!trimmed) return 'Pass mark is required.';
  const parts = trimmed.split('/').map(part => part.trim());
  const validFormat = parts.length === 2 && parts.every(isUnsignedDecimal);
  const numerator = validFormat ? Number(parts[0]) : Number.NaN;
  const denominator = validFormat ? Number(parts[1]) : Number.NaN;
  return Number.isFinite(numerator) &&
    Number.isFinite(denominator) &&
    denominator > 0 &&
    numerator >= 0 &&
    numerator <= denominator
    ? ''
    : 'Enter a fraction such as 8/10, with a positive denominator and a score from 0 to that denominator.';
};

// Build a calendar date from local parts; UTC conversion can shift today by one day.
const getLocalDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const getDueDateError = (value, today, badInput = false) => {
  if (badInput) return 'Enter a valid due date.';
  if (!value) return 'A due date is required.';
  // Round-trip local date parts to reject impossible dates as well as malformed strings.
  const date = new Date(`${value}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || getLocalDate(date) !== value) {
    return 'Enter a valid due date.';
  }
  return value < today ? 'Due date must be today or later.' : '';
};

const SUBTASK_TYPES = ['Write-only', 'Read-only', 'Offline entry'];

const getTypeError = type => {
  if (!type) return 'Type is required.';
  return SUBTASK_TYPES.includes(type) ? '' : 'Select a supported subtask type.';
};

// Share the same rules between immediate feedback and every submission guard.
const getSubtaskErrors = ({ name, type, weight, passMark, dueDate, dueDateBadInput }, today) => ({
  name: name.trim() ? '' : 'Subtask name is required.',
  type: getTypeError(type),
  weight: getWeightError(weight),
  passMark: getPassMarkError(passMark),
  dueDate: getDueDateError(dueDate, today, dueDateBadInput),
});

const ValidationMessage = ({ id, error }) => (
  <div id={`${id}-visual`} className={styles.validationError} aria-live="polite">
    {error && (
      <>
        <span aria-hidden="true">Invalid input</span>
        <span id={id} className={styles.visuallyHidden}>
          {error}
        </span>
      </>
    )}
  </div>
);

ValidationMessage.propTypes = {
  id: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
};

const getMetadataErrors = metadata => {
  const errors = { title: metadata.title.trim() ? '' : 'Title is required.' };
  ['startDate', 'endDate'].forEach(key => {
    const value = metadata[key];
    if (!value) errors[key] = 'Date is required.';
    else errors[key] = getDueDateError(value, '0000-01-01') ? 'Enter a valid date.' : '';
  });
  if (!errors.startDate && !errors.endDate && metadata.startDate > metadata.endDate) {
    errors.endDate = 'End date must be on or after start date.';
  }
  return errors;
};

export default function LessonPlanBuilder() {
  const authUser = useSelector(state => state.auth?.user);
  const canManageAssignments =
    authUser?.role === 'Administrator' ||
    authUser?.role === 'Owner' ||
    authUser?.role === 'Manager' ||
    authUser?.role === 'Educator';

  const canSave = ['Educator', 'Administrator', 'Owner'].includes(authUser?.role);
  const [metadata, setMetadata] = useState({
    title: '',
    startDate: '',
    endDate: '',
    theme: '',
    description: '',
  });
  const [lessonPlanId, setLessonPlanId] = useState(null);
  const [savedSubtasks, setSavedSubtasks] = useState(null);
  const [identityError, setIdentityError] = useState('');
  const identityBlockedRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const savingInFlightRef = useRef(false);
  const [touchedMetadata, setTouchedMetadata] = useState({});
  const [submissionAttempted, setSubmissionAttempted] = useState(false);
  const metadataErrors = getMetadataErrors(metadata);
  const visibleMetadataErrors = Object.fromEntries(
    Object.entries(metadataErrors).map(([key, error]) => [
      key,
      submissionAttempted || touchedMetadata[key] ? error : '',
    ]),
  );
  const hasInvalidMetadata = Object.values(metadataErrors).some(Boolean);

  const nextRowKey = useRef(3);
  const [subtasks, setSubtasks] = useState(
    [
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
    ].map((row, rowKey) => ({ ...row, rowKey })),
  );

  const today = getLocalDate();

  // Derive errors from current rows so row operations cannot leave stale validation state.
  const subtaskErrors = subtasks.map(subtask => getSubtaskErrors(subtask, today));
  const hasInvalidSubtasks =
    !subtasks.length || subtaskErrors.some(errors => Object.values(errors).some(Boolean));

  // Visibility is separate from validity: untouched fields still block submission.
  const visibleSubtaskErrors = subtaskErrors.map((errors, index) =>
    Object.fromEntries(
      Object.entries(errors).map(([key, error]) => [
        key,
        submissionAttempted || subtasks[index].touched?.[key] ? error : '',
      ]),
    ),
  );
  const touchSubtask = (index, field) =>
    setSubtasks(previous =>
      previous.map((row, i) =>
        i === index ? { ...row, touched: { ...row.touched, [field]: true } } : row,
      ),
    );
  // Disabled buttons cannot run their click handler. Capture pointer attempts on the
  // container to reveal errors without enabling submission or issuing requests.
  const revealSubmissionErrors = event => {
    if (event.target.closest('[data-validation-action]')) setSubmissionAttempted(true);
  };

  // Derive the total on each render so edits, additions, deletions, and duplicates are reflected.
  const totalWeight = subtasks.reduce((total, { weight }) => {
    // Accept percentage strings such as "40%"; empty strings convert to zero.
    const numericWeight = Number(weight.trim().replace(/%$/, ''));
    // Invalid values contribute zero without replacing the text entered in the field.
    return total + (getWeightError(weight) ? 0 : numericWeight);
  }, 0);

  // Compare only persisted fields; UI date-picker flags never enter the payload.
  const subTasks = subtasks.map(({ _id, name, type, dueDate, passMark, weight }) => ({
    ...(_id ? { _id } : {}),
    name,
    type,
    dueDate,
    passMark,
    weight,
  }));
  const subtaskSnapshot = JSON.stringify(subTasks);
  const hasUnsavedSubtasks = subtaskSnapshot !== savedSubtasks;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const assigningInFlightRef = useRef(false);
  // State for tracking assignment status ---
  const [assignmentStatus, setAssignmentStatus] = useState(null);

  // Function to fetch logs ---
  const fetchLogs = async savedId => {
    if (!savedId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_APIENDPOINT}/educator/logs/${savedId}`,
        {
          headers: { Authorization: token },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to fetch logs:', data.message);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // No log request is made until persistence has returned a real plan ID.
  useEffect(() => {
    if (lessonPlanId) {
      fetchLogs(lessonPlanId).catch(error => console.error('Error fetching logs:', error));
    }
  }, [lessonPlanId]);

  // --- Data Logic Functions
  const addSubtask = () => {
    const rowKey = nextRowKey.current;
    nextRowKey.current += 1;
    setSubtasks([
      ...subtasks,
      { name: '', type: 'Write-only', dueDate: '', passMark: '', weight: '', rowKey },
    ]);
  };

  const updateSubtask = (index, field, value) => {
    // Copy the edited row instead of mutating an object from the previous state.
    setSubtasks(previous =>
      previous.map((subtask, i) =>
        i === index
          ? { ...subtask, [field]: value, touched: { ...subtask.touched, [field]: true } }
          : subtask,
      ),
    );
  };

  const deleteSubtask = index => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const duplicateSubtask = index => {
    // A duplicate is a new subtask, so only persistence may give it a database ID.
    const { _id, ...duplicate } = subtasks[index];
    const rowKey = nextRowKey.current;
    nextRowKey.current += 1;
    setSubtasks([...subtasks, { ...duplicate, rowKey, touched: {} }]);
  };

  const validateSubtasks = () => {
    // Recheck all fields and the local day, including confirmation after midnight.
    return (
      subtasks.length > 0 &&
      !subtasks.some(subtask =>
        Object.values(getSubtaskErrors(subtask, getLocalDate())).some(Boolean),
      )
    );
  };

  // Centralized API Function ---
  const assignTasks = async (isAutoAssigned, savedId, onAssignmentSuccess) => {
    if (identityBlockedRef.current || !savedId || !validateSubtasks()) return;
    if (!isAutoAssigned && (savingInFlightRef.current || hasUnsavedSubtasks)) return;
    const payload = {
      lessonPlanId: savedId,
      assignmentDate: new Date().toISOString().split('T')[0],
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
      notify('Authentication error: No user token found. Please log in again.', 'error');
      return;
    }

    if (assigningInFlightRef.current) {
      return;
    }

    assigningInFlightRef.current = true;

    const progressToastId = toast.info('Assigning tasks…', {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });

    setIsAssigning(true);

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

      const assignedCount = Number(data?.assignedCount ?? data?.assigned_count ?? 0);
      const skippedCount = Number(data?.skippedCount ?? data?.skipped_count ?? 0);

      if (skippedCount > 0) {
        notify(
          `${assignedCount} tasks assigned, ${skippedCount} skipped due to unmet prerequisites.`,
          'warning',
        );
      } else {
        notify(`${assignedCount} tasks assigned successfully.`, 'success');
      }

      // On success, call the callback to update the UI.
      if (onAssignmentSuccess) {
        onAssignmentSuccess();
      }
      // Refreshes the log table after a successful assignment ---
      fetchLogs(savedId).catch(error => console.error('Error fetching logs:', error));
    } catch (error) {
      // This will now catch both network errors and the errors we throw manually.
      notify(`Task assignment failed. ${error.message}`, 'error');
      console.error('Final Assignment Error:', error.message);
      // Don't show a generic notification here if a specific one was already shown
    } finally {
      toast.dismiss(progressToastId);
      assigningInFlightRef.current = false;
      setIsAssigning(false);
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
    setSubmissionAttempted(true);
    if (
      identityBlockedRef.current ||
      savingInFlightRef.current ||
      assigningInFlightRef.current ||
      !lessonPlanId ||
      hasUnsavedSubtasks ||
      !validateSubtasks()
    ) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleSaveClick = async () => {
    setSubmissionAttempted(true);
    if (
      !canSave ||
      identityBlockedRef.current ||
      savingInFlightRef.current ||
      assigningInFlightRef.current ||
      Object.values(getMetadataErrors(metadata)).some(Boolean) ||
      !validateSubtasks()
    )
      return;
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Authentication error: No user token found. Please log in again.', 'error');
      return;
    }
    savingInFlightRef.current = true;
    setIsSaving(true);
    let savedId;
    let persistenceSucceeded = false;
    let saveConflict = false;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_APIENDPOINT}/educator/lesson-plans${
          lessonPlanId ? `/${lessonPlanId}` : ''
        }`,
        {
          method: lessonPlanId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token },
          body: JSON.stringify({ ...metadata, subTasks }),
        },
      );
      // Conflict handling must not depend on parsing the response body. Keep local
      // identities and edits, but block stale retries until the plan is reconciled.
      if (response.status === 409) {
        saveConflict = true;
        throw new Error('Lesson plan conflict');
      }
      persistenceSucceeded = response.ok;
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Please try again.');
      if (!data?._id) throw new Error('Save response is missing the lesson plan ID.');
      setLessonPlanId(data._id);
      if (
        !Array.isArray(data.subTasks) ||
        data.subTasks.length !== subTasks.length ||
        data.subTasks.some(
          (row, index) =>
            typeof row?._id !== 'string' ||
            !/^[a-f\d]{24}$/i.test(row._id) ||
            (subTasks[index]._id && subTasks[index]._id.toLowerCase() !== row._id.toLowerCase()),
        ) ||
        new Set(data.subTasks.map(row => row._id.toLowerCase())).size !== subTasks.length
      ) {
        throw new Error('Save response is missing subtask IDs.');
      }
      // Responses retain request order. Local row keys keep IDs attached to the
      // submitted rows even if a row is edited, added or deleted while saving.
      const savedRows = subTasks.map(({ _id, ...row }, index) => ({
        _id: data.subTasks[index]._id,
        ...row,
      }));
      const idsByRow = new Map(subtasks.map((row, index) => [row.rowKey, savedRows[index]._id]));
      setSubtasks(current =>
        current.map(row =>
          idsByRow.has(row.rowKey) ? { ...row, _id: idsByRow.get(row.rowKey) } : row,
        ),
      );
      setSavedSubtasks(JSON.stringify(savedRows));
      savedId = data._id;
      notify('Lesson plan saved successfully.');
    } catch (error) {
      if (saveConflict) {
        identityBlockedRef.current = true;
        const message =
          'The lesson plan on the server changed. Your local form values and saved identities have been preserved. Saving and assignment are blocked until this form is reconciled with the current server plan. Contact support before continuing.';
        setIdentityError(message);
        notify(message, 'error');
      } else if (persistenceSucceeded) {
        // A successful write must never be retried with unverified row identities.
        // Keep the saved plan ID and local edits, but fail closed until recovery exists.
        identityBlockedRef.current = true;
        const message =
          'The lesson plan was saved, but its subtask identities could not be verified. Saving and assignment are blocked. Contact support to recover the saved plan before continuing.';
        setIdentityError(message);
        notify(message, 'error');
      } else {
        notify(`Lesson plan save failed. ${error.message}`, 'error');
      }
    }
    // Use the returned ID directly: state updates are asynchronous. Assignment failure
    // leaves the saved document ID intact and is reported separately by assignTasks.
    try {
      if (savedId)
        await assignTasks(true, savedId, () => {
          setAssignmentStatus(`Auto-assigned at ${new Date().toLocaleTimeString()}`);
        });
    } finally {
      savingInFlightRef.current = false;
      setIsSaving(false);
    }
  };
  // -----------------------------
  //  Function to handle the successful assignment ---
  const handleManualAssignmentSuccess = () => {
    const timestamp = new Date().toLocaleTimeString();
    setAssignmentStatus(`Manually assigned at ${timestamp}`);
  };

  return (
    <div
      className={styles.lessonPlanContainer}
      onPointerDownCapture={revealSubmissionErrors}
      onClickCapture={revealSubmissionErrors}
    >
      {/* Title Bar and Save Button */}
      {/* <div className="d-flex justify-content-between align-items-center mb-4"> */}
      {/* <div className={styles.contentBox}> */}
      <div className={styles.titleBox}>
        <h2
          className={`h2 font-weight-bold text-left mb-0 ${styles.pageTitle} ${styles.titleHeading}`}
        >
          Lesson Plan Builder
        </h2>
        <div className={styles.titleActions}>
          {assignmentStatus && (
            <span
              className={
                assignmentStatus.startsWith('Manually')
                  ? styles.assignmentStatusManual
                  : styles.assignmentStatusAuto
              }
            >
              {assignmentStatus}
            </span>
          )}
          <button
            type="button"
            data-validation-action="save"
            onClick={() => {
              handleSaveClick().catch(error =>
                notify(`Unexpected save error: ${error.message}`, 'error'),
              );
            }}
            className={styles.headerSaveBtn}
            disabled={
              !canSave ||
              Boolean(identityError) ||
              isSaving ||
              isAssigning ||
              hasInvalidMetadata ||
              hasInvalidSubtasks
            }
          >
            Save Lesson Plan
          </button>
        </div>
      </div>

      {identityError && <p role="alert">{identityError}</p>}
      <div className={styles.grayBackgroundWrapper}>
        <div className={styles.contentBox}>
          <div className={styles.metadataGrid}>
            {[
              ['title', 'Title', 'text'],
              ['startDate', 'Start Date', 'date'],
              ['endDate', 'End Date', 'date'],
              ['theme', 'Theme', 'text'],
              ['description', 'Description', 'text'],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label htmlFor={`plan-${key}`}>{label}</label>
                <input
                  id={`plan-${key}`}
                  type={type}
                  className="form-control"
                  value={metadata[key]}
                  required={['title', 'startDate', 'endDate'].includes(key)}
                  aria-invalid={Boolean(visibleMetadataErrors[key])}
                  aria-describedby={visibleMetadataErrors[key] ? `plan-${key}-error` : undefined}
                  onBlur={() => setTouchedMetadata(previous => ({ ...previous, [key]: true }))}
                  onChange={event => {
                    setTouchedMetadata(previous => ({ ...previous, [key]: true }));
                    setMetadata({ ...metadata, [key]: event.target.value });
                  }}
                />
                <ValidationMessage
                  id={`plan-${key}-error`}
                  error={visibleMetadataErrors[key] || ''}
                />
              </div>
            ))}
          </div>
          {!subtasks.length && submissionAttempted && (
            <p role="alert">At least one subtask is required.</p>
          )}
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
                  <tr key={subtask.rowKey} className="border-bottom">
                    <td className={`p-3 ${styles.validationCell}`}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={subtask.name}
                        onBlur={() => touchSubtask(i, 'name')}
                        onChange={e => updateSubtask(i, 'name', e.target.value)}
                        aria-label={`Subtask ${i + 1} name`}
                        aria-invalid={!!visibleSubtaskErrors[i].name}
                        aria-describedby={`name-error-${i}`}
                      />
                      <ValidationMessage
                        id={`name-error-${i}`}
                        error={visibleSubtaskErrors[i].name}
                      />
                    </td>
                    <td className={`p-3 ${styles.validationCell}`}>
                      <select
                        className="form-select form-control form-control-sm"
                        value={subtask.type}
                        onBlur={() => touchSubtask(i, 'type')}
                        onChange={e => updateSubtask(i, 'type', e.target.value)}
                        aria-label={`Subtask ${i + 1} type`}
                        aria-invalid={!!visibleSubtaskErrors[i].type}
                        aria-describedby={`type-error-${i}`}
                      >
                        <option value="">Select a type</option>
                        {SUBTASK_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <ValidationMessage
                        id={`type-error-${i}`}
                        error={visibleSubtaskErrors[i].type}
                      />
                    </td>
                    <td className={`p-3 position-relative ${styles.validationCell}`}>
                      {/* Date Picker Input */}
                      <input
                        type="date"
                        className={`form-control form-control-sm pr-4 ${styles.inputNarrow}`}
                        value={subtask.dueDate}
                        min={today}
                        onBlur={() => touchSubtask(i, 'dueDate')}
                        aria-label={`Subtask ${i + 1} due date`}
                        aria-invalid={!!visibleSubtaskErrors[i].dueDate}
                        aria-describedby={`due-date-error-${i}`}
                        onChange={e => {
                          const { value, validity } = e.target;
                          // Native date inputs can report malformed input as an empty value.
                          setSubtasks(previous =>
                            previous.map((row, index) =>
                              index === i
                                ? {
                                    ...row,
                                    dueDate: value,
                                    dueDateBadInput: validity.badInput,
                                    touched: { ...row.touched, dueDate: true },
                                  }
                                : row,
                            ),
                          );
                        }}
                      />
                      <ValidationMessage
                        id={`due-date-error-${i}`}
                        error={visibleSubtaskErrors[i].dueDate}
                      />
                    </td>
                    <td className={`p-3 ${styles.validationCell}`}>
                      <input
                        type="text"
                        className={`form-control form-control-sm text-center ${styles.inputNarrow}`}
                        value={subtask.passMark}
                        onBlur={() => touchSubtask(i, 'passMark')}
                        onChange={e => updateSubtask(i, 'passMark', e.target.value)}
                        aria-label={`Subtask ${i + 1} pass mark`}
                        aria-invalid={!!visibleSubtaskErrors[i].passMark}
                        aria-describedby={`pass-mark-error-${i}`}
                      />
                      {/* Keep the live region mounted and associate its message with the input. */}
                      <ValidationMessage
                        id={`pass-mark-error-${i}`}
                        error={visibleSubtaskErrors[i].passMark}
                      />
                    </td>
                    <td className={`p-3 ${styles.validationCell}`}>
                      <input
                        type="text"
                        className={`form-control form-control-sm text-center ${styles.inputNarrow}`}
                        value={subtask.weight}
                        onBlur={() => touchSubtask(i, 'weight')}
                        onChange={e => updateSubtask(i, 'weight', e.target.value)}
                        aria-label={`Subtask ${i + 1} weight`}
                        aria-invalid={!!visibleSubtaskErrors[i].weight}
                        aria-describedby={`weight-error-${i}`}
                      />
                      <ValidationMessage
                        id={`weight-error-${i}`}
                        error={visibleSubtaskErrors[i].weight}
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
              </tbody>
              <tfoot>
                {/* Total Row */}
                <tr>
                  <td
                    className="p-3 font-weight-bold text-secondary"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    Total
                  </td>
                  <td colSpan={4} style={{ backgroundColor: 'transparent' }}></td>
                  <td
                    className="p-3 font-weight-bold text-right text-secondary"
                    colSpan={1}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {totalWeight}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <fieldset className={styles.actionRow}>
            <legend className={styles.visuallyHidden}>Lesson plan actions</legend>
            <button onClick={addSubtask} className={styles.addSubtaskBtn}>
              Add subtask +
            </button>
            {canManageAssignments && (
              <button
                type="button"
                data-validation-action="assign"
                onClick={handleAssignClick}
                className={styles.assignLsnBtn}
                disabled={
                  Boolean(identityError) ||
                  isSaving ||
                  isAssigning ||
                  hasInvalidSubtasks ||
                  !lessonPlanId ||
                  hasUnsavedSubtasks
                }
              >
                Assign Tasks to Students
              </button>
            )}
          </fieldset>
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
          lessonPlanId={lessonPlanId}
          isAssigning={isAssigning}
          // Pass the assignTasks function to the modal
          // assignTasks={assignTasks}
          assignTasks={isAuto => assignTasks(isAuto, lessonPlanId, handleManualAssignmentSuccess)}
        />
      )}
    </div>
  );
}
