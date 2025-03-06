import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from './components/Header';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
  </div>
);

const CommentForm = ({ postId, onCommentAdded, parentId }) => {
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
          parentId,
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

const Comment = ({ comment, onCommentAdded }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(comment.replies || []);

  const handleReplyAdded = (newReply) => {
    setReplies([...replies, newReply]);
    setShowReplyForm(false);
  };

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
    <div className="py-4 border-b border-gray-700 last:border-0 comment-appear">
      <div className="flex justify-between items-start mb-1">
        <Link 
          to={`/profile/${comment.user?.userName}`}
          className="text-indigo-400 font-medium hover:text-indigo-300"
        >
          {comment.user?.userName || 'Unknown User'}
        </Link>
        <span className="text-sm text-gray-400">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-gray-300">{comment.content}</p>
      
      <div className="mt-2 flex gap-4">
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Reply
        </button>
      </div>

      {showReplyForm && (
        <div className="mt-3 ml-8">
          <CommentForm 
            postId={comment.post} 
            parentId={comment._id}
            onCommentAdded={handleReplyAdded}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-3 border-l-2 border-gray-700 pl-4">
          {replies.map(reply => (
            <Comment key={reply._id} comment={reply} />
          ))}
        </div>
      )}
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
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLikeCount(data.likes);
        setIsLiked(!isLiked);
        setLikedPosts(prev => {
          const newLikedPosts = new Set(prev);
          if (data.isLiked) {
            newLikedPosts.add(id);
          } else {
            newLikedPosts.delete(id);
          }
          return newLikedPosts;
        });
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          fetch(`/api/posts/auth/${id}`, { credentials: 'include' }),
          fetch(`/api/comments/post/${id}`, { credentials: 'include' })
        ]);

        if (postResponse.status === 401 || commentsResponse.status === 401) {
          navigate('/login');
          return;
        }

        if (!postResponse.ok) throw new Error('Failed to fetch post');
        if (!commentsResponse.ok) throw new Error('Failed to fetch comments');

        const [postData, commentsData] = await Promise.all([
          postResponse.json(),
          commentsResponse.json()
        ]);

        setPost(postData);
        setComments(commentsData);
        setLikeCount(postData.likes ? postData.likes.length : 0);
        setIsLiked(postData.likes ? postData.likes.includes(postData.user?._id) : false);
        setLikedPosts(prev => new Set([id]));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
    
    const interval = setInterval(fetchPostAndComments, 30000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;
  if (!post) return <div className="text-gray-400 text-center mt-8">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-900">


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

        <div className="bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700 post-card">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-indigo-600 text-white mb-4">
              {post.type}
            </span>
            
            <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                  isLiked ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                <svg 
                  className={`w-5 h-5 ${isLiked ? 'fill-current' : 'stroke-current'}`}
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="font-medium">{likeCount}</span>
              </button>
              
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{comments.length} comments</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Posted by</span>
              <Link 
                to={`/profile/${post.user?.userName}`}
                className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
              >
                {post.user ? post.user.userName : 'Unknown User'}
              </Link>
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
            
            <CommentForm id="comment-form" postId={id} onCommentAdded={handleCommentAdded} />

            <div className="mt-8 space-y-4">
              {comments.map((comment) => (
                <Comment key={comment._id} comment={comment} onCommentAdded={handleCommentAdded} />
              ))}
              {comments.length === 0 && (
                <p className="text-gray-400 text-center">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => document.getElementById('comment-form').scrollIntoView({ behavior: 'smooth' })}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostDetail;

<style jsx global>{`
  @keyframes fade-in-down {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>