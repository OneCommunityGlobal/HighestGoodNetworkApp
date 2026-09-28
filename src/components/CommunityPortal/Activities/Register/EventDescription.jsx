import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from './DescriptionSection.module.css';

const DEFAULT_TAB_CONTENT = {
  Description: [
    'This is a comprehensive event designed to bring together community members for an engaging and educational experience. The event features interactive sessions, hands-on activities, and opportunities for networking and collaboration.',
    "Our experienced organizers have carefully planned every aspect of this event to ensure maximum value for all participants. Whether you're a beginner or have prior experience, there's something for everyone.",
    'The event will cover various topics including best practices, industry trends, and practical applications. Participants will have the opportunity to ask questions, share experiences, and learn from both instructors and fellow attendees.',
    'Note: Please arrive 15 minutes early to complete registration and get settled. All necessary materials will be provided, but feel free to bring a notebook for taking notes.',
  ],
  Participants: [
    'John Doe - Project Manager',
    'Jane Smith - Developer',
    'Alice Brown - Designer',
    'Bob Wilson - Consultant',
    'Emily Davis - Analyst',
  ],
  Comments: [
    { author: 'John Doe', comment: 'Looking forward to this event!' },
    { author: 'Jane Smith', comment: 'This will be my first time attending.' },
    { author: 'Alice Brown', comment: 'Excited to collaborate with everyone.' },
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
    if (typeof activity?.description === 'string' && activity.description.trim()) {
      return activity.description
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);
    }
    return DEFAULT_TAB_CONTENT.Description;
  }, [activity]);

  const participantEntries = useMemo(() => {
    const baseParticipants =
      Array.isArray(activity?.participants) && activity.participants.length
        ? activity.participants
        : DEFAULT_TAB_CONTENT.Participants;

    const dynamicEntries = registrants
      .map(reg => {
        if (!reg?.name?.trim()) return null;
        const title = reg.jobTitle && reg.jobTitle !== 'Participant' ? ` - ${reg.jobTitle}` : '';
        const label = `${reg.name.trim()}${title}`;
        return { label, isNew: true, key: label.toLowerCase() };
      })
      .filter(Boolean);

    const baseEntries = baseParticipants
      .map(participant => {
        const label = typeof participant === 'string' ? participant.trim() : '';
        if (!label) return null;
        return { label, isNew: false, key: label.toLowerCase() };
      })
      .filter(Boolean);

    const seen = new Set();
    return [...dynamicEntries, ...baseEntries]
      .filter(entry => {
        if (seen.has(entry.key)) return false;
        seen.add(entry.key);
        return true;
      })
      .map(({ label, isNew }) => ({ label, isNew }));
  }, [activity?.participants, registrants]);

  const participantNameSet = useMemo(
    () => new Set(participantEntries.map(p => p.label.split(' - ')[0].toLowerCase())),
    [participantEntries],
  );

  const commentEntries = useMemo(() => {
    const baseComments =
      Array.isArray(activity?.comments) && activity.comments.length
        ? activity.comments
        : DEFAULT_TAB_CONTENT.Comments;

    return baseComments.map((comment, idx) => {
      if (typeof comment !== 'object') {
        return { comment, author: `User ${idx + 1}`, isParticipant: false };
      }
      return {
        comment: comment.comment,
        author: comment.author,
        isParticipant: participantNameSet.has(comment.author?.toLowerCase().trim()),
      };
    });
  }, [activity?.comments, participantNameSet]);

  const faqEntries = useMemo(() => {
    if (Array.isArray(activity?.faqs) && activity.faqs.length) {
      return activity.faqs
        .map(faq => {
          if (typeof faq === 'string') return faq;
          if (faq?.question && faq?.answer) return `Q: ${faq.question}\nA: ${faq.answer}`;
          return null;
        })
        .filter(Boolean);
    }
    return DEFAULT_TAB_CONTENT.FAQs;
  }, [activity?.faqs]);

  const tabContent = useMemo(
    () => ({
      Description: descriptionParagraphs,
      Participants: participantEntries,
      Comments: commentEntries,
      FAQs: faqEntries,
    }),
    [descriptionParagraphs, participantEntries, commentEntries, faqEntries],
  );

  const keyUsageMap = new Map();
  const buildUniqueKey = rawKey => {
    const baseKey = String(rawKey || 'item')
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/gu, '-');
    const seenCount = keyUsageMap.get(baseKey) || 0;
    keyUsageMap.set(baseKey, seenCount + 1);
    return seenCount === 0 ? baseKey : `${baseKey}-${seenCount + 1}`;
  };

  const renderFaqItem = (label, key) => {
    const lines = label.split('\n');
    const question = lines
      .find(l => l.startsWith('Q:'))
      ?.replaceAll('Q:', '')
      .trim();
    const answer = lines
      .find(l => l.startsWith('A:'))
      ?.replaceAll('A:', '')
      .trim();
    const faqKey = buildUniqueKey(`faq-${question || 'unknown'}-${answer || 'unknown'}`);
    return (
      <div
        key={key || faqKey}
        className={`${styles.faqCard} ${darkMode ? styles.faqCardDark : ''}`}
      >
        <div className={styles.faqQuestionRow}>
          <span className={styles.faqQBadge}>Q</span>
          <p className={`${styles.faqQuestionText} ${darkMode ? styles.faqQuestionTextDark : ''}`}>
            {question}
          </p>
        </div>
        <div className={styles.faqAnswerRow}>
          <span className={styles.faqABadge}>A</span>
          <p className={`${styles.faqAnswerText} ${darkMode ? styles.faqAnswerTextDark : ''}`}>
            {answer}
          </p>
        </div>
      </div>
    );
  };

  const renderCommentItem = item => {
    const commentText = item.comment || item;
    const commentAuthor = item.author || 'User';
    const commentKey = buildUniqueKey(`comment-${commentAuthor}-${commentText}`);
    const initials = commentAuthor
      .split(' ')
      .map(s => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <div
        key={commentKey}
        className={`${styles.commentEntry} ${darkMode ? styles.commentEntryDark : ''}`}
      >
        <div className={styles.commentAvatar}>
          <span>{initials}</span>
        </div>
        <div className={styles.commentContent}>
          <p className={`${styles.commentAuthor} ${darkMode ? styles.commentAuthorDark : ''}`}>
            {commentAuthor}
          </p>
          <p className={`${styles.commentText} ${darkMode ? styles.commentTextDark : ''}`}>
            {commentText}
          </p>
        </div>
      </div>
    );
  };

  const renderParticipantItem = (label, isNewParticipant) => {
    const nameOnly = label.split(' - ')[0];
    const participantKey = buildUniqueKey(`participant-${nameOnly}-${label}`);
    const initials = nameOnly
      .split(' ')
      .map(s => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <div
        key={participantKey}
        className={`${styles.participantRow} ${darkMode ? styles.participantRowDark : ''}`}
      >
        <div
          className={`${styles.participantAvatar} ${darkMode ? styles.participantAvatarDark : ''}`}
        >
          {initials}
        </div>
        <div className={styles.participantInfo}>
          <span className={styles.participantName}>{label}</span>
          {isNewParticipant && (
            <span
              className={`${styles.participantBadge} ${
                darkMode ? styles.participantBadgeDark : ''
              }`}
            >
              New
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderTabItem = item => {
    const isParticipantTab = activeTab === 'Participants';
    const isCommentTab = activeTab === 'Comments';
    const isFaqTab = activeTab === 'FAQs';
    const label = typeof item === 'string' ? item : item.label;
    const isNewParticipant = isParticipantTab && typeof item === 'object' && item.isNew;

    if (isFaqTab) return renderFaqItem(label);
    if (isCommentTab) return renderCommentItem(item);
    if (isParticipantTab) return renderParticipantItem(label, isNewParticipant);

    const descriptionKey = buildUniqueKey(`description-${label}`);
    return (
      <p
        key={descriptionKey}
        className={`${styles.descriptionParagraph} ${
          darkMode ? styles.descriptionParagraphDark : ''
        }`}
      >
        {label}
      </p>
    );
  };

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
          tabContent[activeTab].map(item => renderTabItem(item))
        ) : (
          <div className={`${styles.emptyState} ${darkMode ? styles.emptyStateDark : ''}`}>
            No {activeTab.toLowerCase()} available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

DescriptionSection.propTypes = {
  activity: PropTypes.shape({
    descriptionParagraphs: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    participants: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    comments: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          author: PropTypes.string,
          comment: PropTypes.string,
        }),
      ]),
    ),
    faqs: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          question: PropTypes.string,
          answer: PropTypes.string,
        }),
      ]),
    ),
  }),
  registrants: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      jobTitle: PropTypes.string,
    }),
  ),
};

export default DescriptionSection;
