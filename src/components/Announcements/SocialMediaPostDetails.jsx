import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { Label, Input, Button } from 'reactstrap';
import { fetchPosts, updatePost } from '../../actions/sendSocialMediaPosts';

function SocialMediaPostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [editableContent, setEditableContent] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableTime, setEditableTime] = useState('');
  const [imageBase64, setImageBase64] = useState(''); // State for Base64 image

  useEffect(() => {
    const getPost = async () => {
      try {
        const posts = await fetchPosts();
        if (!posts || posts.length === 0) {
          return;
        }

        const foundPost = posts.find(p => String(p._id) === String(postId));

        if (foundPost) {
          setPost(foundPost);
          setEditableContent(foundPost.textContent || '');

          const formattedDate = foundPost.scheduledDate || '';
          const formattedTime = foundPost.scheduledTime?.padStart(5, '0') || '';

          setEditableDate(formattedDate);
          setEditableTime(formattedTime);
          setImageBase64(foundPost.base64Srcs?.[0] || '');
        }
      } catch (error) {
        toast.error('Error fetching post details:', error);
      }
    };

    getPost();
  }, [postId]);

  // Function to handle new image upload and convert to Base64
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]); // Extract Base64 string (without data type prefix)
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle Update API Call
  const handleUpdatePost = async () => {
    const updatedPostData = {
      _id: postId,
      textContent: editableContent,
      scheduledDate: editableDate,
      scheduledTime: editableTime,
      base64Srcs: imageBase64 ? [imageBase64] : [], // Ensure it's an array
    };

    try {
      const result = await updatePost(postId, updatedPostData);
      if (result) {
        toast.success('Post updated successfully!');
      } else {
        toast.error('Failed to update post.');
      }
    } catch (error) {
      toast.error('Error updating post.');
    }
  };

  if (!post)
    return (
      <p style={{ textAlign: 'center', fontSize: '18px', color: 'gray' }}>
        Loading post details...
      </p>
    );

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Edit Post Details</h2>

      <Label for="postContent">Post Content</Label>
      <Input
        type="textarea"
        id="postContent"
        value={editableContent}
        onChange={e => setEditableContent(e.target.value)}
      />

      <Label for="postDate">Scheduled Date</Label>
      <Input
        type="date"
        id="postDate"
        value={editableDate}
        onChange={e => setEditableDate(e.target.value)}
      />

      <Label for="postTime">Scheduled Time</Label>
      <Input
        type="time"
        id="postTime"
        value={editableTime}
        onChange={e => setEditableTime(e.target.value)}
      />

      <Label for="postImage">Post Image</Label>
      {imageBase64 ? (
        <img
          src={`${imageBase64}`}
          alt="Post Image"
          style={{
            width: '80%',
            height: '70%',
            maxWidth: '300px',
            marginBottom: '10px',
            display: 'block',
          }}
        />
      ) : (
        <p style={{ color: 'gray' }}>No Image Uploaded</p>
      )}

      <Input type="file" accept="image/*" onChange={handleImageUpload} />

      <Button color="primary" className="mt-3" onClick={handleUpdatePost}>
        Save Changes
      </Button>
    </div>
  );
}

export default SocialMediaPostDetails;
