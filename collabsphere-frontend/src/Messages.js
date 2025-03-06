import React, { useState, useEffect , useRef} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './components/Header';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const { userId } = useParams();

    useEffect(() => {
        fetchMessages();
        getCurrentUser();
    }, []);

    useEffect(() => {
        if (searchUsername.trim().length > 0) {
            searchUsers();
        } else {
            setUsers([]);
        }
    }, [searchUsername]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedConversation]);

    useEffect(() => {
        if (selectedConversation) {
            const unreadMessages = messages.filter(m => 
                !m.read && 
                m.recipient._id === currentUser?._id &&
                (m.sender._id === selectedConversation || m.recipient._id === selectedConversation)
            );
            
            unreadMessages.forEach(message => markAsRead(message._id));
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (userId) {
            setSelectedConversation(userId);
            setSelectedUser(null);
        }
    }, [userId]);

    const getCurrentUser = async () => {
        try {
            const response = await fetch('/api/profile/me', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch user profile');
            }
            
            const userData = await response.json();
            if (userData?.data) {
                setCurrentUser(userData.data);
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (err) {
            console.error('Error fetching current user:', err);
            setError(err.message || 'Failed to fetch user profile');
        }
    };

    const searchUsers = async () => {
        try {
            const response = await fetch(`/api/users/search?username=${searchUsername}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error searching users:', err);
            setUsers([]);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Invalid messages data received');
            }
            
            setMessages(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Failed to fetch messages');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || (!selectedUser && !selectedConversation)) return;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipientId: selectedUser?._id || selectedConversation,
                    content: newMessage
                })
            });

            if (!response.ok) throw new Error('Failed to send message');

            const message = await response.json();
            setMessages([message, ...messages]);
            setNewMessage('');
            fetchMessages();
        } catch (err) {
            setError(err.message);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await fetch(`/api/messages/${messageId}/read`, {
                method: 'PUT',
                credentials: 'include'
            });
            fetchMessages();
        } catch (err) {
            console.error('Error marking message as read:', err);
        }
    };

    const groupMessagesByConversation = () => {
        const conversationsMap = new Map();
        
        messages.forEach(message => {
            if (!message.sender || !message.recipient) return;

            const otherUserId = message.sender._id === currentUser?._id ? 
                message.recipient._id : message.sender._id;
            const otherUserName = message.sender._id === currentUser?._id ? 
                (message.recipient.userName || 'Deleted User') : 
                (message.sender.userName || 'Deleted User');
            
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    userName: otherUserName,
                    messages: []
                });
            }
            conversationsMap.get(otherUserId).messages.push(message);
        });

        return Array.from(conversationsMap.entries())
            .filter(([userId]) => userId)
            .map(([userId, data]) => ({
                userId,
                userName: data.userName,
                messages: data.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
                lastMessage: data.messages[0],
                unreadCount: data.messages.filter(m => 
                    !m.read && 
                    m.recipient._id === currentUser?._id && 
                    m.sender
                ).length
            }));
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-cyan-600 border-t-transparent"></div>
        </div>
    );

    const conversations = groupMessagesByConversation();

    const renderMessage = (message) => (
        <div
            key={message._id}
            className={`p-4 rounded-lg ${
                message.sender._id === currentUser?._id
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 ml-12 shadow-md'
                    : 'bg-slate-800/60 mr-12 shadow-md'
            }`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-300 text-sm">
                    {message.sender.userName || 'Deleted User'}
                </span>
                <span className="text-gray-400 text-xs">
                    {new Date(message.createdAt).toLocaleString()}
                </span>
            </div>
            <p className="text-white">{message.content}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900">
            
            {/* Background gradient blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-600 opacity-20 blur-3xl"></div>
                <div className="absolute top-60 -left-40 h-96 w-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Conversations List */}
                    <div className="md:col-span-1 space-y-4">
                        <input
                            type="text"
                            placeholder="Search username..."
                            value={searchUsername}
                            onChange={(e) => setSearchUsername(e.target.value)}
                            className="w-full p-3 rounded-lg bg-blue-900/30 backdrop-blur-sm text-white border border-blue-700/50 focus:border-cyan-500 focus:ring-cyan-500"
                        />
                        
                        {users.length > 0 && (
                            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/50 rounded-lg">
                                {users.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setSearchUsername('');
                                            setSelectedConversation(user._id);
                                        }}
                                        className="p-3 hover:bg-blue-800/40 cursor-pointer text-white"
                                    >
                                        {user.userName}
                                    </div>
                                ))}
                            </div>
                        )}

                        {conversations.length > 0 ? (
                            conversations.map(conv => (
                                <div
                                    key={conv.userId}
                                    onClick={() => {
                                        setSelectedConversation(conv.userId);
                                        setSelectedUser(null);
                                    }}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                                        selectedConversation === conv.userId
                                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg'
                                            : 'bg-blue-900/30 backdrop-blur-sm hover:bg-blue-800/40 border border-blue-700/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-medium">{conv.userName}</span>
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-yellow-500 text-slate-900 px-2 py-1 rounded-full text-xs">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-300 text-sm truncate mt-1">
                                        {conv.lastMessage.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="bg-blue-900/30 backdrop-blur-sm rounded-lg p-6 text-center border border-blue-700/50">
                                <svg className="w-12 h-12 mx-auto text-cyan-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-gray-300">No conversations yet</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Search for users to start a conversation
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Chat Area */}
                    <div className="md:col-span-2 bg-blue-900/30 backdrop-blur-sm rounded-lg p-4 flex flex-col h-[800px] border border-blue-700/50">
                        {selectedConversation ? (
                            <>
                                <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-4" ref={scrollRef}>
                                    {messages
                                        .filter(m => 
                                            m.sender._id === selectedConversation || 
                                            m.recipient._id === selectedConversation
                                        )
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                        .map(renderMessage)}
                                </div>

                                <form onSubmit={sendMessage} className="mt-4 border-t border-blue-700/50 pt-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-grow p-3 rounded-lg bg-slate-800/70 text-white border border-blue-700/50 focus:border-cyan-500 focus:ring-cyan-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:hover:from-cyan-600 disabled:hover:to-blue-600"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                <svg className="w-16 h-16 mb-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                <p className="text-lg">Select a conversation to start chatting</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Or search for a user to start a new conversation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;