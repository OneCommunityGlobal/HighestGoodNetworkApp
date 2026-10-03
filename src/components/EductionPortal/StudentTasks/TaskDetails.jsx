import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import styles from './TaskDetails.module.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import CommentBox from '../Tasks/CommentBox';
import CommentList from '../Tasks/CommentList';
import {
  getStudentTaskComments,
  postTaskComment,
  deleteTaskComment,
} from '../../../services/educationService';

const TaskDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const authUser = useSelector(state => state.auth?.user);
  const currentUserId = authUser?.userid || null;

  const clickedTask = location.state?.task;

  const fallbackTask = useMemo(() => {
    const mocks = {
      '1': {
        id: '1',
        title: 'Activity - 1 : Technology, Art, Trades, Health',
        subtitle: 'Technology / Art / Trades / Health',
        overallProgress: 25,
        taskProgress: 25,
      },
      '2': {
        id: '2',
        title: 'Activity - 2 : Math, Science, Innovation',
        subtitle: 'Math / Science / Innovation',
        overallProgress: 33,
        taskProgress: 50,
      },
      '3': {
        id: '3',
        title: 'Activity - 3 : Social Sciences, English, Values',
        subtitle: 'Social Sciences / English / Values',
        overallProgress: 33,
        taskProgress: 50,
      },
    };
    return mocks[id] ?? mocks['3'];
  }, [id]);

  const task = clickedTask ?? fallbackTask;
  const taskId = task.id;

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

  const mapApiComment = c => ({
    id: c.commentId,
    content: c.commentText,
    author: c.userId === currentUserId ? 'You' : c.userId,
    userId: c.userId,
    createdAt: new Date(c.created_at),
  });

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const data = await getStudentTaskComments(taskId);
      setComments(data.map(mapApiComment));
    } catch (err) {
      setCommentsError('Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentSubmit = async content => {
    try {
      await postTaskComment(taskId, content);
      await fetchComments();
    } catch (err) {
      setCommentsError('Failed to post comment.');
    }
  };

  const handleDeleteComment = async commentId => {
    try {
      await deleteTaskComment(taskId, commentId);
      await fetchComments();
    } catch (err) {
      setCommentsError('Failed to delete comment.');
    }
  };

  const chartData = [
    { name: 'Unit 1: Social Sciences Paper Draft', value: 40 },
    { name: 'Unit 2: Values Integration', value: 30 },
    { name: 'Unit 3: English Opening', value: 15 },
    { name: '4 Revisions & Finalization', value: 15 },
  ];

  const COLORS = ['#A3A3A3', '#D4D4D8', '#E5E7EB', '#9CA3AF'];

  return (
    <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
      <div className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}>
        <header className={styles.header}>
          <h2 className={styles.title}>{task.title}</h2>
          <p className={styles.subtitle}>{task.subtitle}</p>
          <hr className={styles.divider} />
        </header>

        <div className={styles.mainSection}>
          <div className={styles.chartSection}>
            <ResponsiveContainer width={420} height={420}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="35%"
                  outerRadius="80%"
                  paddingAngle={1}
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {chartData.map(entry => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={COLORS[chartData.indexOf(entry) % COLORS.length]}
                      stroke="#fff"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  wrapperStyle={{ fontSize: '0.75rem', color: 'inherit' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            className={`${styles.progressSection} ${darkMode ? styles.progressSectionDark : ''}`}
          >
            <h4 className={styles.progressTitle}>Progress Bar</h4>

            <div className={styles.progressRow}>
              <span>Overall Lesson Plan</span>
              <span>{task.overallProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${task.overallProgress}%` }} />
            </div>

            <div className={styles.progressRow}>
              <span>This Task</span>
              <span>{task.taskProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFillDark} style={{ width: `${task.taskProgress}%` }} />
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.dropdownSection}>
            <div className={styles.dropdownGroup}>
              <select className={styles.dropdown}>
                <option>Unit 1: Social Sciences Paper Draft (40%)</option>
                <option>Unit 2: Values Integration (30%)</option>
                <option>Unit 3: English Opening (15%)</option>
              </select>

              <select className={styles.dropdown}>
                <option>Outline the research paper structure (5%)</option>
                <option>Conduct in-depth research (10%)</option>
              </select>
            </div>

            <textarea
              className={styles.textbox}
              placeholder="Trades related trade from the Arts and Trades Subject Page"
            />
          </div>
        </div>

        <section className={styles.commentsSection}>
          {commentsError && <p style={{ color: 'red' }}>{commentsError}</p>}
          <CommentBox
            onSubmit={handleCommentSubmit}
            placeholder="Please enter your comments/Queries here"
          />
          <CommentList
            comments={comments}
            loading={commentsLoading}
            onDeleteComment={handleDeleteComment}
            currentUserId={currentUserId}
          />
        </section>
      </div>
    </div>
  );
};

export default TaskDetails;
