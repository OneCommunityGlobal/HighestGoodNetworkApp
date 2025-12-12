import './CommentSection.css';

function CommentSection({ comments }) {
  return (
    <div>
      <div className="activity-comments-section">
        {comments.map(comment => (
          <div key={comment.id} className="activity-comment">
            <div className="activity-comment-user">
              <span className={`activity-icon ${comment.id % 2 === 0 ? 'purple' : 'blue'}`}>
                {comment.name[0]}
              </span>
            </div>
            <div className="activity-comment-text">
              {comment.comment}
              <div className="activity-comment-footer">
                <span>{comment.name} - </span>
                <span>{comment.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
