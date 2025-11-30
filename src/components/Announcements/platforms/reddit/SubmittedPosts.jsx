import { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

export default function SubmittedPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchSubmittedPosts();
  }, []);

  const fetchSubmittedPosts = async () => {
    try {
      const res = await axios.get(`${ENDPOINTS.AP_REDDIT_POST}`, {
        params: { status: 'submitted' },
      });
      setPosts(res.data.posts);
    } catch (error) {
      toast.error('Unable to load scheduled posts for Reddit');
    }
  };

  const formatSchedule = dateToFormat => {
    const d = new Date(dateToFormat);
    const options = { month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  return (
    <>
      <div>
        <p>
          <strong>Scheduled Posts for Reddit</strong>
        </p>
        {posts.length > 0 ? (
          <ul>
            {posts.map(p => (
              <li key={p._id}>
                {p.scheduled_at ? formatSchedule(p.scheduled_at) : 'No Scheduled time'}
                {` - ${p.title}`}
              </li>
            ))}
          </ul>
        ) : (
          <div>No posts found</div>
        )}
      </div>
    </>
  );
}
