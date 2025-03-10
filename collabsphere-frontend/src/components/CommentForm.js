import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import axios from '../utils/axios';

const CommentForm = ({ postId, onCommentAdded, parentId }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const validateComment = (content) => {
    if (!content.trim()) {
      setValidationError('Comment cannot be empty');
      return false;
    }

    if (content.length > 1000) {
      setValidationError('Comment cannot be more than 1000 characters');
      return false;
    }

    // Check for URLs in content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    for (const url of urls) {
      try {
        new URL(url);
      } catch (e) {
        setValidationError('Invalid URL found in comment');
        return false;
      }
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateComment(comment)) {
      return;
    }

    const sanitizedComment = DOMPurify.sanitize(comment.trim());
    
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/comments', {
        postId,
        content: sanitizedComment,
        parentId: parentId || null
      });

      onCommentAdded(response.data.data);
      setComment('');
      setValidationError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    validateComment(newComment);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex flex-col space-y-3">
        <textarea
          value={comment}
          onChange={handleChange}
          placeholder="Add a comment..."
          className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${
            validationError ? 'border-red-500' : 'border-gray-600'
          } text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 resize-none overflow-y-auto whitespace-pre-wrap break-words`}
          rows="3"
          maxLength={1000}
          style={{ minHeight: '100px', maxHeight: '300px' }}
        />
        {validationError && (
          <p className="text-sm text-red-400">{validationError}</p>
        )}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {comment.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim() || !!validationError}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </form>
  );
};

const CommentItem = ({ comment }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="py-4 border-b border-gray-700 last:border-0">
      <div className="flex justify-between items-start mb-1">
        <span className="text-indigo-400 font-medium">
          {comment.user?.userName || 'Unknown User'}
        </span>
        <span className="text-sm text-gray-400">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 whitespace-pre-wrap break-words">{comment.content}</p>
      </div>
    </div>
  );
};

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllComments, setShowAllComments] = useState(false);

  React.useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/comments/post/${postId}`);
        setComments(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  if (loading) return <div className="text-gray-400">Loading comments...</div>;
  if (error) return <div className="text-red-500">Error loading comments: {error}</div>;

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  return (
    <div className="mt-8 border-t border-gray-700 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h2>
      </div>

      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      <div className="mt-6 space-y-2">
        {displayedComments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} />
        ))}
      </div>

      {hasMoreComments && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="mt-4 text-indigo-400 hover:text-indigo-300"
        >
          View all {comments.length} comments
        </button>
      )}
    </div>
  );
};

export default Comments;