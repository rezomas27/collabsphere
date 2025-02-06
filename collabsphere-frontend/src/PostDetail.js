import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './components/Header';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

const CommentForm = ({ postId, onCommentAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

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
          content: content.trim()
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      const newComment = await response.json();
      onCommentAdded(newComment.data);
      setContent('');
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          rows="3"
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="self-end px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
};

const Comment = ({ comment }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
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

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // Fetch post
        const postResponse = await fetch(`/api/posts/auth/${id}`, { 
          credentials: 'include' 
        });
        if (!postResponse.ok) {
          throw new Error('Failed to fetch post');
        }
        const postData = await postResponse.json();
        setPost(postData);

        // Fetch comments
        const commentsResponse = await fetch(`/api/comments/post/${id}`, {
          credentials: 'include'
        });
        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentsData = await commentsResponse.json();
        setComments(commentsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  if (!post) return <div className="text-gray-400 text-center mt-8">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <Header />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/posts')}
          className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 group"
        >
          <svg 
            className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Posts
        </button>

        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-indigo-600 text-white mb-4">
              {post.type}
            </span>
            
            <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Posted by</span>
              <span className="text-indigo-400 font-medium">
                {post.user ? post.user.userName : 'Unknown User'}
              </span>
            </div>
          </div>
          
          <p className="text-gray-300 whitespace-pre-wrap mb-8">{post.body}</p>

          {(post.github || post.demo) && (
            <div className="flex gap-6 mb-8">
              {post.github && (
                <a
                  href={post.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              )}
              {post.demo && (
                <a
                  href={post.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Demo
                </a>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-700 pt-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Comments ({comments.length})
            </h2>
            
            <CommentForm postId={id} onCommentAdded={handleCommentAdded} />

            <div className="mt-8 space-y-4">
              {comments.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
              {comments.length === 0 && (
                <p className="text-gray-400 text-center">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;