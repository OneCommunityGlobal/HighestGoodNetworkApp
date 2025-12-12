// import React, { useState } from 'react';

// function DescriptionSection() {
//   // State to manage active tab
//   const [activeTab, setActiveTab] = useState('Description');

//   // Mock data for the Description section
//   const descriptionData = [
//     'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
//     'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
//     'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
//   ];

//   return (
//     <div className="p-4">
//       {/* Header Tabs */}
//       <div className="flex space-x-4 border-b-2 border-gray-300 mb-4">
//         <button
//           onClick={() => setActiveTab('Description')}
//           className={`px-4 py-2 font-bold ${
//             activeTab === 'Description'
//               ? 'text-blue-500 border-b-2 border-blue-500'
//               : 'text-gray-500'
//           }`}
//         >
//           Description
//         </button>
//         <button className="px-4 py-2 font-bold text-gray-500" disabled>
//           Participates
//         </button>
//         <button className="px-4 py-2 font-bold text-gray-500" disabled>
//           Comments
//         </button>
//         <button className="px-4 py-2 font-bold text-gray-500" disabled>
//           FAQs
//         </button>
//       </div>

//       {/* Tab Content */}
//       {activeTab === 'Description' && (
//         <div>
//           {descriptionData.map((item, index) => (
//             <p key={index} className="mb-2 text-gray-700">
//               {item}
//             </p>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default DescriptionSection;

import { useState } from 'react';
import styles from './DescriptionSection.module.css'; // Import external CSS file

function DescriptionSection({ darkMode }) {
  const [activeTab, setActiveTab] = useState('Description');

  const tabContent = {
    Description: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'note: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    ],
    Participates: [],
    Comments: [],
    FAQs: [],
  };

  return (
    <div className={`${styles['description-section']} ${darkMode ? styles['dark-mode'] : ''}`}>
      <div className={styles.tabs}>
        {Object.keys(tabContent).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`${styles['tab-button']} ${activeTab === tab ? styles.active : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles['tab-content']}>
        {tabContent[activeTab]?.map(item => (
          <p key={`${activeTab}-${item}`} className={styles['description-paragraph']}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export default DescriptionSection;
