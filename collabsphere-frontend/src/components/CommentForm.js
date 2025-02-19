import React, { useState } from 'react';

const CommentForm = ({ postId, onCommentAdded, parentId }) => {  // Add parentId prop
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          postId,
          content: comment,
          parentId: parentId || null  // Include parentId in request
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      const newComment = await response.json();
      onCommentAdded(newComment.data);  // Make sure to access .data property
      setComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex flex-col space-y-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          rows="3"
        />
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="self-end px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
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
      <p className="text-gray-300">{comment.content}</p>
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
        const response = await fetch(`/api/comments/${postId}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch comments');
        const data = await response.json();
        setComments(data);
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