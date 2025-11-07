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

import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styles from './DescriptionSection.module.css';

const DEFAULT_TAB_CONTENT = {
  Description: [
    'This is a comprehensive event designed to bring together community members for an engaging and educational experience. The event features interactive sessions, hands-on activities, and opportunities for networking and collaboration.',
    "Our experienced organizers have carefully planned every aspect of this event to ensure maximum value for all participants. Whether you're a beginner or have prior experience, there's something for everyone.",
    'The event will cover various topics including best practices, industry trends, and practical applications. Participants will have the opportunity to ask questions, share experiences, and learn from both instructors and fellow attendees.',
    'Note: Please arrive 15 minutes early to complete registration and get settled. All necessary materials will be provided, but feel free to bring a notebook for taking notes.',
  ],
  Participates: [
    'John Doe - Project Manager',
    'Jane Smith - Developer',
    'Alice Brown - Designer',
    'Bob Wilson - Consultant',
    'Emily Davis - Analyst',
  ],
  Comments: [
    'Looking forward to this event! The agenda looks very comprehensive.',
    'This will be my first time attending. Any tips for newcomers?',
    'Great to see such a diverse group of participants registered.',
    'The location is perfect and easily accessible by public transport.',
  ],
  FAQs: [
    'Q: What should I bring to the event?\nA: Just bring yourself and a positive attitude! All materials will be provided.',
    'Q: Is parking available?\nA: Yes, free parking is available in the adjacent lot.',
    'Q: Will there be refreshments?\nA: Light refreshments and coffee will be provided during breaks.',
    'Q: Can I bring a guest?\nA: Unfortunately, this event is for registered participants only.',
  ],
};

function DescriptionSection({ activity, registrants = [] }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [activeTab, setActiveTab] = useState('Description');

  const descriptionParagraphs = useMemo(() => {
    if (Array.isArray(activity?.descriptionParagraphs) && activity.descriptionParagraphs.length) {
      return activity.descriptionParagraphs;
    }
    if (typeof activity?.description === 'string') {
      return activity.description
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    }
    return DEFAULT_TAB_CONTENT.Description;
  }, [activity]);

  const participantEntries = useMemo(() => {
    const baseParticipants = Array.isArray(activity?.participants) && activity.participants.length
      ? activity.participants
      : DEFAULT_TAB_CONTENT.Participates;

    const dynamicEntries = registrants
      .map(reg => {
        if (!reg?.name) return null;
        const trimmedName = reg.name.trim();
        if (!trimmedName) return null;
        const title = reg.jobTitle && reg.jobTitle !== 'Participant' ? ` - ${reg.jobTitle}` : '';
        const label = `${trimmedName}${title}`;
        return {
          label,
          isNew: true,
          key: label.toLowerCase(),
        };
      })
      .filter(Boolean);

    const baseEntries = baseParticipants
      .map(participant => {
        const label = typeof participant === 'string' ? participant.trim() : '';
        if (!label) return null;
        return {
          label,
          isNew: false,
          key: label.toLowerCase(),
        };
      })
      .filter(Boolean);

    const combined = [...dynamicEntries, ...baseEntries];
    const seen = new Set();

    return combined
      .filter(entry => {
        if (seen.has(entry.key)) return false;
        seen.add(entry.key);
        return true;
      })
      .map(({ label, isNew }) => ({ label, isNew }));
  }, [activity?.participants, registrants]);

  const commentEntries = useMemo(() => {
    if (Array.isArray(activity?.comments) && activity.comments.length) {
      return activity.comments;
    }
    return DEFAULT_TAB_CONTENT.Comments;
  }, [activity]);

  const faqEntries = useMemo(() => {
    if (Array.isArray(activity?.faqs) && activity.faqs.length) {
      return activity.faqs
        .map(faq => {
          if (typeof faq === 'string') return faq;
          if (faq?.question && faq?.answer) {
            return `Q: ${faq.question}\nA: ${faq.answer}`;
          }
          return null;
        })
        .filter(Boolean);
    }
    return DEFAULT_TAB_CONTENT.FAQs;
  }, [activity]);

  const tabContent = useMemo(
    () => ({
      Description: descriptionParagraphs,
      Participates: participantEntries,
      Comments: commentEntries,
      FAQs: faqEntries,
    }),
    [descriptionParagraphs, participantEntries, commentEntries, faqEntries],
  );

  return (
    <div
      className={`${styles.descriptionSection} ${darkMode ? styles.descriptionSectionDark : ''}`}
    >
      <div className={`${styles.tabs} ${darkMode ? styles.tabsDark : ''}`}>
        {Object.keys(tabContent).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`${styles.tabButton} ${darkMode ? styles.tabButtonDark : ''} ${
              activeTab === tab
                ? `${styles.tabButtonActive} ${darkMode ? styles.tabButtonActiveDark : ''}`
                : ''
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {tabContent[activeTab]?.length > 0 ? (
          tabContent[activeTab].map((item, index) => {
            const isParticipantTab = activeTab === 'Participates';
            const label = typeof item === 'string' ? item : item.label;
            const isNewParticipant =
              isParticipantTab && typeof item === 'object' && item.isNew;

            const paragraphClasses = [styles.descriptionParagraph];
            if (darkMode) paragraphClasses.push(styles.descriptionParagraphDark);
            if (isParticipantTab) {
              paragraphClasses.push(styles.participantEntry);
              if (darkMode) paragraphClasses.push(styles.participantEntryDark);
              if (isNewParticipant) paragraphClasses.push(styles.participantEntryNew);
            }

            return (
              <p
                key={`${activeTab}-${index}`}
                className={paragraphClasses.filter(Boolean).join(' ')}
              >
                <span>{label}</span>
                {isNewParticipant ? (
                  <span
                    className={`${styles.participantBadge} ${
                      darkMode ? styles.participantBadgeDark : ''
                    }`}
                  >
                    New
                  </span>
                ) : null}
              </p>
            );
          })
        ) : (
          <div className={`${styles.emptyState} ${darkMode ? styles.emptyStateDark : ''}`}>
            No {activeTab.toLowerCase()} available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

export default DescriptionSection;
