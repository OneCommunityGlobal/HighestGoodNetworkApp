import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPosts, updatePost } from '../../actions/sendSocialMediaPosts';
import { Label, Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';

const SocialMediaPostDetails = () => {
  const { postId } = useParams(); // Get post ID from URL
  
  const [post, setPost] = useState(null);
  
  const [editableContent, setEditableContent] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableTime, setEditableTime] = useState('');
  const [imageBase64, setImageBase64] = useState(''); // State for Base64 image
  const [refreshTrigger, setRefreshTrigger] = useState(false); // 🔄 Auto-refresh trigger


  useEffect(() => {
    console.log("Post ID from URL:", postId);

    const getPost = async () => {
      try {
        const posts = await fetchPosts();
        if (!posts || posts.length === 0) {
          console.error("No posts found!");
          return;
        }

        const foundPost = posts.find((p) => String(p._id) === String(postId));

        if (foundPost) {
          setPost(foundPost);
          setEditableContent(foundPost.textContent || '');

          const formattedDate = foundPost.scheduledDate || '';
          const formattedTime = foundPost.scheduledTime?.padStart(5, '0') || '';

          setEditableDate(formattedDate);
          setEditableTime(formattedTime);
          setImageBase64(foundPost.base64Srcs?.[0] || '');

          
        } else {
          console.error("Post not found with ID:", postId);
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

    getPost();
  }, [postId, refreshTrigger, imageBase64]); // 🔄 Re-fetch on image change

  // Function to handle new image upload and convert to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]); // Extract Base64 string (without data type prefix)
      };
      reader.readAsDataURL(file);
    }
  };


  const handleUpdatePost = async () => {

    if (editableContent.length > 280) {
      toast.error("Post cannot exceed 280 characters. Please shorten your content.");
      return;
    }


  const scheduledDateTime = new Date(`${editableDate}T${editableTime}`);
  const currentDateTime = new Date();


  if (scheduledDateTime <= currentDateTime) {
    toast.error("The selected date and time must be greater than the current date and time.");
    return; 
  }
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
        toast.success("Post updated successfully!");
        setRefreshTrigger((prev) => !prev); // 🔄 Toggle trigger to refresh the component
      } else {
        toast.error("Failed to update post.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Error updating post.");
    }
  };

  if (!post) return <p style={{ textAlign: 'center', fontSize: '18px', color: 'gray' }}>Loading post details...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Edit Post Details</h2>
      
      <Label for="postContent">Post Content</Label>
      <Input
        type="textarea"
        id="postContent"
        value={editableContent}
        onChange={(e) => setEditableContent(e.target.value)}
      />

     {/* <Label for="platform">Platform</Label>
      <Input
        type="textarea"
        id="platform"
        value={editableContent}
        onChange={(e) => setEditableContent(e.target.value)}
      /> */}

      <Label for="postDate">Scheduled Date</Label>
      <Input
        type="date"
        id="postDate"
        value={editableDate}
        onChange={(e) => setEditableDate(e.target.value)}
      />

      <Label for="postTime">Scheduled Time</Label>
      <Input
        type="time"
        id="postTime"
        value={editableTime}
        onChange={(e) => setEditableTime(e.target.value)}
      />

      <Label for="postImage">Post Image</Label>
      {imageBase64 ? (
        <img 
          src={`data:image/png;base64,${imageBase64}`} 
          alt="Post Image" 
          style={{ width: '100%', maxWidth: '300px', marginBottom: '10px', display: 'block' }} 
        />
      ) : (
        <p style={{ color: 'gray' }}>No Image Uploaded</p>
      )}

      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <Button color="primary" className="mt-3" onClick={handleUpdatePost}>
        Save Changes
      </Button>
    </div>
  );
};

export default SocialMediaPostDetails;
